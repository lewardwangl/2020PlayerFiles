window.playerB = new (class PlayerControl {
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
    const currentTank = cur   // 我方坦克
    const enemyTank = enr     // 对手坦克
    if (!currentTank) return;

    // 下面是方便读取的全局数据的别名
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
    let Bullet = new Array(this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP,this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP);

    this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)

    var lateEnemy = undefined
    var misDistanceOfEnemy = currentTankWH * 200
    var secruitydistance = currentTankWH * 6
    var secruitylevel = enemyTanks.length
    var firedirectdis = 4
    var escapedir = 7
    var fight = 5
    var escapenum = 0
    var minParam = 8 //启发式函数中最小距离的系数
    var maxParam = 2  //启发式函数中最大距离的系数
    var oppsParam = 25
    var distanceNeedToCatch = 1000  //预备追击距离

    for (const enemy of enemyTanks) {
      // 启发式各个敌人之间的启发式距离
      var dis = this.#hfunction(currentTankX, currentTankY, enemy.X, enemy.Y, minParam, maxParam);      

      if(secruitydistance>dis  && enemyTanks.length >= 4)
      {
        escapenum++//逃亡系数，大了就要跑
      }
      if (misDistanceOfEnemy > dis) { //计算在启发式距离中最近那个敌人
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
    if(undefined != lateEnemy)
    {
      const enemydis = this.#hfunction(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y, minParam, maxParam);  
      if (enemydis>=distanceNeedToCatch)
      {
        firedirectdis = 2
        escapedir = 5
        fight = 3
      }
    }

    if(secruitylevel<=2 && undefined != enemyTank)//是否可以加速打电脑
    {
       firedirectdis = 3
       escapedir = 3
       fight = 2
    }
    if (moveDirection == undefined && escapenum < 4) {
      //不移动可以考虑炮击
      if (undefined != lateEnemy) {
        var disX = Math.abs(lateEnemy.X - currentTankX)
        var disY = Math.abs(lateEnemy.Y - currentTankY)
        var dis = this.#hfunction(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y, minParam, maxParam)
        if (dis >= firedirectdis * currentTankWH) {//调整炮口
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
            if (currentTankDirect != this.#DIRECTION.UP) {
              moveDirection = this.#DIRECTION.UP;
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              moveDirection = this.#DIRECTION.DOWN;
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              moveDirection = this.#DIRECTION.RIGHT;
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              moveDirection = this.#DIRECTION.LEFT;
            }
          }
          console.log("炮口调整", moveDirection)
        }
        if ((disX > fight * currentTankWH || disY > fight * currentTankWH) && dis > fight * currentTankWH) {//追击
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
            moveDirection = this.#DIRECTION.UP;
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
            moveDirection = this.#DIRECTION.DOWN;
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
            moveDirection = this.#DIRECTION.RIGHT;
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
            moveDirection = this.#DIRECTION.LEFT;
          }
          console.log("战术前进", moveDirection)
        }
        else if (/*(disX < escapedir * currentTankWH || disY < escapedir * currentTankWH) ||*/ dis < escapedir * currentTankWH) {//逃跑

          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[12]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && currentTankY < canvas.height - 0.5 * currentTankWH){
              moveDirection = this.#DIRECTION.DOWN;
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[0]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH)){
              moveDirection = this.#DIRECTION.UP;
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[5]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH)){
              moveDirection = this.#DIRECTION.LEFT;
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[8]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH)){
              moveDirection = this.#DIRECTION.RIGHT
            }
          } 
          console.log("战术撤退", moveDirection)
        }
        
        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 500) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
      }
    }
    else if(escapenum>=4){
      if (cy > currentTankY  && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
        moveDirection = this.#DIRECTION.DOWN;
      } else if (cy > currentTankY && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
        moveDirection = this.#DIRECTION.UP;
      } else if (cx < currentTankX && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
        moveDirection = this.#DIRECTION.LEFT;
      } else if (cx > currentTankX && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
        moveDirection = this.#DIRECTION.RIGHT
      }
      console.log("中央逃逸", moveDirection)
    }
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
    moveDirection = this.#scanner(currentTank, moveDirection, enemyBullets, currentTankWH, bulletWH)
    console.log("最终修正为:", moveDirection)
    this.#move(moveDirection);
    if (undefined != moveDirection) {
      console.log("前进",moveDirection)
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

  #hfunction(ax, ay, bx, by, minParam, maxParam) {  //启发式函数
      return minParam * Math.min(Math.abs(ax - bx), Math.abs(ay - by)), maxParam * Math.max(Math.abs(ax - bx), Math.abs(ay - by));
  }
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
    if (C <= E || G <= A || D <= F || H <= B) {//两个图形没有相交
      return false
    }
    return true
  }
  #avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, numMostDirection) {
    /*  
        0
      1 2 3
    4 5 6 7 8 
      9 10 11
        12
    */
    if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.UP == Bullet[10] ) { //必须左右移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5]) {
        console.log("安全躲避移动左")
        moveDirection = this.#DIRECTION.LEFT;
      }
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7]) {
        if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
        {        
          console.log("安全躲避移动右")
          moveDirection = this.#DIRECTION.RIGHT;
        }
      }
      else { console.log("水平无法躲避") }
    }
    else if ((this.#DIRECTION.DOWN == Bullet[0] || this.#DIRECTION.UP == Bullet[12])) { //考虑左右移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5]) {
        console.log("预防安全躲避移动左")
        if (this.#DIRECTION.DOWN != Bullet[14]){
          moveDirection = this.#DIRECTION.LEFT;
        }
      } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7]) {
        console.log("预防安全躲避移动右边")
        moveDirection = this.#DIRECTION.RIGHT;
      }
      else { console.log("水平警戒不适合移动") }
    }
    if (this.#DIRECTION.RIGHT == Bullet[5] || this.#DIRECTION.LEFT == Bullet[7]) { //必须垂直移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
      ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0]) {
        console.log("安全躲避移动上")
        moveDirection = this.#DIRECTION.UP;
      }
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
      ) && this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12]) {

        if(this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP)
        {        
          console.log("安全躲避移动下")
          moveDirection = this.#DIRECTION.DOWN;
        }
      } else { console.log("垂直无法躲避") }
    }
    else if ((this.#DIRECTION.RIGHT == Bullet[4] || this.#DIRECTION.LEFT == Bullet[8])) { //考虑垂直移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
      ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0]) {
        console.log("预防安全躲避移动上")
        moveDirection = this.#DIRECTION.UP;
      } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
      ) && this.#DIRECTION.LEFT != Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12]) {
        console.log("预防安全躲避移动下")
        moveDirection = this.#DIRECTION.DOWN;
      } else { console.log("垂直警戒不适合移动") }
    } 

    this.priority = moveDirection;
    return moveDirection
  }
  /*  
      0
    1 2 3
  4 5 6 7 8 
    9 10 11
      12
  */
  #calcBulletDistance(arraybullet, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH) {
    var dis
  var ss = 1.5
    for (const bullet of arraybullet) {
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis ) {
        Bullet[7] = bullet.direction
      } else if(true==this.#collisionMetal(currentTankX + currentTankWH,currentTankY,currentTankWH))
      {
        Bullet[7] = this.#DIRECTION.LEFT 
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[8] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[4] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[5] = bullet.direction
      }else if(true==this.#collisionMetal(currentTankX - currentTankWH,currentTankY,currentTankWH))
      {
        Bullet[5] = this.#DIRECTION.RIGHT 
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[10] = bullet.direction
      } else if(true==this.#collisionMetal(currentTankX,currentTankY + currentTankWH,currentTankWH))
      {
        Bullet[10] = this.#DIRECTION.UP 
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[12] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[0] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[2] = bullet.direction
      }else if(true==this.#collisionMetal(currentTankX,currentTankY - currentTankWH,currentTankWH))
      {
        Bullet[2] = this.#DIRECTION.DOWN 
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[1] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[3] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[9] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[11] = bullet.direction
      }
      //////
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[13] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[16] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[24] = bullet.direction
      }

      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[21] = bullet.direction
      }

      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[14] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[15] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[23] = bullet.direction
      }

      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[22] = bullet.direction
      }

      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[17] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[18] = bullet.direction
      }

      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[20] = bullet.direction
      }

      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * ss, bulletWH * ss
      );
      if (true == dis) {
        Bullet[19] = bullet.direction
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
    ).value = "1111111"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "1111111"
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
  #scanner(currentTank, moveDirection2, enemyBullets, currentTankWH, bulletWH) { 
    var moveDirection = undefined
    var distBulletsArray = []
    for (const pbullet of enemyBullets){  
        const dis = this.#calcTwoPointDistance( // 这里我们就直接计算直线距离了，不使用启发式函数了
        currentTank.X,
        currentTank.Y,
          pbullet.X,
          pbullet.Y 
        );
        var pbulletDis = new Object()
        pbulletDis.pbullet = pbullet
        pbulletDis.dis = dis
        if (dis < 4 * currentTankWH){ //只记录那些距离在一定范围内的子弹
          distBulletsArray.push(pbulletDis)
        }
    }
    distBulletsArray.sort(function(x, y){x.dis - y.dis}) // 距离当前坦克最近的子弹
    var actionCanDo = [0, 0, 0, 0, 0] //分别为上下左右和stop
    var flag = 0
    if (distBulletsArray.length > 1){
      for (var i = 0; i < distBulletsArray.length && i < 5; i++) {
        var innerBullet = distBulletsArray[i].pbullet
        if (innerBullet.direction == this.#DIRECTION.DOWN){          //如果最近的子弹方向向下
          if (innerBullet.Y < currentTank.Y - 0.5 * currentTankWH - 0.5 * bulletWH){   //如果子弹的位置在当前坦克上方
            if (innerBullet.X < currentTank.X - 0.5 * currentTankWH - 0.5 * bulletWH || innerBullet.X > currentTank.X + 0.5 * currentTankWH + 0.5 * bulletWH){ //如果恰好坦克的左侧和右侧都不在子弹的射击范围内
              console.log("走到了哲理AA")
              if (innerBullet.X > currentTank.X + 0.5 * currentTankWH + 0.5 * bulletWH && innerBullet.X < currentTank.X + 1.5 * currentTankWH + 0.5 * bulletWH){ //子弹在右侧
                if (innerBullet.Y > currentTank.Y - 1.5 * currentTankWH - 0.5 * bulletWH){
                  actionCanDo[3] = 1  //子弹快来了就别向右走了
                  flag = 1
                }
              } else if (innerBullet.X < currentTank.X - 0.5 * currentTankWH - 0.5 * bulletWH && innerBullet.X < currentTank.X - 1.5 * currentTankWH - 0.5 * bulletWH){
                if (innerBullet.Y > currentTank.Y - 1.5 * currentTankWH - 0.5 * bulletWH){
                  actionCanDo[2] = 1  //子弹在左侧快来了就别往左走了
                }
              }
            } else {
                // actionCanDo[1] = 1  //向下由于跑不过子弹也不能走
                actionCanDo[0] = 1  //向上肯定不能走了
                actionCanDo[4] = 1  //也不能不动
                flag = 1
            }
          } else if (innerBullet.Y < currentTank.Y + 0.5 * currentTankWH + 0.5 * bulletWH && innerBullet.Y > currentTank.Y){ //子弹在坦克的下方
            if (innerBullet.X > currentTank.X + 0.5 * currentTankWH + 0.5 * bulletWH && innerBullet.X < currentTank.X + 1.5 * currentTankWH + 0.5 * bulletWH){
              actionCanDo[3] = 1  //子弹就在右边就别向右走了
            } else if (innerBullet.X < currentTank.X - 0.5 * currentTankWH - 0.5 * bulletWH && innerBullet.X < currentTank.X - 1.5 * currentTankWH - 0.5 * bulletWH){
              actionCanDo[2] = 1  //子弹就在左侧就别往左走了
            }
          }
        } else if (innerBullet.direction == this.#DIRECTION.LEFT){    //如果子弹的方向向左
          if (innerBullet.X > currentTank.X + 0.6 * currentTankWH){   //如果子弹在坦克的右侧   
            if (innerBullet.Y >= currentTank.Y - 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 0.6 * currentTankWH){  //如果坦克恰好在子弹的射界内
                actionCanDo[2] = 1  //向左跑不过是个死
                actionCanDo[3] = 1  //向右去送死
                actionCanDo[4] = 1  //不动也是死
            } else {
              if (innerBullet.Y > currentTank.Y + 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 2 * currentTankWH){ //子弹在右下
                actionCanDo[1] = 1  //不能向下走
              } 
            }
          } else if (innerBullet.X < currentTank.X - 0.6 * currentTankWH){    //如果子弹在坦克的左侧 
              // 子弹在坦克右侧向左飞 啥也不用管
          } else if (innerBullet.X < currentTank.X ){
              actionCanDo[2] = 1    //子弹实在是太近了, 别往左走了
              if (innerBullet.Y > currentTank.Y + 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 2 * currentTankWH){ //子弹在左下
                actionCanDo[1] = 1  //子弹在很近的左下角, 不能往下
              }
          }
        } else if (innerBullet.direction == this.#DIRECTION.RIGHT) {// ============== RIGHT ==========
          if (innerBullet.X < currentTank.X - 0.6 * currentTankWH){  //子弹在坦克的左侧
            if (innerBullet.Y >= currentTank.Y - 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 0.6 * currentTankWH){  //如果坦克恰好在子弹的射界内
                actionCanDo[2] = 1  //向左跑不过是个死
                actionCanDo[3] = 1  //向右去送死
                actionCanDo[4] = 1  //不动也是死
            } else {
              if (innerBullet.Y > currentTank.Y + 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 2 * currentTankWH){ //子弹在左下
                actionCanDo[1] = 1  //不能向下走
              }
            }
          } else if (innerBullet.X > currentTank.X + 0.6 * currentTankWH){ //如果子弹在坦克的右侧

          } else if (innerBullet.X > currentTank.X){
            flag = 1
            actionCanDo[3] = 1
            if (innerBullet.Y > currentTank.Y + 0.6 * currentTankWH && innerBullet.Y <= currentTank.Y + 2 * currentTankWH){ //子弹在左下
                actionCanDo[1] = 1  //子弹在很近的右下角, 不能往下
            }
          }
        } else {  //========= UP ======================
            if (innerBullet.X < currentTank.X - 0.6 * currentTankWH || innerBullet.X > currentTank.X - 0.6 * currentTankWH){
            } else {
                actionCanDo[1] = 1  //向下由于跑不过子弹也不能走
                actionCanDo[0] = 1  //向上肯定不能走了
                actionCanDo[4] = 1  //也不能不动
                flag = 1
            }
        }
      }
    }
    var moveDirection3 = currentTank.direction
    for (var i = 0; i <= 4; i++) {
      if (actionCanDo[i] != 1){
        if (i == 4){
          moveDirection = this.#DIRECTION.STOP
        } else if (i == 3){
          moveDirection = this.#DIRECTION.RIGHT
        } else if (i == 2){
          moveDirection = this.#DIRECTION.LEFT
        } else if (i == 1){
          moveDirection = this.#DIRECTION.DOWN
        } else if (i == 0){
          moveDirection = this.#DIRECTION.UP
        } else {
          moveDirection = undefined
        }
        if (moveDirection == moveDirection2){
          moveDirection = moveDirection2
          break
        }
      }
    }
    
    // if (moveDirection == undefined){
    //   moveDirection = this.#DIRECTION.LEFT
    // }
    if (currentTank.Y > 0.9 * canvas.height && (moveDirection == undefined  || moveDirection == this.#DIRECTION.STOP) && currentTank.direction == this.#DIRECTION.DOWN){
      if (moveDirection2 == this.#DIRECTION.DOWN){
        flag = 1
      }
      if (actionCanDo[0] != 1){
        moveDirection = this.#DIRECTION.UP
      } else if (actionCanDo[2] != 1){
        moveDirection = this.#DIRECTION.LEFT
      } else {
        moveDirection = this.#DIRECTION.RIGHT
      }
    }
    if (flag == 1 || moveDirection2 == undefined){
      console.log("修改了上述结果",moveDirection)
      return moveDirection
    } else {
      return moveDirection2
    }
  }
  // 判断是否快到边界了
  #isNearBoundary(X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
    if (currentDirection !== undefined) {
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

    return (
      this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    );
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
})("B");