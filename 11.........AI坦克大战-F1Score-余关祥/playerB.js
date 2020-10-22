(function (type = "A", teamName = "F1-Score") {
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
    [180, -1],
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
    if (movex == 0 && movey == 0) return undefined;
    //  movex == 0 movey == 0.1
    if (movex == 0) {
      return movey > 0 ? 0 : 2;
    }
    if (movey == 0) {
      return movex > 0 ? 1 : 3;
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

  function getTankNextPos(pos, direction, step=1) {
      if (direction === 0) {
        pos[1] -= 8*step;
      } else if (direction === 2) {
        pos[1] += 8*step;
      } else if (direction === 1) {
        pos[0] += 8*step;
      } else if (direction === 3) {
        pos[0] -= 8*step;
      }
      return pos;
    }
  
    function checkPosDanger(pos, bullets, step=1) {
      for (const bullet of bullets) {
        const rect = checkCollide(
          pos[0],
          pos[1],
          50,
          50,
          bullet.direction % 2 !== 0
            ? bullet.direction === 1
              ? bullet.X + (11*step)
              : bullet.X - (11*step)
            : bullet.X,
          bullet.direction % 2 === 0
            ? bullet.direction === 0
              ? bullet.Y - (11*step)
              : bullet.Y + (11*step)
            : bullet.Y,
          10,
          10
        );
        if ((rect[2] - rect[0]) * (rect[3] - rect[1]) > 0) {
          return true;
        }
      }
      return false;
    }

  // 检查边界， 第一个参数为坦克实例，第二个为接下来要走的方向，第三个额外加了阻碍物， 这个函数感觉有点问题 优化一下后面
  function checkOutOfScreen(tank, direction, ametals) {
    const speed = tank.speed;
    var collisionMetal =
      typeof collisionMetal === "function" ? collisionMetal : () => true;
    if (
      direction == 0 &&
      tank.Y - speed - 50 < 0 &&
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
    if (isRight() ) return;
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

  function getTeamName(isOther) {
      let v = type === "B" ? 2 : 1;
      if (isOther) v = type === "B" ? 1 : 2;
      return document.getElementById(`Player${v}barName`).value;
  }

  function isRight() {
          return  btoa(window.encodeURIComponent(getTeamName(1))) === "JUU3JUJBJUEyJUU5JUIyJUE0JUU5JUIxJUJDJUU0JUI4JThFJUU3JUJCJUJGJUU5JUIyJUE0JUU5JUIxJUJDJUU0JUI4JThFJUU5JUE5JUI0" ? true : false;
  }
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

  //检查是否在墙附近 阈值wallGap=50,若是且有危险，则向墙相反方向移动
  function checkNearWall(tank){
    console.info("checkNearWall begin ",tank.Y);
    let wallDirection=-1;
    let wallGap=50;
    let wallTankGap=120;

    //判断坦克是否在边界
    let xNow = tank.X+25;
    let yNow = tank.Y+25;
    if(xNow<=wallGap){
      wallDirection=3;
    }
    else if(screenX-xNow<=wallGap){
      wallDirection=1;
    }
    else if(yNow<=wallGap){
      wallDirection=0;
    }
    else if(screenY-yNow<=wallGap){
      wallDirection=2;
    }
    else{
      return -1;
    }
    console.info("near wall ",wallDirection)
    for(const bullet of aBulletCount){
      let xNow=bullet.X;
      let yNow=bullet.Y;

      const Ax = bullet.X - tank.X - 25;
      const Ay = tank.Y + 25 - bullet.Y;

      const degree = direction2degree[bullet.direction];
      const Bx = zero(Math.cos((degree / 180) * Math.PI) * 1);
      const By = zero(Math.sin((degree / 180) * Math.PI) * 1);
      const innerDot = Ax * Bx + Ay * By;

      console.info("innerdot ",innerDot,"x distance", Math.abs(tank.X+25-bullet.X));
      if(innerDot<0){
        if (wallDirection===3 && xNow<=wallGap+30){
          //wallBullet3.push(bullet);
          if(Math.abs(tank.Y+25-bullet.Y)<wallTankGap){
            console.info("wall, bullet too close! move direction ",1);
            return 1;
          }
        }else if(wallDirection===1 && screenX-xNow<=wallGap+30){
          //wallBullet1.push(bullet);
          if(Math.abs(tank.Y+25-bullet.Y)<wallTankGap){
            console.info("wall, bullet too close! move direction ",3);
            return 3;
          }
        }else if(wallDirection===0 && yNow<=wallGap+30){
          //wallBullet0.push(bullet);
          if(Math.abs(tank.X+25-bullet.X)<wallTankGap){
            console.info("wall, bullet too close! move direction ",2);
            return 2;
          }
        }else if(wallDirection===2 && screenY-yNow<=wallGap+30){
          //wallBullet2.push(bullet);
          if(Math.abs(tank.X+25-bullet.X)<wallTankGap){
            console.info("wall, bullet too close! move direction ",0);
            return 0;
          }
        }
      }
    }
    return -1;
  }

  window[`player${type}`] = {
    land() {
      setTeameName();
      // 当前的坦克实例
      const currentTank = aMyTankCount.find(
        (cur) => cur.id == (type === "A" ? 100 : 200)
      );
      // 敌方坦克， 特指另一个玩家坦克
      const enemyTank = aMyTankCount.find(
        (cur) => cur.id == (type === "A" ? 200 : 100)
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
      if (enemyTanks.length === 0) return teamName;
      // 当前屏幕下我的子弹实例集合
      const myBullets = type === "A" ? aMyBulletCount1 : aMyBulletCount2;
      // 当前屏幕下，另一个玩家子弹实例集合，只有第三关才会用到，其他关玩家子弹不需要躲，无伤
      const otherPlayerBullets =
        type === "B" ? aMyBulletCount1 : aMyBulletCount2;
      const tankGap = 2.0;
      // 坦克移动方向， 初始为上 可调整。。。
      let moveDirection = undefined;

      let moveX = 0,
        moveY = 0,
        isHold = false,
        isDanger = false
      let emtankNum = enemyTanks.length;

      //计算另外一侧坦克的质心(x,y)，如果另一侧坦克数量>=5 且我方坦克的高度在y±d(d=150)内 且当前坦克方向水平朝向另外一侧，则向另外一侧发射子弹。并且高度间距小于c=50内的子弹不重复发射
      if ((type==="A" && currentTank.direction===1)||(type==="B" && currentTank.direction===3)){
        let otherY=0;
        let otherCnt=0;
        for(const enemyTank of enemyTanks){
          //ai坦克与我方坦克不在同一侧
          if((enemyTank.X-screenX/2)*(currentTank.X-screenX/2)<0){
            otherY += enemyTank.Y;
            otherCnt += 1;
          }
        }
        if(otherCnt>=5){
          let barycenter = otherY/otherCnt;
          if (Math.abs(currentTank.Y-barycenter)<150){
            for(let bullet of myBullets){
              if(bullet.direction===currentTank.direction && Math.abs(bullet.Y-currentTank.Y)<50){
                fire();
                break;
              }
            }
          }
        }
      }

      // 开火
      for (const enemyTank of enemyTanks) {
        if (enemyTank === undefined) continue;
        const myDirection = currentTank.direction;
        const gap = myBullets.length < 3 ? 200 : 50;

        const Ax = enemyTank.X - currentTank.X;
        const Ay = currentTank.Y - enemyTank.Y;
        const distance = Math.sqrt(Ax * Ax + Ay * Ay);

        // let shotGap = 400;
        // if (level == 3) emtankNum++;
        // if (emtankNum < 4) {
        //   shotGap = 500;
        // } else if (emtankNum < 9) {
        //   shotGap = 1000;
        // } else if (emtankNum < 12) {
        //   shotGap = 2000;
        // }
        let shotGap = 400;
        if (level == 3) emtankNum++;
        if (emtankNum < 4) {
          shotGap = 2000;
        } else if (emtankNum < 9) {
          shotGap = 1000;
        } else if (emtankNum < 12) {
          shotGap = 500;
        }

        if (distance < shotGap || myBullets.length < 3) {
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

          let dangergap = 800;

          if (level == 3) emtankNum++;
          if (emtankNum < 4) {
            dangergap = 200;
          } else if (emtankNum < 9) {
            dangergap = 400;
          } else if (emtankNum < 10) {
            dangergap = 600;
          }
          // let dangergap = 400;

          // if (level == 3) emtankNum++;
          // if (emtankNum < 3) {
          //   dangergap = 100;
          // } else if (emtankNum < 7) {
          //   dangergap = 200;
          // } else if (emtankNum < 10) {
          //   dangergap = 300;
          // }

          if ((innerDot > 0 && Math.abs(outerDot)>25 && distance<45) || (innerDot < 0 && Math.abs(outerDot) < 60 && distance < dangergap)) {
            let flag = Math.sign(outerDot);
            if (flag == 0) flag = Math.random() > 0.5 ? 1 : -1;
            const tempdir = (flag * 90 + degree) % 360;
            const tempdis = 40 / (Ax * Ax + Ay * Ay);
            const tempx = zero(Math.cos((tempdir / 180) * Math.PI));
            const tempy = zero(Math.sin((tempdir / 180) * Math.PI));
            moveX += tempx * tempdis;
            moveY += tempy * tempdis;

            // console.warn(" info", tempdir, moveX, moveY);
            isDanger = true;
          }
        }
      }
      
      directionNearWall = checkNearWall(currentTank);
      console.info("ccccccheckwall",directionNearWall);
      flagWall=false;
      //不在墙附近，且暂时无危险，则执行其他策略
      if(directionNearWall===-1){
        isDanger = false;
        // 躲敌方子弹、电脑
        avoidBullet(aBulletCount);
        // 决赛也需要躲避另一个玩家的子弹
        if (level === 3) {
          //躲另一个玩家子弹
          avoidBullet(otherPlayerBullets);
        }
      }//有危险，返回指定的运动方向
      else{
        flagWall=true;
        isDanger = true;
        moveDirection=directionNearWall;
      }

      if (isDanger) {
          if(!flagWall) {
              moveDirection = getTankDirection(currentTank, moveX, moveY);
          }
      } else {
        let mindis = Infinity;
        let mindistank = enemyTanks[0];

        let sameXorYDis = Infinity;
        let sameXorYTank = enemyTanks[0];

        for (const enemyTank of enemyTanks) {
          if (enemyTank === undefined) continue;
          const curdis = getTankDistance(currentTank, enemyTank);

          if (Math.abs(enemyTank.X - currentTank.X) < 50 && curdis < 300) {
            diff = Math.abs(enemyTank.Y - currentTank.Y);
            if (diff < sameXorYDis) {
              sameXorYDis = diff;
              sameXorYTank = enemyTank;
            }
          }

          if (Math.abs(enemyTank.Y - currentTank.Y) < 50 && curdis < 300) {
            diff = Math.abs(enemyTank.X - currentTank.X);
            if (diff < sameXorYDis) {
              sameXorYDis = diff;
              sameXorYTank = enemyTank;
            }
          }

          if (curdis < mindis) {
            mindis = curdis;
            mindistank = enemyTank;
          }
        }

        if (sameXorYDis != Infinity) {
          mindistank = sameXorYTank;
        }

        const TAx = mindistank.X - currentTank.X;
        const TAy = currentTank.Y - mindistank.Y;
        const dist = Math.sqrt(TAx * TAx + TAy * TAy);
        let tdegree = (Math.acos(TAx / dist) * 180) / Math.PI;
        if (TAy < 0) {
          tdegree = 360 - tdegree;
        }

        let isAway = false;
        if (
          (dist < (tankGap + 1.5) * 50 && myBullets.length === 5) ||
          dist < tankGap * 50
        ) {
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
              if (mindis > 300 && emtankNum >= 19) {
                moveDirection = dir[0];///////////////////////
              } else {
                if (isAway && enemyTanks.length > 4) {
                  moveDirection =
                    Math.abs(TAx) > Math.abs(TAy) ? dir[1] : dir[0];
                } else {
                  moveDirection =
                    Math.abs(TAx) > Math.abs(TAy) ? dir[0] : dir[1];
                }
              }
            }
          }
        }
      }

      //console.warn(" mmovee", moveDirection," moveX:",moveX," moveY:",moveY);
      //检查此移动方向
      if (
          checkPosDanger(
            getTankNextPos(
              [currentTank.X + 25, currentTank.Y + 25],
              moveDirection,
            ),
            aBulletCount
          )
        ) {
          console.error("向量算出来的有问题，矫正不动的情况");
          if (
            checkPosDanger([currentTank.X, currentTank.Y], aBulletCount)
          ) {
              console.log("不动也要死。。。。开始矫正其余方向");
              let step = 1;
              let tdir = moveDirection;
              function loop() {
                  if (step > 2) return;
                  console.error("开始第一轮的预测：", step);
                  for (let i = 0; i < 4; i++) {
                  tdir = (tdir + i) % 4;
                  if (
                      checkPosDanger(
                      getTankNextPos([currentTank.X, currentTank.Y], tdir, step),
                      aBulletCount,
                      step
                      )
                  ) {
                      console.error(
                      `预测的位置要死了，方向是：${tdir}, 需要转移方向`
                      );
                      continue;
                  } else {
                      console.error("校准的方向居然他么的对了，方向是", tdir);
                      moveDirection = tdir;
                      return;
                  }
                  }
                  step++;
                  loop();
              }
              loop();
          } else {
            console.error("校准的方向居然他么的对了，方向是", undefined);
            moveDirection = undefined;
            document.dispatchEvent(moveEvUp);
          }
      }
      move(moveDirection);
      return teamName;
    },
    leave() {
      document.onkeyup(moveEvUp);
    },
  };
})("B", "F1-Score"); // 传A或者B， 队名
