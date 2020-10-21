window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = Date.now()
    this.priority = this.#DIRECTION.STOP;
    this.currentTank =null
    this.myBullets = null;//我的子弹
    this.myBulletsTarget =new Map() //存放子弹的目标坦克
    this.myBulletsNum = 0;// 发射的子弹计数
  }

  land() {

    // 当前的坦克实例
    this.moveStatus=0;//移动的权重 12345 级别 1最高
    this.shotStatus=0;//开火的权重 1最高
    var cur = undefined
    var enr = undefined
    aMyTankCount.forEach(element => {
      var c = element
      if (c['id'] == 100) {
        cur = c
      }
      if (c['id'] == 200) {
        enr = c
      }
    });
    //如果我的坦克已经阵亡，结束后续操作
    if (undefined == cur) {
        return ;
    }
      console.log('land初试时间：——————————'+new Date().getTime())

    const currentTank = this.currentTank = cur
    
    const enemyTank = enr

    if (!currentTank) return;
    this.myBulletsNum = 0//重置子弹计数


    //下面是方便读取的全局数据的别名
    // 所有的地方坦克实例数组 拼接上敌方坦克
    let enemyTanks = aTankCount;
    //第三关打开
    // if (undefined != enemyTank) {
    //   enemyTanks = enemyTanks.concat(enemyTank);
    // }
    // 所有的敌方子弹实例数组
    const enemyBullets = aBulletCount;
    // 坦克的宽高
    const currentTankWH = 50;
    // 子弹的宽高
    const bulletWH = 10;
    // 坦克的x,y  ===> 坦克中心点
    console.log('land时坦克位置');
    console.log(currentTank);
    const currentTankX = currentTank.X;
    const currentTankY = currentTank.Y;
    const currentTankDirect = currentTank.direction
    //我方子弹
    const myBullets = this.myBullets =this.type === "A" ? aMyBulletCount1 : aMyBulletCount2;

    const eBullets = this.type === "A" ? aMyBulletCount2 : aMyBulletCount1;
    // 游戏限制的子弹数为5 = aMyBulletCount2
    const myBulletLimit = 5;

    // 当前策略移动方向
    let moveDirection = undefined



    // 中央逃逸点
    const cx = canvas.width / 2;
    const cy = canvas.height / 2

    // 躲AI子弹
    let Bullet = new Array(this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP);
    //危险系数大的、比较近的敌方坦克
    let closeETanks = new Array();

    this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    // this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    this.#calcTankDistance(enemyTanks, currentTankX, currentTankY, closeETanks, currentTankWH, bulletWH)
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
    console.log('移动方向'+moveDirection)
    this.#move(moveDirection);

    var lateEnemy = undefined
    var misDistanceOfEnemy = currentTankWH * 100
    var secruitydistance = currentTankWH * 6
    var secruitylevel = enemyTanks.length
    var firedirectdis = 4
    var escapedir = 4
    var fight = 5
    var escapenum = 0

    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemy.X,
        enemy.Y
      );
      if (secruitydistance > dis && enemyTanks.length >= 4) {
        escapenum++//逃亡系数，大了就要跑
      }
      if (misDistanceOfEnemy > dis) {//最近的坦克
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
   // if (undefined != enemyTank) {
   //   const enemydis = this.#calcTwoPointDistance(
   //     currentTankX,
   //     currentTankY,
   //     enemyTank.X,
   //     enemyTank.Y
   //   );
   //   if (enemydis < misDistanceOfEnemy) {
   //     lateEnemy = enemyTank;
   //     firedirectdis = 1
   //     escapedir = 1
   //     fight = 3
   //   }
   // }
    //if (secruitylevel <= 2 && undefined != enemyTank)//是否可以加速打电脑
    if (secruitylevel <= 2)//是否可以加速打电脑
    {
      firedirectdis = 6
      escapedir = 4
      fight = 4
    }
    if (moveDirection == undefined && escapenum < 5) {
      //不移动可以考虑炮击
      if (undefined != lateEnemy) {
        var disX = Math.abs(lateEnemy.X - currentTankX)
        var disY = Math.abs(lateEnemy.Y - currentTankY)
        var dis = this.#calcTwoPointDistance(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y)
        if (/*(disX > firedirectdis * currentTankWH || disY > firedirectdis * currentTankWH) ||*/ dis >= firedirectdis * currentTankWH) {//调整炮口
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            if (currentTankDirect != this.#DIRECTION.UP) {
              moveDirection = this.#DIRECTION.UP;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              moveDirection = this.#DIRECTION.DOWN;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              moveDirection = this.#DIRECTION.RIGHT;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              moveDirection = this.#DIRECTION.LEFT;
              console.log("炮口调整", moveDirection)
            }
          }
        }
        if ((disX > fight * currentTankWH || disY > fight * currentTankWH) && dis > fight * currentTankWH) {//追击
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.UP;
            console.log("战术前进", moveDirection)
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.DOWN;
            console.log("战术前进", moveDirection)
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.RIGHT;
            console.log("战术前进", moveDirection)
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.LEFT;
            console.log("战术前进", moveDirection)
          }
        }
        else if (/*(disX < escapedir * currentTankWH || disY < escapedir * currentTankWH) ||*/ dis < escapedir * currentTankWH) {//逃跑

          if ((disX < disY) && (lateEnemy.Y < currentTankY) && !this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.DOWN) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.DOWN;
            console.log("战术撤退", moveDirection)
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && !this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.UP) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.UP;
            console.log("战术撤退", moveDirection)
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && !this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.LEFT) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.LEFT;
            console.log("战术撤退", moveDirection)
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && !this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.RIGHT) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            moveDirection = this.#DIRECTION.RIGHT
            console.log("战术撤退", moveDirection)
          }
        }
        if(undefined != moveDirection){
          this.moveStatus = 3;
        }
      }
    }
    else if (escapenum >= 4) {
      if (cy > currentTankY && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11] &&  this.#DIRECTION.STOP == Bullet[18] && this.#DIRECTION.STOP == Bullet[15]) {
        moveDirection = this.#DIRECTION.DOWN;
      } else if (cy > currentTankY && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[13] && this.#DIRECTION.STOP == Bullet[16]) {
        moveDirection = this.#DIRECTION.UP;
      } else if (cx < currentTankX && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[5] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[19] && this.#DIRECTION.STOP == Bullet[22]) {
        moveDirection = this.#DIRECTION.LEFT;
      } else if (cx > currentTankX && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[21] && this.#DIRECTION.STOP == Bullet[23]) {
        moveDirection = this.#DIRECTION.RIGHT
      }
      if(undefined != moveDirection){
        this.moveStatus = 3;
      }
      console.log("中央逃逸", moveDirection)
    }
    
    this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    this.#calcTankDistance(enemyTanks, currentTankX, currentTankY, closeETanks, currentTankWH, bulletWH)
    // this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
    if(this.#isNearBorder(currentTankX, currentTankY, currentTankWH)){
      // 到达边界后的策略
      moveDirection = this.#isNearBoundaryMove(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks);
      console.log('到达边界后的策略：'+moveDirection)
    }
    moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
    if (undefined != moveDirection) {
      console.log('avoidBullet移动方向'+ moveDirection)
    }else{
      moveDirection = this.#isNearBoundaryMove(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks);
      console.log('#avoidBullet空后调用到达边界后的策略：'+moveDirection)
    }
    this.#move(moveDirection);
    console.log('--moveDirection--',moveDirection)
    this.#fireStatus(moveDirection,closeETanks, currentTankX, currentTankY, currentTankWH, Bullet);
    this.#setName();
  }

  #fireStatus(moveDirection,closeETanks, currentTankX, currentTankY, currentTankWH, Bullet){
      const self = this

      let fireDirection = null //直接开火
      let secondfireDirection = null //二级开火，可以开也可以不开

      // 给出预判
      const currentTank = this.currentTank
      //地方坦克移动距离是 2  子弹速度是10
      // 我方坦克 移动距离是7 子弹速度是 10 只能有5发
      
      let dis = 2000;//最大距离
      let dis2 = 5000 ;//最大距离

      ////根据所有tank 预判开火
      aTankCount.forEach(tank => {
        let _DIR = null

        let _DIR2 = null
        if (currentTank.X + 25 < tank.X + 50 && currentTank.X + 25 > tank.X) {

          if (tank.Y >= currentTank.Y) {
            _DIR = self.#DIRECTION.DOWN
            console.log("开火↓")
          } else {
            _DIR = self.#DIRECTION.UP
            console.log("开火↑")
          }

          if (Math.abs(tank.Y - currentTank.Y) < dis) {
            dis = Math.abs(tank.Y - currentTank.Y)
            fireDirection = _DIR
          }
        }

        //如果子弹的方向是左右 判断坐标
        if (currentTank.Y + 25 < tank.Y + 50 && currentTank.Y + 25 > tank.Y) {
          if (tank.X >= currentTank.X) {
            _DIR = self.#DIRECTION.RIGHT
            console.log("开火→")
          } else {
            _DIR = self.#DIRECTION.LEFT
            console.log("开火←")
          }

          if (Math.abs(tank.X - currentTank.X) < dis) {
            dis = Math.abs(tank.X - currentTank.X)
            fireDirection = _DIR
          }
        }
        if (tank.direction == self.#DIRECTION.LEFT || tank.direction == self.#DIRECTION.RIGHT) {
          const _d = Math.abs(tank.X - currentTank.X) + Math.abs(tank.Y - currentTank.Y)
          if (_d < dis2) {
            dis2 = _d
            if (tank.Y >= currentTank.Y + 25) {
              _DIR2 = self.#DIRECTION.DOWN
              console.log("预判开火↓")
            } else {
              _DIR2 = self.#DIRECTION.UP
              console.log("预判开火↑")
            }
            secondfireDirection = _DIR2
          }
        } else if (tank.direction == self.#DIRECTION.UP || tank.direction == self.#DIRECTION.DOWN) {
       
          const _d = Math.abs(tank.X - currentTank.X) + Math.abs(tank.Y - currentTank.Y)
          
          if (_d < dis2) {
            dis2 = _d
            if (tank.X >= currentTank.X + 25) {
              _DIR2 = self.#DIRECTION.RIGHT
              console.log("预判开火→")
            } else {
              _DIR2 = self.#DIRECTION.LEFT
              console.log("预判开火←")
            }
            secondfireDirection = _DIR2
          }
          
        }
        
      })


    if(moveDirection && (moveDirection == fireDirection)){
            console.log('指定方向开火'+fireDirection)
      self.#fire() 
    } else{
      if (self.moveStatus > 3 || self.moveStatus == 0){
        var moveDirection1 = this.#shouldAvoidETank(moveDirection,closeETanks);
        if(moveDirection1){
          console.log('fire &&  #shouldAvoidETank:'+moveDirection1)
          self.#move(moveDirection1)
          self.#fire()
        }else if (fireDirection){
            var moveFunction = 1;
            if(fireDirection == 0){
              moveFunction = this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(fireDirection == 1){
              moveFunction = this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(fireDirection == 2){
              moveFunction = this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(fireDirection == 3){
              moveFunction = this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }
            if(self.#canMovieAvoidETank(fireDirection,closeETanks) && moveFunction){
              console.log('fireDirection:'+fireDirection)
              self.#move(fireDirection)
              self.#fire(fireDirection)
            }else{
              self.#fire()
            }
        } else if (secondfireDirection){
            var moveFunction = 1;
            if(secondfireDirection == 0){
              moveFunction = this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(secondfireDirection == 1){
              moveFunction = this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(secondfireDirection == 2){
              moveFunction = this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }else if(secondfireDirection == 3){
              moveFunction = this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
            }
            if(self.#canMovieAvoidETank(secondfireDirection,closeETanks) && moveFunction){
              console.log('secondfireDirection:'+secondfireDirection)
              self.#move(secondfireDirection)
              self.#fire(fireDirection)
            }else{
              console.log('secondfireDirection毫无目的的开火')
              self.#fire()
            }
        }else{
            console.log('毫无目的的开火')
            self.#fire() //毫无目的的开火
        }
      } else {
            console.log('毫无目的的开火')
            self.#fire() //毫无目的的开火
      }
    }
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
//距离两个坦克位内同方向的敌方坦克，必须躲避
    #mustAvoidETank(moveDirection,closeETanks){
        if(closeETanks[3] || closeETanks[2] || closeETanks[4] ||closeETanks[5]|| closeETanks[15] ||closeETanks[16]){//需要上下移动
            if(closeETanks[1] ||closeETanks[0] || (closeETanks[9] && closeETanks[9].direction==this.#DIRECTION.RIGHT) || (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.LEFT)){
              moveDirection = this.#DIRECTION.DOWN;
            }else if(closeETanks[7] ||closeETanks[8]|| (closeETanks[11] && closeETanks[11].direction==this.#DIRECTION.RIGHT) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.LEFT)){
              moveDirection = this.#DIRECTION.UP;
            }else{
              moveDirection = this.#DIRECTION.DOWN;
            }
        }else if(closeETanks[1] || closeETanks[0] || closeETanks[7] ||closeETanks[8]|| closeETanks[13] ||closeETanks[14]){//需要左右移动
            if(closeETanks[2] ||closeETanks[3] || (closeETanks[9] && closeETanks[9].direction==this.#DIRECTION.DOWN) || (closeETanks[11] && closeETanks[11].direction==this.#DIRECTION.UP)){
              moveDirection = this.#DIRECTION.RIGHT;
            }else if(closeETanks[4] ||closeETanks[5]|| (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.DOWN) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.UP)){
              moveDirection = this.#DIRECTION.LEFT;
            }else{
              moveDirection = this.#DIRECTION.RIGHT;
            }
        }
        console.log("必须躲避坦克移动:"+moveDirection)
        return moveDirection
    }
//预测方向，能否移动
    #canMovieAvoidETank(wantDirection,closeETanks){
        /**
         *
      13
       0
     9 1 10
15 2 3 6 4 5 16
    11 7 12
       8
       14
         * */
      if(wantDirection==this.#DIRECTION.LEFT){
          if(closeETanks[3] || closeETanks[2] || closeETanks[4] ||closeETanks[5]|| closeETanks[15] ||closeETanks[16] ||(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.DOWN) || (closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.UP)){
              return false;
          }else{
              return true;
          }
      }else if(wantDirection==this.#DIRECTION.RIGHT){
          if(closeETanks[3] || closeETanks[2] || closeETanks[4] ||closeETanks[5]|| closeETanks[15] ||closeETanks[16]|| (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.DOWN) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.UP)){
              return false;
          }else{
              return true;
          }
      }else if(wantDirection==this.#DIRECTION.UP){
          if(closeETanks[1] || closeETanks[0] || closeETanks[7] ||closeETanks[8]|| closeETanks[13] ||closeETanks[14] ||(closeETanks[9] && closeETanks[9].direction==this.#DIRECTION.RIGHT) || (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.LEFT)){
              return false;
          }else{
              return true;
          }
      }else if(wantDirection==this.#DIRECTION.DOWN){
          if(closeETanks[1] || closeETanks[0] || closeETanks[7] ||closeETanks[8]|| closeETanks[13] ||closeETanks[14]|| (closeETanks[11] && closeETanks[11].direction==this.#DIRECTION.RIGHT) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.LEFT)){
              return false;
          }else{
              return true;
          }
      }
    }
//所有危险位置的敌方坦克，最好躲避
    #shouldAvoidETank(moveDirection,closeETanks){
        /**
         *
      13
       0
     9 1 10
15 2 3 6 4 5 16
    11 7 12
       8 
       14
         * */
      const currentTank = this.currentTank
        if(closeETanks[3] || closeETanks[2] || closeETanks[4] ||closeETanks[5]|| closeETanks[15] ||closeETanks[16]){//需要上下移动
            if(closeETanks[1] ||closeETanks[0] || (closeETanks[9] && closeETanks[9].direction==this.#DIRECTION.RIGHT) || (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.LEFT)){
              moveDirection = this.#DIRECTION.DOWN;
            }else if(closeETanks[7] ||closeETanks[8]|| (closeETanks[11] && closeETanks[11].direction==this.#DIRECTION.RIGHT) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.LEFT)){
              moveDirection = this.#DIRECTION.UP;
            }else{
                var Y= ((closeETanks[3]&&closeETanks[3].Y) || (closeETanks[2]&&closeETanks[2].Y) || (closeETanks[4]&&closeETanks[4].Y) ||(closeETanks[5]&&closeETanks[5].Y))
                if(this.currentTank.Y > Y){
                  moveDirection = this.#DIRECTION.DOWN;
                }else{
                  moveDirection = this.#DIRECTION.UP;
                }
            }
        }else if(closeETanks[1] || closeETanks[0] || closeETanks[7] ||closeETanks[8]|| closeETanks[13] ||closeETanks[14]){//需要左右移动
            if(closeETanks[2] ||closeETanks[3] || (closeETanks[9] && closeETanks[9].direction==this.#DIRECTION.DOWN) || (closeETanks[11] && closeETanks[11].direction==this.#DIRECTION.UP)){
              moveDirection = this.#DIRECTION.RIGHT;
            }else if(closeETanks[4] ||closeETanks[5]|| (closeETanks[10] && closeETanks[10].direction==this.#DIRECTION.DOWN) || (closeETanks[12] && closeETanks[12].direction==this.#DIRECTION.UP)){
              moveDirection = this.#DIRECTION.LEFT;
            }else{
                var X= ((closeETanks[1]&&closeETanks[1].X) || (closeETanks[0]&&closeETanks[0].X) || (closeETanks[7]&&closeETanks[7].X) ||(closeETanks[8]&&closeETanks[8].X))
                if(this.currentTank.X > X){
                  moveDirection = this.#DIRECTION.RIGHT;
                }else{
                  moveDirection = this.#DIRECTION.LEFT;
                }
            }
        }else if(closeETanks[9] || closeETanks[10] || closeETanks[11] || closeETanks[12]){//若当前坦克方向与敌方冲突需要移动
            if(this.currentTank.direction == this.#DIRECTION.LEFT && (closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.DOWN) && (closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.UP)){
                if(!(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.RIGHT) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.DOWN;
                }else if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.RIGHT) && !(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.UP;
                }else if(!(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.DOWN) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.RIGHT;
                }
            }else if(this.currentTank.direction == this.#DIRECTION.RIGHT && (closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.DOWN) && (closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.UP)){
                if(!(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.RIGHT) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.DOWN;
                }else if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.DOWN) && !(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.LEFT;
                }else if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.RIGHT) && !(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.UP;
                }
            }else if(this.currentTank.direction == this.#DIRECTION.UP && (closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.RIGHT) && (closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.LEFT)){
                if(!(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.RIGHT) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.DOWN;
                }else if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.DOWN) && !(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.LEFT;
                }else if(!(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.DOWN) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.RIGHT;
                }
            }else if(this.currentTank.direction == this.#DIRECTION.DOWN && (closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.RIGHT) && (closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.LEFT)){
                if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.DOWN) && !(closeETanks[11] &&closeETanks[11].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.LEFT;
                }else if(!(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.DOWN) && !(closeETanks[12] &&closeETanks[12].direction==this.#DIRECTION.UP)){
                  moveDirection = this.#DIRECTION.RIGHT;
                }else if(!(closeETanks[9] &&closeETanks[9].direction==this.#DIRECTION.RIGHT) && !(closeETanks[10] &&closeETanks[10].direction==this.#DIRECTION.LEFT)){
                  moveDirection = this.#DIRECTION.UP;
                }
            }
        }
        console.log("最好躲避坦克移动:"+moveDirection)
        return moveDirection
    }
  /*  
      0
      1    
  2 3 6 4 5 
      7  
      8 
      closeETanks
  */
  #avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) {
    console.log('坦克坐标'+ currentTankX+ ',' + currentTankY);
    /*  
         20
      19  0 21
   16  1  2 3 13
17  4  5  6 7  8 14
   18  9 10 11 15
      22 12 23
         24

    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
    */

      if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.UP == Bullet[10]) { //必须左右移动
        if(this.priority == this.#DIRECTION.LEFT){
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("安全躲避移动左")
            moveDirection = this.#DIRECTION.LEFT;
          }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
            // {        
            console.log("安全躲避移动右")
            moveDirection = this.#DIRECTION.RIGHT;
            // }
          }
          else { 
            console.log("水平无法躲避") 
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("预防安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }else{
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
            // {        
            console.log("安全躲避移动右")
            moveDirection = this.#DIRECTION.RIGHT;
            // }
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("安全躲避移动左")
            moveDirection = this.#DIRECTION.LEFT;
          }
          else { 
            console.log("水平无法躲避") 
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("预防安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }
        
      }
      else if(this.#DIRECTION.DOWN == Bullet[0] || this.#DIRECTION.UP == Bullet[12] || this.#DIRECTION.UP == Bullet[20] || this.#DIRECTION.UP == Bullet[24]){//考虑左右移动
        if(this.priority == this.#DIRECTION.LEFT){
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("预防躲避移动左")
            moveDirection = this.#DIRECTION.LEFT;
          }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
            // {        
            console.log("预防躲避移动右")
            moveDirection = this.#DIRECTION.RIGHT;
            // }
          }
          else { 
            console.log("水平无法躲避") 
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("预防安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }else{
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
            // {        
            console.log("预防躲避移动右")
            moveDirection = this.#DIRECTION.RIGHT;
            // }
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("预防躲避移动左")
            moveDirection = this.#DIRECTION.LEFT;
          }else { 
            console.log("水平无法躲避") 
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("预防安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动下")
              moveDirection = this.#DIRECTION.DOWN;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) ) {
              console.log("安全躲避移动上")
              moveDirection = this.#DIRECTION.UP;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }
        
      }

      if (this.#DIRECTION.RIGHT == Bullet[5] || this.#DIRECTION.LEFT == Bullet[7]) { //必须垂直移动
        if(this.priority == this.#DIRECTION.UP){
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("安全躲避移动上2")
            moveDirection = this.#DIRECTION.UP;
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
    
            // if(this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP)
            // {        
            console.log("安全躲避移动下2")
            moveDirection = this.#DIRECTION.DOWN;
            // }
          }
          else{
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("预防躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("安全躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }else{
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
    
            // if(this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP)
            // {        
            console.log("安全躲避移动下2")
            moveDirection = this.#DIRECTION.DOWN;
            // }
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("安全躲避移动上2")
            moveDirection = this.#DIRECTION.UP;
          }
          else{
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("预防躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("安全躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }
      }
      else if ((this.#DIRECTION.RIGHT == Bullet[4] || this.#DIRECTION.LEFT == Bullet[8] || this.#DIRECTION.LEFT == Bullet[14] || this.#DIRECTION.RIGHT == Bullet[17])) { //考虑垂直移动
        if(this.priority == this.#DIRECTION.DOWN){
          
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
    
            // if(this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP)
            // {        
            console.log("预防躲避移动下2")
            moveDirection = this.#DIRECTION.DOWN;
            // }
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("预防躲避移动上2")
            moveDirection = this.#DIRECTION.UP;
          }
          else{
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("预防躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("安全躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }else{
          if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH) && this.#isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
            console.log("预防躲避移动上2")
            moveDirection = this.#DIRECTION.UP;
          }
          else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH) && this.#isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
    
            // if(this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP)
            // {        
            console.log("预防躲避移动下2")
            moveDirection = this.#DIRECTION.DOWN;
            // }
          }
          else{
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("预防躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("预防躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH) && this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              // if(this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT)
              // {        
              console.log("安全躲避移动右")
              moveDirection = this.#DIRECTION.RIGHT;
              // }
            }
            else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH) && this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)) {
              console.log("安全躲避移动左")
              moveDirection = this.#DIRECTION.LEFT;
            }
            if(closeETanks.length>0){
              moveDirection = this.#mustAvoidETank(moveDirection,closeETanks);
            }
          }
        }
      }
      if (this.priority != moveDirection) {
        if(closeETanks.length>0){
          moveDirection = this.#shouldAvoidETank(moveDirection,closeETanks);
          console.log('three执行#move完成 - ' + moveDirection)
        }
      }
      if(undefined != moveDirection){
        this.moveStatus = 2;
      }
    //}

    this.priority = moveDirection;
    return moveDirection
  }
  // 根据子弹情况是否向下移动 - 安全躲避
  #isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12] && (!closeETanks[7] && !closeETanks[8] && !(closeETanks[11] && closeETanks[11].direction == this.#DIRECTION.RIGHT)&& !(closeETanks[12] && closeETanks[12].direction == this.#DIRECTION.LEFT))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况是否向下移动 - 预防躲避
  #isMoveDownPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12] && this.#DIRECTION.UP != Bullet[24] && this.#DIRECTION.LEFT != Bullet[15] && this.#DIRECTION.RIGHT != Bullet[18] && (!closeETanks[7] && !closeETanks[8]&& !(closeETanks[11] && closeETanks[11].direction == this.#DIRECTION.RIGHT)&& !(closeETanks[12] && closeETanks[12].direction == this.#DIRECTION.LEFT))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向上移动 - 安全躲避
  #isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0] && (!closeETanks[1] && !closeETanks[0]&& !(closeETanks[9] && closeETanks[9].direction == this.#DIRECTION.RIGHT)&& !(closeETanks[10] && closeETanks[10].direction == this.#DIRECTION.LEFT))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向上移动 - 预防躲避
  
  #isMoveUpPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0] && this.#DIRECTION.LEFT != Bullet[13] && this.#DIRECTION.RIGHT != Bullet[16] && (!closeETanks[1] && !closeETanks[0]&& !(closeETanks[9] && closeETanks[9].direction == this.#DIRECTION.RIGHT)&& !(closeETanks[10] && closeETanks[10].direction == this.#DIRECTION.LEFT))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向左移动 - 安全躲避
  #isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] && (!closeETanks[2] && !closeETanks[3]&& !(closeETanks[9] && closeETanks[9].direction == this.#DIRECTION.DOWN)&& !(closeETanks[11] && closeETanks[11].direction == this.#DIRECTION.UP))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向左移动 - 预防躲避
  #isMoveLeftPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] &&  this.#DIRECTION.DOWN != Bullet[19] &&  this.#DIRECTION.UP != Bullet[22] && (!closeETanks[2] && !closeETanks[3]&& !(closeETanks[9] && closeETanks[9].direction == this.#DIRECTION.DOWN)&& !(closeETanks[11] && closeETanks[11].direction == this.#DIRECTION.UP))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向右移动 - 安全躲避
  #isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && (!closeETanks[2] && !closeETanks[3]&& !(closeETanks[9] && closeETanks[9].direction == this.#DIRECTION.DOWN)&& !(closeETanks[11] && closeETanks[11].direction == this.#DIRECTION.UP))) {
      return true;
    }else{
      return false;
    }
  }
  // 根据子弹情况向右移动 - 预防躲避
  #isMoveRightPrevent(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks){
    if ( this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.DOWN != Bullet[21] && this.#DIRECTION.UP != Bullet[23] && (!closeETanks[4] && !closeETanks[5]&& !(closeETanks[10] && closeETanks[10].direction == this.#DIRECTION.DOWN)&& !(closeETanks[12] && closeETanks[12].direction == this.#DIRECTION.UP))) {
      return true;
    }else{
      return false;
    }
  }
  /*  
    *
      13
       0
     9 1 10
15 2 3 6 4 5 16
    11 7 12
       8 
       14
      
      UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
  */
  //敌方坦克最近位置
  #calcTankDistance(enemyTanks, currentTankX, currentTankY, closeETanks, currentTankWH, bulletWH) {
    var dis
    for (const tank of enemyTanks) {
      dis = this.#collisionTank(
        currentTankX + currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.LEFT) {
        closeETanks[4] = tank
        //closeETanks[4] = tank.direction
      }
      dis = this.#collision(
        currentTankX + 2 * currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.LEFT) {
        //closeETanks[5] = tank.direction
        closeETanks[5] = tank
      }
      dis = this.#collision(
        currentTankX + 3 * currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.RIGHT) {
        closeETanks[15] = tank
      }
      dis = this.#collision(
        currentTankX - 3 * currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.RIGHT) {
        closeETanks[14] = tank
      }
      dis = this.#collision(
        currentTankX - 2 * currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.RIGHT) {
        closeETanks[2] = tank
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.RIGHT) {
        closeETanks[3] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 3 * currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.DOWN) {
        closeETanks[13] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - 2 * currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.DOWN) {
        closeETanks[0] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY - currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.DOWN) {
        closeETanks[1] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.UP) {
        closeETanks[7] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 2 * currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.UP) {
        closeETanks[8] = tank
      }
      dis = this.#collision(
        currentTankX,
        currentTankY + 3 * currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && tank.direction == this.#DIRECTION.UP) {
        closeETanks[14] = tank
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY - currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && (tank.direction == this.#DIRECTION.DOWN || tank.direction == this.#DIRECTION.RIGHT)) {
        closeETanks[9] = tank
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY - currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && (tank.direction == this.#DIRECTION.DOWN || tank.direction == this.#DIRECTION.LEFT)) {
        closeETanks[10] = tank
      }
      dis = this.#collision(
        currentTankX - currentTankWH,
        currentTankY + currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && (tank.direction == this.#DIRECTION.UP || tank.direction == this.#DIRECTION.RIGHT)) {
        closeETanks[11] = tank
      }
      dis = this.#collision(
        currentTankX + currentTankWH,
        currentTankY + currentTankWH,
        tank.X,
        tank.Y,
        currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
      );
      if (true == dis && (tank.direction == this.#DIRECTION.UP || tank.direction == this.#DIRECTION.LEFT)) {
        closeETanks[12] = tank
      }
    }
    if (closeETanks.length > 0) {
      console.log('附近的敌方坦克:')
      console.log(closeETanks);
    }
  }
  /*  

         20
      19  0 21
   16  1  2 3 13
17  4  5  6 7  8 14
   18  9 10 11 15
      22 12 23
         24
      
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
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
      currentTankX + 3 * currentTankWH,
      currentTankY,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[14] = bullet.direction
    }
    dis = this.#collision(
      currentTankX - 3 * currentTankWH,
      currentTankY,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[17] = bullet.direction
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
      currentTankX - currentTankWH,
      currentTankY + 2 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[22] = bullet.direction
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
      currentTankY - 2 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[0] = bullet.direction
    }
    dis = this.#collision(
      currentTankX,
      currentTankY - 3 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[20] = bullet.direction
    }
    dis = this.#collision(
      currentTankX - currentTankWH,
      currentTankY - 2 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[19] = bullet.direction
    }
    dis = this.#collision(
      currentTankX + currentTankWH,
      currentTankY - 2 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[21] = bullet.direction
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
      currentTankX - 2 * currentTankWH,
      currentTankY - currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[16] = bullet.direction
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
      currentTankX + 2 * currentTankWH,
      currentTankY - currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[13] = bullet.direction
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
      currentTankX - 2 * currentTankWH,
      currentTankY + currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[18] = bullet.direction
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
    dis = this.#collision(
      currentTankX + currentTankWH,
      currentTankY + 2 * currentTankWH,
      bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
      currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
    );
    if (true == dis) {
      Bullet[15] = bullet.direction
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
    ).value = "猎豹"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "猎豹"
  }
  // 控制移动   举例子：  向左移动： this.#move(this.#DIRECTION.LEFT)
  #move(direction) {
    if (typeof direction === undefined) return;
    // document.onkeyup(this.#moveEv);
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction);
    document.onkeydown(this.#moveEv);
  }

  // 开火
  #fire() {
    const myBullets  = this.myBullets
    const myBulletsNum = myBullets.length + this.myBulletsNum
    const _time = Date.now() 
    const c = _time - this.firetimestamp 
    if (myBulletsNum < 3){
      this.firetimestamp = _time
      this._fire()
    } else  {
      if (c >= 200) {
        this.firetimestamp = _time
        this._fire()
      }
    }
  }

  _fire(){
    const currentTank = this.currentTank
    this.#fireEv.keyCode = this.type === "A" ? 32 : 8;
    document.onkeydown(this.#fireEv);
    document.onkeyup(this.#fireEv);
  }
  // TODO： 扫描轨道   预判走位  并给出开火和移动方向
  #scanner() {
    

  }




// 判断是否快到边界了
#isNearBoundary(X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
  if (currentDirection !== undefined) {
    if (currentDirection === this.#DIRECTION.DOWN && Y + 2 * currentTankWH >= screenY) {
      return true;
    } else if (currentDirection === this.#DIRECTION.UP && Y < currentTankWH) {
      return true;
    } else if (currentDirection === this.#DIRECTION.LEFT && X < currentTankWH) {
      return true;
    } else {
      return (currentDirection === this.#DIRECTION.RIGHT && X + currentTankWH >= screenX);
    }
    
  }

  return (
    this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
        this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
          this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    );
}
#isNearBorder(currentTankX, currentTankY, currentTankWH, direction){
  if(undefined != direction){

    if(direction == this.#DIRECTION.DOWN && currentTankY + 2* currentTankWH - 1 >= screenY || direction == this.#DIRECTION.UP && currentTankY - currentTankWH <= 0 || direction == this.#DIRECTION.LEFT && currentTankX - currentTankWH <= 0 || direction == this.#DIRECTION.RIGHT && currentTankX + currentTankWH >= screenX){
      return true
    }else{
      return false
    }
  }
  return (
    this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.DOWN) ||
      this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.UP) ||
        this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.RIGHT) ||
          this.#isNearBorder(currentTankX, currentTankY, currentTankWH, this.#DIRECTION.LEFT)
    );
}
// 到达边界后的策略
#isNearBoundaryMove(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks) {
  if(currentTankY + 2 * currentTankWH - 1 >= screenY){// 底边界
    /**
     *   20
      19  0 21
   16  1  2 3 13
17  4  5  6 7  8 14
     */
    /**tank
      0
    9 1 10
  2 3 6 4 5
     */ 
    if(this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
        // 上方监测点无子弹\坦克
      moveDirection = this.#DIRECTION.UP
      console.log('边界策略 上移')
    }else if(this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
                // 左侧监测点无子弹
      moveDirection = this.#DIRECTION.LEFT
      console.log('边界策略 左移')
    }else if(this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)
       && !closeETanks[4] && !closeETanks[5]&& !(closeETanks[10] && closeETanks[10].direction == this.#DIRECTION.DOWN)){
                // 右侧监测点无子弹
      moveDirection = this.#DIRECTION.RIGHT
      console.log('边界策略 右移')
    }
  }else if(currentTankY - currentTankWH <= 0) {// 顶边界
    /**
     * 17  4  5  6 7  8 14
          18  9 10 11 15
              22 12 23
                 24
     */
    /**tank
  2 3 6 4 5
   11 7 12
      8 
     */ 
    
    if(this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.DOWN
      console.log('边界策略 下移')
    }else if(this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
                // 左侧监测点无子弹
      moveDirection = this.#DIRECTION.LEFT
      console.log('边界策略 左移')
    }else if(this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
                // 右侧监测点无子弹
      moveDirection = this.#DIRECTION.RIGHT
      console.log('边界策略 右移')
    }
  }else if(currentTankX - currentTankWH <= 0) {// 左边界
    /**
     *20
      0 21
      2 3 13
      6 7  8 14
      10 11 15
      12 23
      24
     */
    /**tank
      0
      1 10
      6 4 5
      7 12
      8 
     */ 
    if(this.#isMoveRight(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.RIGHT
      console.log('边界策略 右移')
    }else if(this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.UP
      console.log('边界策略 上移')
    }else if(this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.DOWN
      console.log('边界策略 下移')
    }
  }else if(currentTankX - currentTankWH <= 0 || currentTankX + currentTankWH >= screenX) {// 右边界
    /**
     *    20
      19  0 
   16  1  2 
17  4  5  6 
   18  9 10 
      22 12 
         24
     */
    /**tank
      0
    9 1 
  2 3 6 
   11 7 
      8 
     */ 
    if(this.#isMoveLeft(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.LEFT
      console.log('边界策略 左移')
    }else if(this.#isMoveUp(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.UP
      console.log('边界策略 上移')
    }else if(this.#isMoveDown(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, closeETanks)){
      moveDirection = this.#DIRECTION.DOWN
      console.log('边界策略 下移')
    }
  }
  if(undefined != moveDirection){
    //移动级别
    this.moveStatus = 3;
  }
  return moveDirection
}
//获取坦克之间距离
#collisionTank(myTankx, myTanky, aTankx, aTanky, currentTankWHx, currentTankWHy, bulletWHx, bulletWHy)
{
  var zonex = aTankx + 1 / 2 * currentTankWHx - 1 / 2 * bulletWHx,
    zoney = aTanky + 1 / 2 * currentTankWHy - 1 / 2 * bulletWHy;
  return this.#PlayercheckCollide(myTankx, myTanky, currentTankWHx, currentTankWHy, zonex, zoney, bulletWHx, bulletWHy)
}
#collisionMetal(x, y, r)
{
  //障碍阻挡
  const metal = ametal
  if (undefined != metal) {
    for (var i = 0; i < metal.length; i++) {
      if (x > metal[i][0] - r && x < metal[i][0] + metal[i][2] && y > metal[i][1] - r && y < metal[i][1] + metal[i][3]) {
        return true
      }
    }
  }
  return false
}
}) ("A");

