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
    const enemyTank = enr // 代表红坦克

    if (!currentTank) return;

    //下面是方便读取的全局数据的别名
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
    let Bullet = new Array(this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP,);

    this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)

    var lateEnemy = undefined
    var misDistanceOfEnemy = currentTankWH * 100
    var secruitydistance = currentTankWH * 6
    var secruitylevel = enemyTanks.length
    var firedirectdis = 4
    var escapedir = 4
    var fight = 6
    var escapenum = 0
    var numMostDirection = undefined
    let positionOfEnemy = new Array(0, 0, 0, 0)   //敌方坦克被划分的区域，分别为上下左右
    let maxEnemyAreaNum = 0
    let maxEnemyAreaDirection = 0
    let correctWidth = 1.25 //弹道宽度修正，地方坦克数量越少 修正越大
    let distEnemyArray = []
    let positionOfEnemyClost = new Array(0, 0, 0, 0)   //最近的三台地方坦克所处于的位置, 分别为上下左右
    
    if (enemyTanks.length >= 16){
      correctWidth = 1.5
    } else if (enemyTanks.length >= 8){
      correctWidth = 3
    } else {
      correctWidth = 5
    }

    for (const penemy of enemyTanks) {       // 优先计算我方坦克上下左右位置敌方坦克的数量, 并得到那个方向上坦克最多

      if (penemy.Y < currentTankY && penemy.X > currentTankX - correctWidth * currentTankWH && penemy.X < currentTankX + correctWidth * currentTankWH){
        positionOfEnemy[0]++
        if (positionOfEnemy[0] > maxEnemyAreaNum){
          maxEnemyAreaNum = positionOfEnemy[0] 
          maxEnemyAreaDirection = 0
          numMostDirection = this.#DIRECTION.UP
        }
      }
      if (penemy.Y > currentTankY && penemy.X > (currentTankX - correctWidth * currentTankWH) && penemy.X < (currentTankX + correctWidth * currentTankWH)){
        positionOfEnemy[1]++
        if (positionOfEnemy[1] > maxEnemyAreaNum){
          maxEnemyAreaNum = positionOfEnemy[1]
          maxEnemyAreaDirection = 1
          numMostDirection = this.#DIRECTION.DOWN
        }
      }
      if (penemy.X < currentTankX && penemy.Y > (currentTankY - correctWidth * currentTankWH) && penemy.Y < (currentTankY + correctWidth * currentTankWH)){
        positionOfEnemy[2]++
        if (positionOfEnemy[2] > maxEnemyAreaNum){
          maxEnemyAreaNum = positionOfEnemy[2]
          maxEnemyAreaDirection = 2
          numMostDirection = this.#DIRECTION.LEFT
        }
      }
      if (penemy.X > currentTankX && penemy.Y > (currentTankY - correctWidth * currentTankWH) && penemy.Y < (currentTankY + correctWidth * currentTankWH)){
        positionOfEnemy[3]++
        if (positionOfEnemy[3] > maxEnemyAreaNum){
          maxEnemyAreaNum = positionOfEnemy[3]
          maxEnemyAreaDirection = 3
          numMostDirection = this.#DIRECTION.RIGHT
        }
      }
      const dis = this.#calcTwoPointDistance( // 计算和当前循环中敌方坦克距我方坦克的直线距离
        currentTankX,
        currentTankY,
          penemy.X,
          penemy.Y 
      );
      var enemyDis = new Object()
      enemyDis.enemy = penemy
      enemyDis.dis = dis
      distEnemyArray.push(enemyDis)
    }
    distEnemyArray.sort(function(x, y){return x.dis - y.dis})
    var clostNum = 3
    var totalEnemyNum = enemyTanks.length
    if (totalEnemyNum < clostNum){
      clostNum = totalEnemyNum
    }
    var minEnemyDirection = undefined
    var minEnemyNum = 999
    for (var i = clostNum - 1; i >= 0; i--) {
      var clostEnemy = distEnemyArray[i].enemy
      if (clostEnemy.Y <= currentTankY){
        positionOfEnemyClost[0]++
      } else if (clostEnemy.Y > currentTankY){
        positionOfEnemyClost[1]++
      } else if (clostEnemy.X > currentTankX){
        positionOfEnemyClost[3]++
      } else {
        positionOfEnemyClost[2]++
      }
    }
    for (var i = positionOfEnemyClost.length - 1; i >= 0; i--) {
      if (positionOfEnemyClost[i] < minEnemyNum){
        minEnemyNum = positionOfEnemyClost[i] 
        if (i == 0){
          minEnemyDirection = this.#DIRECTION.UP
        } else if (i == 1){
          minEnemyDirection = this.#DIRECTION.DOWN
        } else if (i == 2){
          minEnemyDirection = this.#DIRECTION.LEFT
        } else {
          minEnemyDirection = this.#DIRECTION.RIGHT
        }
      }
    }
    console.log("最近的三台地方坦克所处于的位置中最少坦克的位置",minEnemyDirection)
    console.log("敌方处于最多的弹道", maxEnemyAreaDirection)
    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance( // 计算和当前循环中敌方坦克距我方坦克的直线距离
        currentTankX,
        currentTankY,
          enemy.X,
          enemy.Y 
      );

      if(secruitydistance>dis  && enemyTanks.length >= 4)   //如果与敌方坦克的距离小于安全距离
      {
        escapenum++//逃亡系数，大了就要跑
      }
      if (misDistanceOfEnemy > dis) {   // 更新与我方坦克最近的地方坦克的距离和个体
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
    if(undefined != enemyTank)  //单人模式时这个就是undefined的, 也就是说单人模式不需要关心这个
    {
      const enemydis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemyTank.X,
        enemyTank.Y 
      );
      if (enemydis<misDistanceOfEnemy)
      {
        lateEnemy = enemyTank;
        firedirectdis = 1
        escapedir = 1
        fight = 3
      }
    }
    if(secruitylevel<=2 && undefined != enemyTank)//是否可以加速打电脑, 单人模式也不需要关心这个
    {
       firedirectdis = 3
       escapedir = 3
       fight = 4
    }
    // 后面的数字越大 炮击欲望越强
    if (moveDirection == undefined && escapenum < 4) {  //moveDirection为undefined说明不需要躲子弹， escapenum < 3说明小于3台敌方在安全范围内
      if (undefined != lateEnemy) {   // 下面的逻辑都是针对最近的坦克来说的
        var disX = Math.abs(lateEnemy.X - currentTankX)
        var disY = Math.abs(lateEnemy.Y - currentTankY)
        var dis = this.#calcTwoPointDistance(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y)
        if (/*(disX > firedirectdis * currentTankWH || disY > firedirectdis * currentTankWH) ||*/ dis >= firedirectdis * currentTankWH) {//调整炮口
          if ((disX < disY) && (lateEnemy.Y < 1.5*currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
           if (currentTankDirect != this.#DIRECTION.UP) {
              if (numMostDirection != this.#DIRECTION.UP && numMostDirection != undefined){  // 如果和最多坦克方向不一致 以最多坦克方向为准
                if (dis > secruitydistance){  //如果最近坦克的距离是大于安全距离的
                  moveDirection = numMostDirection;
                  console.log("炮口弹道修正调整", moveDirection)
                }
              } else {
                moveDirection = this.#DIRECTION.UP;
                console.log("炮口调整", moveDirection)
              }
              
            }
          } else if ((disX < disY) && (lateEnemy.Y >= 1.5*currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              if (numMostDirection != this.#DIRECTION.DOWN && numMostDirection != undefined) {
                if (dis > secruitydistance){  //如果最近坦克的距离是大于安全距离的
                  moveDirection = numMostDirection;
                  console.log("炮口弹道修正调整", moveDirection)
                }
              } else {
                moveDirection = this.#DIRECTION.DOWN;
                console.log("炮口调整", moveDirection)
              }
              
            }
          } else if ((disX >disY) && (lateEnemy.X >= 1.5*currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              if (numMostDirection != this.#DIRECTION.RIGHT && numMostDirection != undefined) {
                if (dis > secruitydistance){  //如果最近坦克的距离是大于安全距离的
                  moveDirection = numMostDirection;
                  console.log("炮口弹道修正调整", moveDirection)
                }
              } else {
                moveDirection = this.#DIRECTION.RIGHT;
                console.log("炮口调整", moveDirection)
              }
              
              
            }
          } else if ((disX >disY) && (lateEnemy.X < 1.5*currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              if (numMostDirection != this.#DIRECTION.LEFT && numMostDirection != undefined) {
                if (dis > secruitydistance){  //如果最近坦克的距离是大于安全距离的
                  moveDirection = numMostDirection;
                  console.log("炮口弹道修正调整", moveDirection)
                }
              } else {
                moveDirection = this.#DIRECTION.LEFT;
                console.log("炮口调整", moveDirection)
              }
              
            }
          }
        }
        if ((disX > fight * currentTankWH || disY > fight * currentTankWH) && dis > fight * currentTankWH) {//追击
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[0]) {
            if (currentTankY > 0.05 * canvas.height){
              moveDirection = this.#DIRECTION.UP;
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[12]) {
            if (currentTankY < 0.9 * canvas.height){
              moveDirection = this.#DIRECTION.DOWN;
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[8]) {
            if (currentTankX < 0.9 * canvas.width){
              moveDirection = this.#DIRECTION.RIGHT;
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[5]) {
            if (currentTankX > 0.1 * canvas.width){
              moveDirection = this.#DIRECTION.LEFT;
            }
          } else {
            moveDirection = maxEnemyAreaDirection
          }
          console.log("战术前进", moveDirection)
        }
        else if (/*(disX < escapedir * currentTankWH || disY < escapedir * currentTankWH) ||*/ dis < escapedir * currentTankWH) {//逃跑

          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[12]) {
            if (currentTankY < 0.9 * canvas.height){
              moveDirection = this.#DIRECTION.DOWN;
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[0]) {
            if (currentTankY > 0.1 * canvas.height){
              moveDirection = this.#DIRECTION.UP;
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[5]) {
            if (currentTankX < 0.9 * canvas.width){
              moveDirection = this.#DIRECTION.LEFT;
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[8]) {
            if (currentTankX > 0.1 * canvas.width){
              moveDirection = this.#DIRECTION.RIGHT
            }
          } else {
            moveDirection = minEnemyDirection
          }
          console.log("战术撤退", moveDirection)
        }
        
        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 400) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
      }
    }
    else if(escapenum>=4){ // 如果安全区坦克数量大于等于4台, 最好就跑
      // 根据子弹的数量修正cy cx
      var dy = cy
      var dx = dx
      if (dy < currentTankY  && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[12]) {
        if (currentTankY < canvas.height - 1){
          moveDirection = this.#DIRECTION.DOWN;
        }
      } else if (dy > currentTankY && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[0]) {
        if (currentTankY > 0){
              moveDirection = this.#DIRECTION.UP;
        }
      } else if (dx < currentTankX && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[5]) {
        if (currentTankX > 0){
              moveDirection = this.#DIRECTION.LEFT;
        }
      } else if (dx > currentTankX && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[8]) {
        if (currentTankX < canvas.width - 1){
              moveDirection = this.#DIRECTION.RIGHT
        }
      }
      console.log("中央逃逸", moveDirection)
    }
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
    if (undefined == moveDirection) { //如果不需要跑就开炮

        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 400) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
        console.log("开炮 开炮", moveDirection)
    }
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
    if (C <= E || G <= A || D <= F || H <= B) {//两个图形没有相交
      return false
    }
    return true
  }
  #avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection) {
    /*  
        0
      1 2 3
    4 5 6 7 8 
      9 10 11
        12
    */
    if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.UP == Bullet[10]) { //必须左右移动
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5]) {
        console.log("安全躲避移动左")
        moveDirection = this.#DIRECTION.LEFT;
      }
      if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.UP != Bullet[7]) {
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
        moveDirection = this.#DIRECTION.LEFT;
      } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.UP != Bullet[7]) {
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
    for (const bullet of arraybullet) {
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
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
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[8] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[4] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
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
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
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
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[12] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 2 * currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[0] = bullet.direction
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
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
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[1] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[3] = bullet.direction
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[9] = bullet.direction
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + currentTankWH,
        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis) {
        Bullet[11] = bullet.direction
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
  #scanner(currentTank) { }
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
})("A");