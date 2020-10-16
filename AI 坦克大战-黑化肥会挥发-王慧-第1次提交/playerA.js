(function(type = "A", teamName = "黑化肥会挥发") {
  if (!["A", "B"].includes(type)) type = "A"; 
  const moveEv = new Event("keydown");
  const moveEvUp = new Event("keyup");
  const fireEv = new Event("keydown");
  const direction2degree = [90, 0, 270, 180];
  const degree2direction = new Map([
    [90, 0],
    [0, 1],
    [360, 1],
    [270, 2],
    [180, 3]
  ]);
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
  function checkOutOfScreen(tank, direction, ametals) {
    const speed = tank.speed;
    var collisionMetal =
      typeof collisionMetal === "function" ? collisionMetal : () => true;
    if (
      direction == 0 &&
      tank.Y - speed - 100 < 0 &&
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
  
  function haveMyBullet(tank, enemyTank, mybullets, gap) {
    let flag = false;
    const direction = tank.direction;
    for (let bullet of mybullets) {
      if (bullet.direction === direction) {
        
        if (
          direction === 0 &&
          Math.abs(bullet.X - tank.X) < gap &&
          enemyTank.Y < bullet.Y
        ) {
          flag = true;
          return flag;
        } 
        else if (
          direction === 2 &&
          Math.abs(bullet.X - tank.X) < gap &&
          enemyTank.Y > bullet.Y
        ) {
          flag = true;
          return flag;
        } 
        else if (
          direction === 1 &&
          Math.abs(bullet.Y - tank.Y) < gap &&
          enemyTank.X > bullet.X
        ) {
          flag = true;
          return flag;
        } 
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
      
      const currentTank = aMyTankCount.find(
        cur => cur.id == (type === "A" ? 100 : 200)
      );
      
      const enemyTank = aMyTankCount.find(
        cur => cur.id == (type === "A" ? 200 : 100)
      );
     
      if (!currentTank || checkGameOver()) return teamName;
      if (type === "A" && player1Die) return teamName;
      if (type === "B" && player2Die) return teamName;
      let level = 1;
      if (playerNum === 2) {
        if (ametal.length > 0) {
          level = 3;
        } else {
          level = 2;
        }
      }
      
      const enemyTanks = level === 3 ? [...aTankCount, enemyTank] : aTankCount;
     
      const myBullets = type === "A" ? aMyBulletCount1 : aMyBulletCount2;
      
      const otherPlayerBullets =
        type === "B" ? aMyBulletCount1 : aMyBulletCount2;
      const tankGap = 1;
    
      let moveDirection = 0;
      let moveX = 0,
        moveY = 0,
        isDanger = false;
     
      for (const enemyTank of enemyTanks) {
        if (enemyTank === undefined) continue;
        const myDirection = currentTank.direction;
        const gap = 105;
        const dis = getTankDistance(currentTank, enemyTank);
        if(dis < screenY * 2/3) {
         
          if (
            myDirection === 0 &&
            enemyTank.Y < currentTank.Y &&
            Math.abs(enemyTank.X - currentTank.X) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
          
          else if (
            myDirection === 2 &&
            enemyTank.Y > currentTank.Y &&
            Math.abs(enemyTank.X - currentTank.X) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
         
          else if (
            myDirection === 1 &&
            enemyTank.X > currentTank.X &&
            Math.abs(enemyTank.Y - currentTank.Y) < gap &&
            !haveMyBullet(currentTank, enemyTank, myBullets, gap)
          ) {
            fire();
          }
          
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
     
      function avoidBullet(enemyBullets) {
        for (const bullet of enemyBullets) {
          const Ax = bullet.X - currentTank.X - 20;
          const Ay = currentTank.Y + 25 - bullet.Y;
          const degree = direction2degree[bullet.direction];
          const Bx = zero(Math.cos((degree / 180) * Math.PI) * 1);
          const By = zero(Math.sin((degree / 180) * Math.PI) * 1);
          const innerDot = Ax * Bx + Ay * By;
          const outerDot = Ax * By - Ay * Bx;
          const distance = Math.sqrt(Ax * Ax + Ay * Ay);
          const dangergap = Math.min(screenY / 5, screenX / 5);
          if (innerDot < 0 && Math.abs(outerDot) < 55 && distance < dangergap) {
            let flag = Math.sign(outerDot);
            if(flag == 0) flag = Math.random() > 0.5 ? 1 : -1;
            let tempdir = flag * 90 + degree;
            const tempdis = 40 / Math.sqrt(Ax * Ax + Ay * Ay);
            const tempx = zero(Math.cos((tempdir / 180) * Math.PI));
            const tempy = zero(Math.sin((tempdir / 180) * Math.PI));
            moveX += tempx * tempdis;
            moveY += tempy * tempdis;
            console.warn(" info", tempdir, moveX, moveY);
            isDanger = true;
          }
        }
      }
     
      avoidBullet(aBulletCount);
     
      if (level === 3) {
        avoidBullet(otherPlayerBullets);
      }
      if (isDanger) {
        moveDirection = getTankDirection(currentTank, moveX, moveY);
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
        if (dist < 60) {
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
              if (isAway && enemyTanks.length > 3) {
                moveDirection = Math.abs(TAx) > Math.abs(TAy) ? dir[1] : dir[0];
              } else {
                moveDirection = Math.abs(TAx) > Math.abs(TAy) ? dir[0] : dir[1];
              }
            }
          }
        }
       
      }
      move(moveDirection);
      return teamName;
    },
    leave() {
		setTeameName();
      document.onkeyup(moveEvUp);
    }
  };
})("A", "黑化肥会挥发");