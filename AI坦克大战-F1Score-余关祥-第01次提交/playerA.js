(function(type = "A", teamName = "F1-Score") {
  if (!["A", "B"].includes(type)) type = "A"; // exception
  // events:
  const moveEv = new Event("keydown");
  const moveEvUp = new Event("keyup");
  const fireEv = new Event("keydown");

  const direction2degree = [90, 0, 270, 180];
  const degree2direction = new Map([
    [90, -1],
    [0, 1],
    [270, 1],
    [180, -1]
  ]);
  // 判0 趋近于0
  function zero(value) {
    if (value < Math.pow(10, -6) && value > -Math.pow(10, -6)) return 0;
    else return value;
  }
  function getDegree2Dir(degree) {
    let tempdir = [];
    degree = degree % 360;
    if (degree > 0 && degree < 90) {
      tempdir = [1, 0];
    } else if (degree > 90 && degree < 180) {
      tempdir = [3, 0];
    } else if (degree > 180 && degree < 270) {
      tempdir = [3, 2];
    } else if (degree > 270 && degree < 360) {
      tempdir = [1, 2];
    }
    if (degree == 0) tempdir.push(1);
    if (degree == 90) tempdir.push(0);
    if (degree == 180) tempdir.push(3);
    if (degree == 270) tempdir.push(2);
    return tempdir;
  }
  function getTankDirection(tank, movex, movey) {
    if(movex == 0 && movey == 0 ) return  undefined;
    //  movex == 0 movey == 0.1
    if(movex == 0){
      return  movey > 0 ? 0: 2;
    }
    if(movey == 0) {
      return movex > 0 ? 1: 3;
    }

    let dir1 = 1;
    let dir2 = 0;
    if (movex > 0) dir1 = 1;
    else dir1 = 3;

    if (movey > 0) dir2 = 0;
    else dir2 = 2;

    const isOutOfScreen1 = checkOutOfScreen(tank, dir1, ametal);
    const isOutOfScreen2 = checkOutOfScreen(tank, dir2, ametal);

    if (!isOutOfScreen1 && !isOutOfScreen2) {
      if (Math.abs(movex) > Math.abs(movey)) {
        return dir1;
      } else {
        return dir2;
      }
    }

    if (isOutOfScreen1) {
      return dir2;
    } else {
      return dir1;
    }
  }
  function getTankDistance(tankA, tankE) {
    const diffx = tankA.X - tankE.X;
    const diffy = tankA.Y - tankE.Y;
    return Math.sqrt(diffx * diffx + diffy * diffy);
  }
  // 检查边界， 第一个参数为坦克实例，第二个为接下来要走的方向，第三个额外加了阻碍物， 这个函数感觉有点问题 优化一下后面
  function checkOutOfScreen(tank, direction, ametals) {
    const speed = tank.speed;
    var collisionMetal =
      typeof collisionMetal === "function" ? collisionMetal : () => true;
    if (
      direction == 0 &&
      tank.Y - speed-50 < 0 &&
      collisionMetal(tank.X, tank.Y - speed, tankWidth)
    ) {
      return true;
    } else if (
      direction == 1 &&
      tank.X + speed > screenX - tankWidth &&
      collisionMetal(tank.X + speed, tank.Y, tankWidth)
    ) {
      return true;
    } else if (
      direction == 2 &&
      tank.Y + speed > screenY - tankWidth &&
      collisionMetal(tank.X, tank.Y + speed, tankWidth)
    ) {
      return true;
    } else if (
      direction == 3 &&
      tank.X - speed < 0 &&
      collisionMetal(tank.X - speed, tank.Y, tankWidth)
    ) {
      return true;
    }

    return false;
  }

  // 移动方向哈： direction就是方向值：0 up  1 right 2 down 3 left
  function move(direction) {
    if (direction === undefined) return;
    let keyCode = undefined;
    switch (direction) {
      case 0:
        keyCode = type === "A" ? 87 : 38;
        break;
      case 2:
        keyCode = type === "A" ? 83 : 40;
        break;
      case 3:
        keyCode = type === "A" ? 65 : 37;
        break;
      case 1:
        keyCode = type === "A" ? 68 : 39;
        break;
    }
    if (keyCode !== undefined) {
      moveEv.keyCode = keyCode;
      moveEvUp.keyCode = keyCode;
      document.onkeydown(moveEv);
    }
  }
  // 开火
  const fire = () => {
    fireEv.keyCode = type === "A" ? 32 : 8;
    document.dispatchEvent(fireEv);
  };

  const setTeameName = (() => {
    let i = 0;
    return () => {
      if (i > 0) return;
      document.getElementById(
        `Player${type === "B" ? 2 : 1}Name`
      ).textContent = teamName;
      i++;
    };
  })();

  // 判断某个方向上是否已经有我的子弹
  function haveMyBullet(tank, enemyTank, mybullets, gap) {
    let flag = false;
    const direction = tank.direction;
    for (let bullet of mybullets) {
      if (bullet.direction === direction) {
        // 检查上
        if (
          direction === 0 &&
          Math.abs(bullet.X - tank.X) < gap &&
          enemyTank.Y < bullet.Y
        ) {
          flag = true;
          return flag;
        } //检查下
        else if (
          direction === 2 &&
          Math.abs(bullet.X - tank.X) < gap &&
          enemyTank.Y > bullet.Y
        ) {
          flag = true;
          return flag;
        } // 检查右
        else if (
          direction === 1 &&
          Math.abs(bullet.Y - tank.Y) < gap &&
          enemyTank.X > bullet.X
        ) {
          flag = true;
          return flag;
        } // 检查左
        else if (
          direction === 3 &&
          Math.abs(bullet.Y - tank.Y) < gap &&
          enemyTank.X < bullet.X
        ) {
          flag = true;
          return flag;
        }
      }
    }
    return flag;
  }

  window[`player${type}`] = {
    land() {
      setTeameName();
      // 当前的坦克实例
      const currentTank = aMyTankCount.find(
        cur => cur.id == (type === "A" ? 100 : 200)
      );
      // 敌方坦克， 特指另一个玩家坦克
      const enemyTank = aMyTankCount.find(
        cur => cur.id == (type === "A" ? 200 : 100)
      );
      // 当前坦克挂了或者游戏直接结束了
      if (!currentTank) return teamName;
      if (type === "A" && player1Die) return teamName;
      if (type === "B" && player2Die) return teamName;

      // 当前游戏关数  level 1为第一关battle  2为车轮战积分 3位决赛的胜负
      let level = 1;
      if (playerNum === 2) {
        if (ametal.length > 0) {
          level = 3;
        } else {
          level = 2;
        }
      }
      //下面是方便读取的全局数据的别名
      // 所有的敌方坦克实例数组 第三关会将另一个玩家包含进去，其他则只是AI
      const enemyTanks = level === 3 ? [...aTankCount, enemyTank] : aTankCount;
      if(enemyTanks.length === 0) return teamName;
      // 当前屏幕下我的子弹实例集合
      const myBullets = type === "A" ? aMyBulletCount1 : aMyBulletCount2;
      // 当前屏幕下，另一个玩家子弹实例集合，只有第三关才会用到，其他关玩家子弹不需要躲，无伤
      const otherPlayerBullets =
        type === "B" ? aMyBulletCount1 : aMyBulletCount2;
      const tankGap = 2;
      // 坦克移动方向， 初始为上 可调整。。。
      let moveDirection = 0;

      let moveX = 0,
        moveY = 0,
        holdX = 0,
        holdY = 0,
        isHold = false,
        isDanger = false,
        isGo2Die = false;
      let emtankNum = enemyTanks.length
      // 开火
      for (const enemyTank of enemyTanks) {
        if (enemyTank === undefined) continue;
        const myDirection = currentTank.direction;
        const gap = 100;

        const Ax = enemyTank.X - currentTank.X;
        const Ay = currentTank.Y  - enemyTank.Y;
        const distance = Math.sqrt(Ax * Ax + Ay * Ay);

        let shotGap = 300;
        if(level == 3) emtankNum++
        if(emtankNum < 4){
            shotGap = 500
        }else if(emtankNum < 9) {
           shotGap = 1000
        }else if(emtankNum < 12) {
           shotGap = 2000;
        }


        if(distance < shotGap){
          // 当前朝向上
          if (
            myDirection === 0 &&
            enemyTank.Y < currentTank.Y &&
            Math.abs(enemyTank.X - currentTank.X) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
          // 当前朝向下边
          else if (
            myDirection === 2 &&
            enemyTank.Y > currentTank.Y &&
            Math.abs(enemyTank.X - currentTank.X) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
          // 当前朝向右边
          else if (
            myDirection === 1 &&
            enemyTank.X > currentTank.X &&
            Math.abs(enemyTank.Y - currentTank.Y) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
          // 当前方向朝向左边
          else if (
            myDirection === 3 &&
            enemyTank.X < currentTank.X &&
            Math.abs(enemyTank.Y - currentTank.Y) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
        }
      }

      // 躲避子弹，因为要区分第二关和第三关，所以封装为函数
      function avoidBullet(enemyBullets) {
        for (const bullet of enemyBullets) {
          const Ax = bullet.X - currentTank.X - 25;
          const Ay = currentTank.Y + 25 - bullet.Y;

          const degree = direction2degree[bullet.direction];
          const Bx = zero(Math.cos((degree / 180) * Math.PI) * 1);
          const By = zero(Math.sin((degree / 180) * Math.PI) * 1);

          const innerDot = Ax * Bx + Ay * By;
          const outerDot = Ax * By - Ay * Bx;

          const distance = Math.sqrt(Ax * Ax + Ay * Ay);
          let dangergap = 1200;

          if(level == 3) emtankNum++
          if(emtankNum < 4){
            dangergap = 300
          }else if(emtankNum < 9) {
            dangergap = 600
          }else if(emtankNum < 10) {
            dangergap = 800;
          }

          if (innerDot < 0 && Math.abs(outerDot) < 60 && distance < dangergap) {
            let flag = Math.sign(outerDot);
            if(flag == 0) flag = Math.random() > 0.5 ? 1: -1;
            const tempdir = (flag * 90 + degree) % 360;
            if ((Math.abs(Ax)>31 && Math.abs(Ax) <50) && (Math.abs(Ay)>31 && Math.abs(Ay) < 50)) {
                  if(tempdir == 0 || tempdir == 180){
                       holdX +=  degree2direction[tempdir]
                  }else{
                      holdY += degree2direction[tempdir]
                  }
                  isHold = true
            } 
            const tempdis = 40 / Math.sqrt(Ax * Ax + Ay * Ay);
            const tempx = zero(Math.cos((tempdir / 180) * Math.PI));
            const tempy = zero(Math.sin((tempdir / 180) * Math.PI));
            moveX += tempx * tempdis;
            moveY += tempy * tempdis;
            
            // console.warn(" info", tempdir, moveX, moveY);
            isDanger = true;
          }
        }
      }

      // 躲敌方子弹、电脑
      avoidBullet(aBulletCount);
      // 决赛也需要躲避另一个玩家的子弹
      if (level === 3) {
        //躲另一个玩家子弹
        avoidBullet(otherPlayerBullets);
      }
      if (isDanger) {
        if(isHold && holdY == 0 && holdX == 0) {
          moveDirection =4
        } else {
          moveDirection = getTankDirection(currentTank, moveX, moveY);
        }
      } else {
        let mindis = Infinity;
        let mindistank = enemyTanks[0];

        for (const enemyTank of enemyTanks) {
          if (enemyTank === undefined) continue;
          const curdis = getTankDistance(currentTank, enemyTank);
          if (curdis < mindis) {
            mindis = curdis;
            mindistank = enemyTank;
          }
        }

        const TAx = mindistank.X - currentTank.X;
        const TAy = currentTank.Y - mindistank.Y;
        const dist = Math.sqrt(TAx * TAx + TAy * TAy);
        let tdegree = (Math.acos(TAx / dist) * 180) / Math.PI;
        if (TAy < 0) {
          tdegree = 360 - tdegree;
        }

        let isAway = false;
        if ((dist < (tankGap + 1.5) * 50 && myBullets.length === 5) || dist < tankGap * 50) {
          tdegree += 180;
          isAway = false;
        }
        const dir = getDegree2Dir(tdegree);
        if (dir.length > 0) {
          if (dir.length == 1) moveDirection = dir[0];
          else {
            const isOutX = checkOutOfScreen(currentTank, dir[0], ametal);
            const isOutY = checkOutOfScreen(currentTank, dir[1], ametal);
            if (isOutX || isOutY) {
              moveDirection = isOutX ? dir[1] : dir[0];
            } else {
              if(mindis > 500 && emtankNum >= 18){
                 moveDirection = dir[0];
              } else {
                if (isAway && enemyTanks.length > 4) {
                  moveDirection = Math.abs(TAx) > Math.abs(TAy) ? dir[1] : dir[0];
                } else {
                  moveDirection = Math.abs(TAx) > Math.abs(TAy) ? dir[0] : dir[1];
                }
              }
            }
          }
        }
      }

      if(!isDanger) console.warn(" mmovee", moveDirection)
      move(moveDirection);
      return teamName;
    },
    leave() {
      document.onkeyup(moveEvUp);
    }
  };
})("A", "F1-Score"); // 传A或者B， 队名
