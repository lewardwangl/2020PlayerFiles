window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;
  }
  land() {
    // 当前的坦克实例
    var cur = undefined
    var enr = undefined
    aMyTankCount.forEach(element => {
      var c = element
      if(c['id'] == 100)
      {
        cur = c
      }
      if(c['id'] == 200)
      {
        enr = c
      }
    });
    const currentTank = cur
    const enemyTank = enr
    if (!currentTank) return;

    // 所有的地方坦克实例数组
    const enemyTanks = aTankCount;
    // 所有的敌方子弹实例数组
    const enemyBullets = aBulletCount;
    // 坦克的宽高
    const currentTankWH = 50;
    // 子弹的宽高
    const bulletWH = 10;
    // 坦克的x,y  ===> 坦克中心点
    const currentTankX = currentTank.X;
    const currentTankY = currentTank.Y;
    const currentTankDirect = currentTank.direction
    //我方子弹
    const myBullets = this.type === "A" ? aMyBulletCount1 : aMyBulletCount2;

    const eBullets = this.type === "A" ? aMyBulletCount2 : aMyBulletCount1;
    // 游戏限制的子弹数为5 = aMyBulletCount2
    const myBulletLimit = 5;

    // 当前策略移动方向
    let moveDirection = undefined

    // 中央逃逸点
    const cx = canvas.width/2;
    const cy = canvas.height/2

    // 躲AI子弹
    let Bullet = new Array(this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP,
    this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,this.#DIRECTION.STOP,);

    this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)


    var lateEnemy = undefined
    var misDistanceOfEnemy = currentTankWH * 100  //初始化离他最近的坦克
    var secruitydistance = currentTankWH * 6     //安全距离
    var secruitylevel = enemyTanks.length       //坦克的数量
    var firedirectdis = 4                     // 根据最近坦克的距离大于firedirectdis*currentTankWH调整炮口
    var escapedir = 4                        // 距离小于多少时逃跑
    var fight = 6                           // 大于多少个安全距离时追击
    var escapenum = 0                      // 逃跑系数

    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
          enemy.X,
          enemy.Y 
      );
      if(secruitydistance>dis  && secruitylevel >= 4)
      {
        escapenum++                //逃亡系数，大了就要跑
      }
      if (misDistanceOfEnemy > dis) {
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
    if(secruitylevel<=3)  //是否可以加速打电脑
    {
       firedirectdis = 3
       escapedir = 2
       fight = 3
    }

    if (moveDirection!= undefined){
      this.#move(moveDirection);
    }
    else if (moveDirection == undefined && escapenum < 4) {
      //不移动可以考虑炮击
      if (undefined != lateEnemy) {
        var disX = Math.abs(lateEnemy.X - currentTankX)
        var disY = Math.abs(lateEnemy.Y - currentTankY)
        var dis = this.#calcTwoPointDistance(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y)
        if (dis >=firedirectdis * currentTankWH) {  //调整炮口
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.RIGHT != Bullet[5] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7] && this.#DIRECTION.LEFT != Bullet[8]) {
            if (currentTankDirect != this.#DIRECTION.UP) {
              moveDirection = this.#DIRECTION.UP;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT  != Bullet[16] && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19] && this.#DIRECTION.LEFT != Bullet[20]) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              moveDirection = this.#DIRECTION.DOWN;
              console.log("炮口调整", moveDirection)
            }
          }else if ((disX >= disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[5] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.UP != Bullet[17] && this.#DIRECTION.UP != Bullet[21]) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              moveDirection = this.#DIRECTION.LEFT;
              console.log("炮口调整", moveDirection)
            }
          }else if ((disX >= disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[7] && this.#DIRECTION.STOP == Bullet[13] && this.#DIRECTION.UP != Bullet[19]) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              moveDirection = this.#DIRECTION.RIGHT;
              console.log("炮口调整", moveDirection)
            }
          }
        }
        if (dis > fight * currentTankWH) {    //追击
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[5] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.STOP == Bullet[7]) {
            moveDirection = this.#DIRECTION.UP;
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.STOP == Bullet[19]) {
            moveDirection = this.#DIRECTION.DOWN;
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[13] && this.#DIRECTION.STOP == Bullet[19]) {
            moveDirection = this.#DIRECTION.RIGHT;
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[5] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[17]) {
            moveDirection = this.#DIRECTION.LEFT;
          }
          console.log("战术前进", moveDirection)
        }
        else if (dis < escapedir * currentTankWH) {  //逃跑 判断条件放宽 STOP 改成RIGHT
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19]){
            moveDirection = this.#DIRECTION.DOWN;
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[5] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7]) {
            moveDirection = this.#DIRECTION.UP;
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[5] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.UP != Bullet[17]) {
            moveDirection = this.#DIRECTION.LEFT;
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[7] && this.#DIRECTION.STOP == Bullet[13] && this.#DIRECTION.UP != Bullet[19]) {
            moveDirection = this.#DIRECTION.RIGHT
          }
          console.log("战术撤退", moveDirection)
        }

        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 300) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
      }
    }
    else if(escapenum >= 4){     //超过4个敌方坦克小于安全距离 逃跑策略
      if (cy > currentTankY  && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT  != Bullet[19]) {
        moveDirection = this.#DIRECTION.DOWN;
      } else if(cy > currentTankY && this.#DIRECTION.RIGHT != Bullet[5] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7]) {
        moveDirection = this.#DIRECTION.UP;
      } else if (cx < currentTankX && this.#DIRECTION.DOWN  != Bullet[5] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.UP != Bullet[17]){
        moveDirection = this.#DIRECTION.LEFT;
      } else if (cx > currentTankX && this.#DIRECTION.DOWN  != Bullet[7] && this.#DIRECTION.STOP == Bullet[13] && this.#DIRECTION.UP != Bullet[19]){
        moveDirection = this.#DIRECTION.RIGHT
      }
      console.log("中央逃逸", moveDirection)
    }

    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
    this.#move(moveDirection);
    if (undefined != moveDirection) {
      console.log(moveDirection)
    }
    this.#setName();
  }

  leave() {
    this.#setName();
    document.onkeyup(this.#moveEv);
    document.onkeyup(this.#fireEv);
  }
  type;
  // private
  // 方向的别名
  #DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
  };
  // 开火事件
  #fireEv;
  // 移动事件
  #moveEv;


  #calcTwoPointDistance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
  }
  #collision(myTankx, myTanky, zonex, zoney, currentTankWHx, currentTankWHy, bulletWHx, bulletWHy) {
    return this.#PlayercheckCollide(myTankx, myTanky, currentTankWHx, currentTankWHy, zonex, zoney, bulletWHx, bulletWHy)
  }
  #PlayercheckCollide(A, B, C, D, E, F, G, H) {
    C += A;//算出矩形1右下角横坐标
    D += B;//算出矩形1右下角纵坐标
    G += E;//算出矩形2右下角横纵标
    H += F;//算出矩形2右下角纵坐标
    if (C <= E || G <= A || D <= F || H <= B) {    //两个图形没有相交
      return false
    }
    return true
  }
  /*
            0
         1  2  3
      4  5  6  7  8
    9 10 11 12 13 14 15
      16 17 18 19 20
         21 22 23
            24
  */
  #avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection){
     if (this.#DIRECTION.DOWN == Bullet[6] || this.#DIRECTION.UP == Bullet[18] ) {   //必须左右移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.UP != Bullet[19]  && this.#DIRECTION.DOWN != Bullet[7] && this.#DIRECTION.UP != Bullet[23] && this.#DIRECTION.LEFT != Bullet[14] && this.#DIRECTION.LEFT != Bullet[15] && this.#DIRECTION.STOP == Bullet[13]) {
          console.log("安全躲避移动右")
          moveDirection = this.#DIRECTION.RIGHT;
       }
        else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[5]  && this.#DIRECTION.UP != Bullet[17] && this.#DIRECTION.UP != Bullet[21] && this.#DIRECTION.RIGHT != Bullet[10]  && this.#DIRECTION.RIGHT != Bullet[9]  && this.#DIRECTION.STOP == Bullet[11]) {
         console.log("安全躲避移动左")
         moveDirection = this.#DIRECTION.LEFT;
       }
       else if(!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
       ) && this.#DIRECTION.UP != Bullet[19]  && this.#DIRECTION.DOWN != Bullet[7]  && this.#DIRECTION.LEFT != Bullet[14]  && this.#DIRECTION.STOP == Bullet[13]){
          console.log("安全躲避移动右")
          moveDirection = this.#DIRECTION.RIGHT;
       }
       else if(!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[5]  && this.#DIRECTION.UP != Bullet[17] && this.#DIRECTION.RIGHT != Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
          console.log("安全躲避移动左")
          moveDirection = this.#DIRECTION.LEFT;
       }
       else if ( (currentTankX + currentTankWH) > screenX) { moveDirection = this.#DIRECTION.LEFT}
       else if ((currentTankX + currentTankWH) <= screenX) { moveDirection = this.#DIRECTION.RIGHT }
       else{
          console.log("无法躲避")
          //moveDirection = this.#DIRECTION.;
       }
     }
     else if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.UP == Bullet[22] || this.#DIRECTION.DOWN == Bullet[0] || this.#DIRECTION.UP == Bullet[24]) { //考虑左右移动
       if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.UP != Bullet[19]  && this.#DIRECTION.DOWN != Bullet[7] && this.#DIRECTION.UP != Bullet[23] && this.#DIRECTION.LEFT != Bullet[14] && this.#DIRECTION.LEFT != Bullet[15] && this.#DIRECTION.STOP == Bullet[13]) {
         console.log("预防安全躲避移动右边")
         moveDirection = this.#DIRECTION.RIGHT;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[5]  && this.#DIRECTION.UP != Bullet[17] && this.#DIRECTION.UP != Bullet[21] && this.#DIRECTION.RIGHT != Bullet[10]  && this.#DIRECTION.RIGHT != Bullet[9]  && this.#DIRECTION.STOP == Bullet[11]) {
         console.log("安全躲避移动左")
         moveDirection = this.#DIRECTION.LEFT;
       }
       else if(!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
       ) && this.#DIRECTION.UP != Bullet[19]  && this.#DIRECTION.DOWN != Bullet[7]  && this.#DIRECTION.LEFT != Bullet[14]  && this.#DIRECTION.STOP == Bullet[13]){
          console.log("安全躲避移动右")
          moveDirection = this.#DIRECTION.RIGHT;
       }
       else if(!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
       ) && this.#DIRECTION.DOWN != Bullet[5]  && this.#DIRECTION.UP != Bullet[17]  && this.#DIRECTION.RIGHT != Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
          console.log("安全躲避移动左")
          moveDirection = this.#DIRECTION.LEFT;
       }
       else if ( (currentTankX + currentTankWH) > screenX) { moveDirection = this.#DIRECTION.LEFT}
       else if (currentTankX + currentTankWH <= screenX) { moveDirection = this.#DIRECTION.RIGHT }
       else {
        console.log("安全躲避移动右")
        //moveDirection = this.#DIRECTION.RIGHT;
       }
     }
     if (this.#DIRECTION.RIGHT == Bullet[11] || this.#DIRECTION.LEFT == Bullet[13]) { //必须垂直移动
       if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.RIGHT != Bullet[16] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19] && this.#DIRECTION.LEFT != Bullet[20]  && this.#DIRECTION.UP != Bullet[22] && this.#DIRECTION.UP != Bullet[24] ) {
           console.log("安全躲避移动下")
           moveDirection = this.#DIRECTION.DOWN;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[5] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7]  && this.#DIRECTION.LEFT != Bullet[8]  && this.#DIRECTION.DOWN != Bullet[2]  &&  this.#DIRECTION.DOWN != Bullet[0]) {
           console.log("安全躲避移动上")
           moveDirection = this.#DIRECTION.UP;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19] && this.#DIRECTION.UP != Bullet[22]) {
           console.log("安全躲避移动下")
           moveDirection = this.#DIRECTION.DOWN;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[5]  && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7] && this.#DIRECTION.DOWN != Bullet[2]) {
           console.log("安全躲避移动上")
           moveDirection = this.#DIRECTION.UP;
       }
       else if ( (currentTankY + currentTankWH) > screenY) { moveDirection = this.#DIRECTION.UP}
       else if (currentTankY + currentTankWH < screenY) { moveDirection = this.#DIRECTION.DOWN }
     }
     else if (this.#DIRECTION.RIGHT == Bullet[10] || this.#DIRECTION.LEFT == Bullet[14] || this.#DIRECTION.RIGHT == Bullet[11] || this.#DIRECTION.LEFT == Bullet[13]) { //考虑垂直移动
       if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[5] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7]  && this.#DIRECTION.LEFT != Bullet[8]  && this.#DIRECTION.DOWN != Bullet[2] && this.#DIRECTION.DOWN != Bullet[0] ) {
         console.log("预防安全躲避移动上")
         moveDirection = this.#DIRECTION.UP;
       }
       else if(!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.RIGHT != Bullet[16] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19]  && this.#DIRECTION.LEFT != Bullet[20]  && this.#DIRECTION.UP != Bullet[22] &&  this.#DIRECTION.UP != Bullet[24]) {
         console.log("预防安全躲避移动下")
         moveDirection = this.#DIRECTION.DOWN;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.LEFT != Bullet[19] && this.#DIRECTION.UP != Bullet[22]) {
           console.log("安全躲避移动下")
           moveDirection = this.#DIRECTION.DOWN;
       }
       else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
       ) && this.#DIRECTION.RIGHT != Bullet[5]  && this.#DIRECTION.STOP == Bullet[6] && this.#DIRECTION.LEFT != Bullet[7] && this.#DIRECTION.DOWN != Bullet[2]) {
           console.log("安全躲避移动上")
           moveDirection = this.#DIRECTION.UP;
       }
       else if ( (currentTankY + currentTankWH) > screenY) { moveDirection = this.#DIRECTION.UP}
       else if (currentTankY + currentTankWH <= screenY) { moveDirection = this.#DIRECTION.DOWN }
     }
    // this.priority = moveDirection;
    return moveDirection
  }

  #calcBulletDistance(arraybullet, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH) {
    var dis
    for (const bullet of arraybullet) {
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis ) {
        Bullet[13] = bullet.direction
      } else if(true==this.#collisionMetal(currentTankX + currentTankWH,currentTankY,currentTankWH))
      {
        Bullet[13] = this.#DIRECTION.LEFT
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[14] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + 3 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      )
      if (true == dis) {
        Bullet[15] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 3 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[9] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[10] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[11] = bullet.direction
      }else if(true==this.#collisionMetal(currentTankX - currentTankWH,currentTankY,currentTankWH))
      {
        Bullet[11] = this.#DIRECTION.RIGHT
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[18] = bullet.direction
      } else if(true==this.#collisionMetal(currentTankX,currentTankY + currentTankWH,currentTankWH))
      {
        Bullet[18] = this.#DIRECTION.UP
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[22] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 3 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[24] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 3 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[0] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[2] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[6] = bullet.direction
      }else if(true==this.#collisionMetal(currentTankX,currentTankY - currentTankWH,currentTankWH))
      {
        Bullet[6] = this.#DIRECTION.DOWN
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[5] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[1] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[4] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[8] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[7] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[3] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[16] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[17] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[21] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[19] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[20] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[23] = bullet.direction
      }
      var ctx = canvas.getContext('2d');

    }
  }
  // 根据玩家返回正确的方向keyCode
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
  // 设置队伍
  #setName() {
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}barName`
    ).value = "豹2A6"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "豹2A6"
  }
  // 控制移动   举例子：  向左移动： this.#move(this.#DIRECTION.LEFT)
  #move(direction) {
    if (typeof direction === undefined) return;
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction);
    document.onkeydown(this.#moveEv);
  }
  // 开火
  #fire(direction) {
    this.#fireEv.keyCode = this.type === "A" ? 32 : 8;
    document.onkeydown(this.#fireEv);
  }
  // TODO： 扫描轨道   预判走位  并给出开火和移动方向
  #scanner(currentTank) { }
  // 判断是否快到边界了
  #isNearBoundary(X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
    if (currentDirection != undefined) {
      if (
        currentDirection === this.#DIRECTION.DOWN &&
        Y + currentTankWH > screenY
      ) {
        return true;
      } else if (currentDirection === this.#DIRECTION.UP && Y < currentTankWH) {
        return true;
      } else if (currentDirection === this.#DIRECTION.LEFT && X < currentTankWH) {
        return true;
      } else
        return (
          currentDirection === this.#DIRECTION.RIGHT && X + currentTankWH > screenX
        );
    }
/*
    return (
      this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    );*/
  }
  #collisionMetal(x,y,r)
  {
    //障碍阻挡
    const metal = ametal
    if(undefined!=metal)
    {
      for(var i = 0;i<metal.length;i++)
      {
        if(x>metal[i][0] - r && x < metal[i][0] + metal[i][2] && y > metal[i][1]-r && y<metal[i][1] + metal[i][3])
        {
          return true
        }
      }
    }
    return false
  }
})("A");