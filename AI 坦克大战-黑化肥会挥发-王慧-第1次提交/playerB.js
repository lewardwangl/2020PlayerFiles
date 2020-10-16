window.playerB = new (class PlayerControl {
 
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp =  (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;
  }
  land() {
  
    var cur = undefined;
    var enr = undefined;
    aMyTankCount.forEach((element) => {
      var c = element;
      if (c["id"] == 200) {
        cur = c;
      }
      if (c["id"] == 100) {
        enr = c;
      }
    });
    const currentTank = cur;
    const enemyTank = enr;
    if (!currentTank) return;
    
    const enemyTanks = aTankCount;
    
    const enemyBullets = aBulletCount;
 
    const currentTankWH = 50;
   
    const bulletWH = 10;
    
    const currentTankX = currentTank.X;
    const currentTankY = currentTank.Y;
    const currentTankDirect = currentTank.direction;
    
    const myBullets = this.type === "A" ? aMyBulletCount1 : aMyBulletCount2;
    const eBullets = this.type === "A" ? aMyBulletCount2 : aMyBulletCount1;
   
    const myBulletLimit = 5;
    
    let moveDirection = undefined;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
  
    let Bullet = new Array(
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP
    );
    this.#calcBulletDistance(
      enemyBullets,
      currentTankX,
      currentTankY,
      Bullet,
      currentTankWH,
      bulletWH
    );
    this.#calcBulletDistance(
      eBullets,
      currentTankX,
      currentTankY,
      Bullet,
      currentTankWH,
      bulletWH
    );
    moveDirection = this.#avoidBullet(
      currentTankX,
      currentTankY,
      currentTankWH,
      Bullet,
      moveDirection
    );
    var lateEnemy = undefined;
    var misDistanceOfEnemy = currentTankWH * 100;
    var secruitydistance = currentTankWH * 6;
    var secruitylevel = enemyTanks.length;
    var firedirectdis = 4;
    var escapedir = 4;
    var fight = 6;
    var escapenum = 0;
    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemy.X,
        enemy.Y
      );
      if (secruitydistance > dis && enemyTanks.length >= 4) {
        escapenum++; 
      }
      if (misDistanceOfEnemy > dis) {
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
    if (undefined != enemyTank) {
      const enemydis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemyTank.X,
        enemyTank.Y
      );
      if (enemydis < misDistanceOfEnemy) {
        lateEnemy = enemyTank;
        firedirectdis = 1;
        escapedir = 1;
        fight = 3;
      }
    }
    if (secruitylevel <= 2 && undefined != enemyTank) {
      
      firedirectdis = 3;
      escapedir = 3;
      fight = 4;
    }
    if (moveDirection == undefined && escapenum < 4) {
     
      if (undefined != lateEnemy) {
        var disX = Math.abs(lateEnemy.X - currentTankX);
        var disY = Math.abs(lateEnemy.Y - currentTankY);
        var dis = this.#calcTwoPointDistance(
          currentTankX,
          currentTankY,
          lateEnemy.X,
          lateEnemy.Y
        );
        if (dis >=
          firedirectdis * currentTankWH
        ) {
         
          if (
             (disX < disY) &&
             (lateEnemy.Y < currentTankY) &&
             this.#DIRECTION.STOP == Bullet[1] && 
             this.#DIRECTION.STOP == Bullet[2] &&
             this.#DIRECTION.STOP == Bullet[3]
          ) {
            if (currentTankDirect != this.#DIRECTION.UP) {
              moveDirection = this.#DIRECTION.UP;
              console.log("炮口调整", moveDirection);
            }
          } else if (
             (disX < disY) && 
             (lateEnemy.Y >= currentTankY) && 
             this.#DIRECTION.STOP == Bullet[9] &&
             this.#DIRECTION.STOP == Bullet[10] && 
             this.#DIRECTION.STOP == Bullet[11]
          ) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              moveDirection = this.#DIRECTION.DOWN;
              console.log("炮口调整", moveDirection);
            }
          } else if (
            (disX > disY) && 
            (lateEnemy.X >= currentTankX) && 
            this.#DIRECTION.STOP == Bullet[3] &&
            this.#DIRECTION.STOP == Bullet[7] &&
            this.#DIRECTION.STOP == Bullet[11]
          ) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              moveDirection = this.#DIRECTION.RIGHT;
              console.log("炮口调整", moveDirection);
            }
          } else if (
            (disX > disY) && 
            (lateEnemy.X < currentTankX) &&
            this.#DIRECTION.STOP == Bullet[1] &&
            this.#DIRECTION.STOP == Bullet[4] &&
            this.#DIRECTION.STOP == Bullet[9]
          ) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              moveDirection = this.#DIRECTION.LEFT;
              console.log("炮口调整", moveDirection);
            }
          }
        }
        if (
          (disX > fight * currentTankWH || disY > fight * currentTankWH) &&
          dis > fight * currentTankWH
        ) {
         
          if (
            (disX < disY) &&
            (lateEnemy.Y < currentTankY) && 
            this.#DIRECTION.STOP == Bullet[1] &&
            this.#DIRECTION.STOP == Bullet[2] &&
            this.#DIRECTION.STOP == Bullet[3]
          ) {
            moveDirection = this.#DIRECTION.UP;
          } else if (
           (disX < disY) && 
          (lateEnemy.Y >= currentTankY) && 
            this.#DIRECTION.STOP == Bullet[9] &&
            this.#DIRECTION.STOP == Bullet[10] &&
            this.#DIRECTION.STOP == Bullet[11]
          ) {
            moveDirection = this.#DIRECTION.DOWN;
          } else if (
            (disX < disY) && 
          (lateEnemy.Y >= currentTankY) && 
            this.#DIRECTION.STOP == Bullet[3] &&
            this.#DIRECTION.STOP == Bullet[7] &&
            this.#DIRECTION.STOP == Bullet[11]
          ) {
            moveDirection = this.#DIRECTION.RIGHT;
          } else if (
            (disX < disY) && 
          (lateEnemy.Y >= currentTankY) && 
            this.#DIRECTION.STOP == Bullet[1] &&
            this.#DIRECTION.STOP == Bullet[4] &&
            this.#DIRECTION.STOP == Bullet[9]
          ) {
            moveDirection = this.#DIRECTION.LEFT;
          }
          console.log("战术前进", moveDirection);
        } else if (dis <
          escapedir * currentTankWH
        ) {
         
          if (
                (disX < disY) && 
          (lateEnemy.Y < currentTankY) &&
            this.#DIRECTION.STOP == Bullet[9] &&
            this.#DIRECTION.STOP == Bullet[10] &&
            this.#DIRECTION.STOP == Bullet[11]
          ) {
            moveDirection = this.#DIRECTION.DOWN;
          } else if (
               (disX < disY) && 
          (lateEnemy.Y < currentTankY) &&
            this.#DIRECTION.STOP == Bullet[1] &&
            this.#DIRECTION.STOP == Bullet[2] &&
            this.#DIRECTION.STOP == Bullet[3]
          ) {
            moveDirection = this.#DIRECTION.UP;
          } else if (
                (disX < disY) && 
          (lateEnemy.Y < currentTankY) &&
            this.#DIRECTION.STOP == Bullet[1] &&
            this.#DIRECTION.STOP == Bullet[4] &&
            this.#DIRECTION.STOP == Bullet[9]
          ) {
            moveDirection = this.#DIRECTION.LEFT;
          } else if (
               (disX < disY) && 
          (lateEnemy.Y < currentTankY) &&
            this.#DIRECTION.STOP == Bullet[3] &&
            this.#DIRECTION.STOP == Bullet[7] &&
            this.#DIRECTION.STOP == Bullet[11]
          ) {
            moveDirection = this.#DIRECTION.RIGHT;
          }
          console.log("战术撤退", moveDirection);
        }
        var c =  (new Date()).valueOf();
        if (c - this.firetimestamp > 500) {
          this.firetimestamp = c;
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
      }
    } else if (escapenum >= 4) {
      if (
        cy > currentTankY &&
        this.#DIRECTION.STOP == Bullet[9] &&
        this.#DIRECTION.STOP == Bullet[10] &&
        this.#DIRECTION.STOP == Bullet[11]
      ) {
        moveDirection = this.#DIRECTION.DOWN;
      } else if (
        cy > currentTankY &&
        this.#DIRECTION.STOP == Bullet[1] &&
        this.#DIRECTION.STOP == Bullet[2] &&
        this.#DIRECTION.STOP == Bullet[3]
      ) {
        moveDirection = this.#DIRECTION.UP;
      } else if (
        cx < currentTankX &&
        this.#DIRECTION.STOP == Bullet[1] &&
        this.#DIRECTION.STOP == Bullet[4] &&
        this.#DIRECTION.STOP == Bullet[9]
      ) {
        moveDirection = this.#DIRECTION.LEFT;
      } else if (
        cx > currentTankX &&
        this.#DIRECTION.STOP == Bullet[3] &&
        this.#DIRECTION.STOP == Bullet[7] &&
        this.#DIRECTION.STOP == Bullet[11]
      ) {
        moveDirection = this.#DIRECTION.RIGHT;
      }
      console.log("中央逃逸", moveDirection);
    }
    moveDirection = this.#avoidBullet(
      currentTankX,
      currentTankY,
      currentTankWH,
      Bullet,
      moveDirection
    );
    this.#move(moveDirection);
    if (undefined != moveDirection) {
      console.log(moveDirection);
    }
	 this.#setName();
  }
  leave() {
	this.#setName();
    document.onkeyup(this.#moveEv);
    document.onkeyup(this.#fireEv);
  }
  type;
 
  #DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
  };
 
  #fireEv;

  #moveEv;
  #calcTwoPointDistance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
  }
  #collision(
    myTankx,
    myTanky,
    zonex,
    zoney,
    currentTankWHx,
    currentTankWHy,
    bulletWHx,
    bulletWHy
  ) {
    return this.#PlayercheckCollide(
      myTankx,
      myTanky,
      currentTankWHx,
      currentTankWHy,
      zonex,
      zoney,
      bulletWHx,
      bulletWHy
    );
  }
  #PlayercheckCollide(A, B, C, D, E, F, G, H) {
    C += A; 
    D += B; 
    G += E; 
    H += F; 
    if (C <= E || G <= A || D <= F || H <= B) {
    
      return false;
    }
    return true;
  }
  #avoidBullet(
    currentTankX,
    currentTankY,
    currentTankWH,
    Bullet,
    moveDirection
  ) {
   
    if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.UP == Bullet[10]) {
     
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.LEFT,
          currentTankWH
        ) &&
        this.#DIRECTION.DOWN != Bullet[1] &&
        this.#DIRECTION.UP != Bullet[9] &&
        this.#DIRECTION.RIGHT != Bullet[4] &&
        this.#DIRECTION.STOP == Bullet[5]
      ) {
        console.log("安全躲避移动左");
        moveDirection = this.#DIRECTION.LEFT;
      }
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.RIGHT,
          currentTankWH
        ) &&
        this.#DIRECTION.DOWN != Bullet[3] &&
        this.#DIRECTION.STOP == Bullet[11] &&
        this.#DIRECTION.LEFT != Bullet[10] &&
        this.#DIRECTION.UP != Bullet[7]
      ) {
        if (
          this.priority == this.#DIRECTION.RIGHT &&
          moveDirection == this.#DIRECTION.LEFT
        ) {
          console.log("安全躲避移动右");
          moveDirection = this.#DIRECTION.RIGHT;
        }
      } else {
        console.log("水平无法躲避");
      }
    } else if (
      (this.#DIRECTION.DOWN == Bullet[0] ||
    this.#DIRECTION.UP == Bullet[12])
    ) {
   
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.LEFT,
          currentTankWH
        ) &&
        this.#DIRECTION.DOWN != Bullet[1] &&
        this.#DIRECTION.UP != Bullet[9] &&
        this.#DIRECTION.RIGHT != Bullet[4] &&
        this.#DIRECTION.STOP == Bullet[5]
      ) {
        console.log("预防安全躲避移动左");
        moveDirection = this.#DIRECTION.LEFT;
      } else if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.RIGHT,
          currentTankWH
        ) &&
        this.#DIRECTION.DOWN != Bullet[3] &&
        this.#DIRECTION.STOP == Bullet[11] &&
        this.#DIRECTION.LEFT != Bullet[10] &&
        this.#DIRECTION.UP != Bullet[7]
      ) {
        console.log("预防安全躲避移动右边");
        moveDirection = this.#DIRECTION.RIGHT;
      } else {
        console.log("水平警戒不适合移动");
      }
    }
    if (
      this.#DIRECTION.RIGHT == Bullet[5] ||
      this.#DIRECTION.LEFT == Bullet[7]
    ) {
    
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.UP,
          currentTankWH
        ) &&
        this.#DIRECTION.RIGHT != Bullet[1] &&
        this.#DIRECTION.STOP == Bullet[2] &&
        this.#DIRECTION.LEFT != Bullet[3] &&
        this.#DIRECTION.DOWN != Bullet[0]
      ) {
        console.log("安全躲避移动上");
        moveDirection = this.#DIRECTION.UP;
      }
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.DOWN,
          currentTankWH
        ) &&
        this.#DIRECTION.RIGHT != Bullet[9] &&
        this.#DIRECTION.STOP == Bullet[10] &&
        this.#DIRECTION.LEFT != Bullet[11] &&
        this.#DIRECTION.UP != Bullet[12]
      ) {
        if (
          this.priority == this.#DIRECTION.DOWN &&
          moveDirection == this.#DIRECTION.UP
        ) {
          console.log("安全躲避移动下");
          moveDirection = this.#DIRECTION.DOWN;
        }
      } else {
        console.log("垂直无法躲避");
      }
    } else if (
      this.#DIRECTION.RIGHT == Bullet[4] ||
      this.#DIRECTION.LEFT == Bullet[8]
    ) {
     
      if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.UP,
          currentTankWH
        ) &&
        this.#DIRECTION.RIGHT != Bullet[1] &&
        this.#DIRECTION.STOP == Bullet[2] &&
        this.#DIRECTION.LEFT != Bullet[3] &&
        this.#DIRECTION.DOWN != Bullet[0]
      ) {
        console.log("预防安全躲避移动上");
        moveDirection = this.#DIRECTION.UP;
      } else if (
        !this.#isNearBoundary(
          currentTankX,
          currentTankY,
          this.#DIRECTION.DOWN,
          currentTankWH
        ) &&
        this.#DIRECTION.LEFT != Bullet[9] &&
        this.#DIRECTION.STOP == Bullet[10] &&
        this.#DIRECTION.LEFT != Bullet[11] &&
        this.#DIRECTION.UP != Bullet[12]
      ) {
        console.log("预防安全躲避移动下");
        moveDirection = this.#DIRECTION.DOWN;
      } else {
        console.log("垂直警戒不适合移动");
      }
    }
    this.priority = moveDirection;
    return moveDirection;
  }
  
  #calcBulletDistance(
    arraybullet,
    currentTankX,
    currentTankY,
    Bullet,
    currentTankWH,
    bulletWH
  ) {
    var dis;
    for (const bullet of arraybullet) {
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[7] = bullet.direction;
      } else if (
        true ==
        this.#collisionMetal(
          currentTankX + currentTankWH,
          currentTankY,
          currentTankWH
        )
      ) {
        Bullet[7] = this.#DIRECTION.LEFT;
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[8] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[4] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[5] = bullet.direction;
      } else if (
        true ==
        this.#collisionMetal(
          currentTankX - currentTankWH,
          currentTankY,
          currentTankWH
        )
      ) {
        Bullet[5] = this.#DIRECTION.RIGHT;
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[10] = bullet.direction;
      } else if (
        true ==
        this.#collisionMetal(
          currentTankX,
          currentTankY + currentTankWH,
          currentTankWH
        )
      ) {
        Bullet[10] = this.#DIRECTION.UP;
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[12] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[0] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[2] = bullet.direction;
      } else if (
        true ==
        this.#collisionMetal(
          currentTankX,
          currentTankY - currentTankWH,
          currentTankWH
        )
      ) {
        Bullet[2] = this.#DIRECTION.DOWN;
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[1] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[3] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[9] = bullet.direction;
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH / 2 - 1,
        bullet.Y - bulletWH / 2 - 1,
        currentTankWH,
        currentTankWH,
        bulletWH * 1.2,
        bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[11] = bullet.direction;
      }
      var ctx = canvas.getContext("2d");
    }
  }
 
  #helpDirectionKeyCode(direction) {
    switch (direction) {
      case this.#DIRECTION.UP:
        return this.type === "A" ? 87 : 38;
      case this.#DIRECTION.DOWN:
        return this.type === "A" ? 83 : 40;
      case this.#DIRECTION.LEFT:
        return this.type === "A" ? 65 : 37;
      case this.#DIRECTION.RIGHT:
        return this.type === "A" ? 68 : 39;
    }
  }

  #setName() {
	   document.getElementById(
      `Player${this.type === "A" ? 1 : 2}barName`
    ).value = "黑化肥会挥发"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "黑化肥会挥发"
   
  }
 
  #move(direction) {
    if (typeof direction === undefined) return;
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction);
    document.onkeydown(this.#moveEv);
  }
 
  #fire(direction) {
    this.#fireEv.keyCode = this.type === "A" ? 32 : 8;
    document.onkeydown(this.#fireEv);
  }
 
  #scanner(currentTank) {}
 
  #isNearBoundary(X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
    if (currentDirection !== undefined) {
      if (
        currentDirection === this.#DIRECTION.DOWN &&
        Y + currentTankWH > screenY
      ) {
        return true;
      } else if (currentDirection === this.#DIRECTION.UP && Y < currentTankWH) {
        return true;
      } else if (
        currentDirection === this.#DIRECTION.LEFT &&
        X < currentTankWH
      ) {
        return true;
      } else
        return (
          currentDirection === this.#DIRECTION.RIGHT &&
          X + currentTankWH > screenX
        );
    }
    return (
      this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    );
  }
  #collisionMetal(x, y, r) {
  
    const metal = typeof ametal === "undefined" ? undefined : ametal;
    if (undefined != metal) {
      for (var i = 0; i < metal.length; i++) {
        if (
          x > metal[i][0] - r &&
          x < metal[i][0] + metal[i][2] &&
          y > metal[i][1] - r &&
          y < metal[i][1] + metal[i][3]
        ) {
          return true;
        }
      }
    }
    return false;
  }
})("B");