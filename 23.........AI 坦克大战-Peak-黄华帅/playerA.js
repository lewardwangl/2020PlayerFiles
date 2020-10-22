window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");	//定义按键移动事件
    this.#fireEv = new CustomEvent("keydown");	//定义按键开火事件
    this.firetimestamp = (new Date()).valueOf()	//开火时间戳
    this.priority = this.#DIRECTION.STOP;       //方向属性 上：0  右：1  下：2  左：3  停止：4
  }

  land() {

    let myr = undefined;  //己方坦克
    let enr = undefined;  //敌方坦克

    // 从坦克数组中找出己方和敌方坦克
    aMyTankCount.forEach(element => {
      let tank = element
      if (tank['id'] == 100) {
        myr = tank;
      } else if (tank['id'] == 200) {
        enr = tank;
      }
    });

    const tankWH = 50;      //坦克的宽高
    const bulletWH = 10;    //子弹的宽高

    // 当前的坦克实例
    const myTank = myr;    //我方坦克实例
    const enTank = enr;    //敌方坦克实例

    if (!myTank) return;

    //下面是方便读取的全局数据的别名
    const aiTanks = aTankCount;    //所有AI坦克实例数组
    const aiBullets = aBulletCount;//所有AI子弹实例数组
    //我方AI坦克
    const myAiTanks = [];

    //我方子弹
    const myBullets = this.type === "A" ? aMyBulletCount1 : aMyBulletCount2;

    //敌方子弹
    const enBullets = this.type === "A" ? aMyBulletCount2 : aMyBulletCount1;

    // 游戏限制的子弹数为5
    const myBulletLimit = 5;

    // 画布中心点
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    //附近范围内坦克
    const scopeTanks = [];

    //躲避坦克的方向数组
    const escapeDirs = [];

    //开火方向
    const fireDirs = [];

    // 当前策略移动方向
    let moveDirection = undefined;

    //附近防范范围半径大小
    const scopeDis = 5*tankWH;

    //坦克子弹预测范围半径大小
    const scanDis = 8*tankWH;

    //已经尝试移动过的方向
    const alreadyTryDirs = [];

    //中心区域方向
    const centerDirs = [];
    this.#initCenterDirs(myTank, tankWH, 0.8, centerDirs);
    this.#initCenterDirsMetal(myTank, tankWH, centerDirs);

    //坦克附件范围内的子弹
    const scanBullets = [];
    this.#calcAroundBts(myTank, scanDis, aiBullets, tankWH, bulletWH, scanBullets);
    if(ametal.length > 0){//如果有阻挡物，则为对抗赛，加入敌方坦克子弹
      this.#calcAroundBts(myTank, scanDis, enBullets, tankWH, bulletWH, scanBullets);
    }
    //添加躲避坦克的方向
    let latelyTank = this.#dirFilter(scopeDis, myTank, aiTanks, tankWH, escapeDirs, scopeTanks, fireDirs, myAiTanks, enTank, enBullets, bulletWH);

    //moveDirection = this.#avoidTank(myTank, centerDirs, scanBullets, tankWH, bulletWH, alreadyTryDirs);

    //如果有靠近的坦克，则优先逃离
    if(moveDirection == undefined){
      moveDirection = this.#avoidTank(myTank, escapeDirs, scanBullets, tankWH, bulletWH, alreadyTryDirs);
    }
    //追击敌方坦克
    if(moveDirection == undefined) {
      moveDirection = this.#attackTank(myTank, latelyTank, tankWH, bulletWH, scanBullets, myAiTanks, enTank, enBullets, alreadyTryDirs);
    }
    //可以停留，直接开炮
    if(moveDirection == undefined) {
      if ($.inArray(myTank.direction, fireDirs) >= 0) {
        let canStop = this.#canMoveToDir(myTank, this.#DIRECTION.STOP, scanBullets, tankWH, bulletWH);
        if (canStop) {
          moveDirection = myTank.direction;
        }
      }
    }
    //调整炮口
    if(moveDirection == undefined){
      let tmpDirs = $.extend(true, [], fireDirs);
      for(let i=0; i<fireDirs.length; i++){
        if(tmpDirs.length == 0){
          break;
        }
        let fireDir = tmpDirs[Math.floor(Math.random()*tmpDirs.length)];
        tmpDirs = tmpDirs.filter(item => item != fireDir);
        if($.inArray(fireDir, alreadyTryDirs) >= 0){
          continue;
        }else {
          alreadyTryDirs.push(fireDir);
        }
        moveDirection = this.#tryMoveTank(myTank, fireDir, scanBullets, tankWH, bulletWH);
        if(moveDirection != undefined){
          break;
        }
      }
    }
    //躲避子弹
    if(moveDirection == undefined){
      moveDirection = this.#avoidBullet(myTank, scanBullets, tankWH, bulletWH, alreadyTryDirs);
    }
    //开火
    if($.inArray(myTank.direction, fireDirs) >= 0){
      this.#myTankFire(myTank, aiTanks.length, tankWH);
    }
    if(moveDirection != undefined){
      this.priority = moveDirection;
    }
    this.#setName();
  }

  leave() {
    this.#setName();
    document.onkeyup(this.#moveEv);
    document.onkeyup(this.#fireEv);
  }
  type;

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
    ).value = "Peak";
    document.getElementById(
        `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "Peak";
  }
  // 控制移动   举例子：  向左移动： this.#move(this.#DIRECTION.LEFT)
  #move(direction) {
    if (typeof direction === undefined) return;
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction);
    document.onkeydown(this.#moveEv);
  }
  // 开火
  #fire() {
    this.#fireEv.keyCode = this.type === "A" ? 32 : 8;
    document.onkeydown(this.#fireEv);
  }

  /**
   * 记录坦克范围内子弹
   * @param siteMap
   * @param bullets
   * @param bulletWH
   */
  #calcAroundBts(tank, aroundDis, bullets, tankWH, bulletWH, scanButtes) {
    let tankX = tank.X + tankWH/2;
    let tankY = tank.Y + tankWH/2;
    for (let bullet of bullets){
      let dis = this.#calcTwoPointDistance(tankX, tankY, bullet.X, bullet.Y);
      if(dis < aroundDis){
        scanButtes.push(bullet);
      }
    }
  }

  /**
   * 判断两个图形是否相交碰撞
   * @param siteX
   * @param siteY
   * @param bulletX
   * @param bulletY
   * @param siteWH
   * @param bulletWH
   * @returns {boolean}
   */
  #checkCollision(siteX, siteY, bulletX, bulletY, siteWH, bulletWH){

    let Lx = Math.abs(siteX + siteWH/2 - bulletX);
    let Ly = Math.abs(siteY + siteWH/2 - bulletY);
    let Lw = (siteWH + bulletWH)/2;
    let Lh = (siteWH + bulletWH)/2;

    if(Lx <= Lw && Ly <= Lh){
      return true;
    }
    return false;
  }

  #checkSiteCollide(siteX, siteY, siteW, siteH, tankX, tankY, tankW, tankH){

    let Lx = Math.abs(siteX+siteW/2 - (tankX+tankW/2));
    let Ly = Math.abs(siteY+siteH/2 - (tankY+tankH/2));
    let Lw = (siteW + tankW)/2;
    let Lh = (siteH + tankH)/2;

    if(Lx < Lw && Ly < Lh){
      return true;
    }
    return false;
  }

  /**
   * 判断是否可以向指定的方向移动，
   * 并行根据传入的步数计算出后面的步数是否可以移动
   * @param direction
   * @param siteMap
   * @param tankWH
   * @param bulletWH
   * @param stepNum
   * @returns {boolean}
   */
  #canMoveToDir(tank, direction, bullets, tankWH, bulletWH) {
    //确定移动后坦克坐标
    let stepTank = this.#moveTank(tank.X, tank.Y, tank.speed, direction, tankWH);
    if(stepTank == undefined){
      return false;
    }
    //第一步移动
    let isCollision = this.#checkCollisionWithStep(stepTank, direction, bullets, 0, tankWH, bulletWH);
    if(isCollision){
      return false;
    }
    return this.#canMoveTank(stepTank, direction, bullets, tankWH, bulletWH, 1)
  }

  #canMoveTank(tank, direction, bullets, tankWH, bulletWH, stepNum){

    let can = false;
    let sDir = direction;
    if(stepNum > 20){
      return true;
    }
    for(let i=0; i<5; i++, sDir++) {
      let stepTank = this.#moveTank(tank.X, tank.Y, tank.speed, sDir % 5, tankWH);
      if(stepTank == undefined || this.#checkCollisionWithStep(stepTank, sDir % 5, bullets, stepNum, tankWH, bulletWH)){
        continue;
      }
      if(this.#canMoveTank(stepTank, sDir % 5, bullets, tankWH, bulletWH, stepNum+1)){
        can = true;
        break;
      }
    }
    return can;
  }
  /**
   * 判断子弹运动N部后是否与给定位置的坦克相交
   * @param tank
   * @param siteMap
   * @param stepNum
   * @param tankWH
   * @param bulletWH
   * @returns {boolean}
   */
  #checkCollisionWithStep(tank, direction, bullets, stepNum, tankWH, bulletWH) {

    //如果到达边界，则无法移动
    if(tank.X < 0 || tank.X+tankWH > screenX
        || tank.Y < 0 || tank.Y+tankWH > screenY
        || this.#collisionMetalTank(tank, tankWH)){
      return true;
    }

    let canMoveFormT_ToL = true;
    let canMoveFormT_ToR = true;

    let canMoveFormD_ToL = true;
    let canMoveFormD_ToR = true;

    let canMoveFormL_ToT = true;
    let canMoveFormL_ToD = true;

    let canMoveFormR_ToT = true;
    let canMoveFormR_ToD = true;

    //遍历移动后的子弹，判断是否相交--其他位置
    for(let bullet of bullets) {
      let tempStepNum = stepNum;
      if(bullet.color != "yellow"){
        tempStepNum = stepNum+1;
      }
      let bulletX = bullet.X;
      let bulletY = bullet.Y;

      if (this.#DIRECTION.UP == bullet.direction) {
        bulletY = bullet.Y - bullet.speed * tempStepNum;
      } else if (this.#DIRECTION.DOWN == bullet.direction) {
        bulletY = bullet.Y + bullet.speed * tempStepNum;
      } else if (this.#DIRECTION.LEFT == bullet.direction) {
        bulletX = bullet.X - bullet.speed * tempStepNum;
      } else if (this.#DIRECTION.RIGHT == bullet.direction) {
        bulletX = bullet.X + bullet.speed * tempStepNum;
      }
      if(bulletX+bulletWH/2 <=0
          || bulletX-bulletWH/2 >= screenX
          || bulletY+bulletWH/2 <=0
          || bulletY-bulletWH/2 >= screenY
          || this.#collisionMetalBullet(bulletX, bulletY, bulletWH)){
        continue;
      }
      if(bullet.direction != direction){
        let isCollision = this.#checkCollision(tank.X, tank.Y, bulletX, bulletY, tankWH, bulletWH);
        if (isCollision) {
          return true;
        }
      }else if(this.#DIRECTION.DOWN == bullet.direction && bulletY+bulletWH/2 < tank.Y && bulletX+bulletWH/2 >= tank.X && bulletX-bulletWH/2 <= tank.X+tankWH){
        //横向差距
        let edgeDisToL = (tank.X+tankWH) - (bulletX - bulletWH/2);
        let edgeDisToR = (bulletX + bulletWH/2) - tank.X;
        //纵向差距
        let edgeDisY = tank.Y - (bulletY + bulletWH/2);
        if(edgeDisY <= bullet.speed){
          return true;
        }
        if(edgeDisToL/tank.speed > edgeDisY/bullet.speed){
          canMoveFormT_ToL = false;
        }
        if(edgeDisToR/tank.speed > edgeDisY/bullet.speed){
          canMoveFormT_ToR = false;
        }
        if(!canMoveFormT_ToL && !canMoveFormT_ToR){
          return true;
        }
      }else if(this.#DIRECTION.UP == bullet.direction && bulletY-bulletWH/2 > tank.Y+tankWH && bulletX+bulletWH/2 >= tank.X && bulletX-bulletWH/2 <= tank.X+tankWH){
        //横向差距
        let edgeDisToL = (tank.X+tankWH) - (bulletX - bulletWH/2);
        let edgeDisToR = (bulletX + bulletWH/2) - tank.X;
        //纵向差距
        let edgeDisY = (bulletY - bulletWH/2) - (tank.Y+tankWH);
        if(edgeDisY <= bullet.speed){
          return true;
        }
        if(edgeDisToL/tank.speed > edgeDisY/bullet.speed){
          canMoveFormD_ToL = false;
        }
        if(edgeDisToR/tank.speed > edgeDisY/bullet.speed){
          canMoveFormD_ToR = false;
        }
        if(!canMoveFormD_ToL && !canMoveFormD_ToR){
          return true;
        }
      }else if(this.#DIRECTION.RIGHT == bullet.direction && bulletX+bulletWH/2 < tank.X && bulletY+bulletWH/2 >= tank.Y && bulletY-bulletWH/2 <= tank.Y+tankWH){
        //横向差距
        let edgeDisX = tank.X - (bulletX + bulletWH/2);
        if(edgeDisX <= bullet.speed){
          return true;
        }
        //纵向差距
        let edgeDisToT = (tank.Y+tankWH) - (bulletY - bulletWH/2);
        let edgeDisToD = (bulletY + bulletWH/2) - tank.Y;
        if(edgeDisToT/tank.speed > edgeDisX/bullet.speed){
          canMoveFormL_ToT = false;
        }
        if(edgeDisToD/tank.speed > edgeDisX/bullet.speed){
          canMoveFormL_ToD = false;
        }
        if(!canMoveFormL_ToT && !canMoveFormL_ToD) {
          return true;
        }
      }else if(this.#DIRECTION.LEFT == bullet.direction && bulletX-bulletWH/2 > tank.X+tankWH && bulletY+bulletWH/2 >= tank.Y && bulletY-bulletWH/2 <= tank.Y+tankWH){
        //横向差距
        let edgeDisX = (bulletX - bulletWH/2) - (tank.X+tankWH) ;
        if(edgeDisX <= bullet.speed){
          return true;
        }
        //纵向差距
        let edgeDisToT = (tank.Y+tankWH) - (bulletY - bulletWH/2);
        let edgeDisToD = (bulletY + bulletWH/2) - tank.Y;
        if(edgeDisToT/tank.speed > edgeDisX/bullet.speed){
          canMoveFormR_ToT = false;
        }
        if(edgeDisToD/tank.speed > edgeDisX/bullet.speed){
          canMoveFormR_ToD = false;
        }
        if(!canMoveFormR_ToT && !canMoveFormR_ToD){
          return true;
        }
      }else {
        let isCollision = this.#checkCollision(tank.X, tank.Y, bulletX, bulletY, tankWH, bulletWH);
        if (isCollision) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 根据指定的方向获取下一帧坦克的坐标
   * @param tank
   * @param direction
   * @returns {Object}
   */
  #moveTank(tankX, tankY, tankSpeed, direction, tankWH){

    let newTank = new Object();
    newTank.speed = tankSpeed;
    newTank.direction = direction;

    if(this.#DIRECTION.UP == direction){
      if(tankY <= 0){
        return undefined;
      }
      newTank.X = tankX;
      newTank.Y = tankY - tankSpeed < 0 ? 0 : tankY - tankSpeed;
    }else if(this.#DIRECTION.DOWN == direction){
      if(tankY + tankWH >= screenY){
        return undefined;
      }
      newTank.X = tankX;
      newTank.Y = tankY + tankSpeed > screenY - tankWH ? screenY - tankWH : tankY + tankSpeed;
    }else if(this.#DIRECTION.LEFT == direction){
      if(tankX <= 0){
        return undefined;
      }
      newTank.X = tankX - tankSpeed < 0 ? 0 : tankX - tankSpeed;
      newTank.Y = tankY;
    }else if(this.#DIRECTION.RIGHT == direction){
      if(tankX + tankWH >= screenX){
        return undefined;
      }
      newTank.X = tankX + tankSpeed > screenX - tankWH ? screenX - tankWH : tankX + tankSpeed;
      newTank.Y = tankY;
    }else {
      newTank.X = tankX;
      newTank.Y = tankY;
    }
    return newTank;
  }

  //过滤设置方向
  #dirFilter(scopeDis, myTank, aiTanks, tankWH, escapeDirs, scopeTanks, fireDirs, myAiTanks, enTank, enBullets, bulletWH){

    let latelyTank = undefined;
    let lateDis = 2000;

    let aiTk = enTank;
    for (let i = -1; i < aiTanks.length; i++){
      if(i >= 0){
        aiTk = aiTanks[i];
      }else {
        if(ametal.length == 0 || aiTk == undefined){
          continue;
        }
      }

      if(myTank.id == 100 && aiTk.X < screenX/2){
        myAiTanks.push(aiTk);
      }
      if(myTank.id == 200 && aiTk.X >= screenX/2){
        myAiTanks.push(aiTk);
      }

      let disX = Math.abs(myTank.X - aiTk.X);
      let disY = Math.abs(myTank.Y - aiTk.Y);

      let dis = this.#calcTwoPointDistance(myTank.X+tankWH/2, myTank.Y+tankWH/2, aiTk.X+tankWH/2, aiTk.Y+tankWH/2);
      //找到最近坦克
      if(latelyTank == undefined || dis < lateDis){
        latelyTank = aiTk;
        lateDis = dis;
      }
      if(dis < scopeDis*4){
        if(disX >= disY && disY < 1.5*tankWH){
          if(myTank.X > latelyTank.X ){
            fireDirs.push(this.#DIRECTION.LEFT);
          }else{
            fireDirs.push(this.#DIRECTION.RIGHT);
          }
        }else if(disY > disX && disX < 1.5*tankWH){
          if(myTank.Y > latelyTank.Y){
            fireDirs.push(this.#DIRECTION.UP);
          }else {
            fireDirs.push(this.#DIRECTION.DOWN);
          }
        }
      }
      //记录进入威胁范围内的坦克
      if(dis < scopeDis){
        scopeTanks.push(aiTk);
        //当有坦克过于靠近，则指定逃离方向
        let site_R = 1.4*tankWH;
        let site_L = 6*tankWH;
        let site_S = 0.4*tankWH;
        if(i == -1){
          let step = this.#enTankNoFire(enBullets, bulletWH);
          if( step> 10){
            site_R = 0*tankWH;
            site_L = 0*tankWH;
            site_S = 0*tankWH;
          }else if(step > 5){
            site_R = 0*tankWH;
            site_L = 4.5*tankWH;
            site_S = 0*tankWH;
          }else {
            site_R = 0*tankWH;
            site_L = 5.5*tankWH;
            site_S = 0.3*tankWH;
          }
        }
        if(dis < site_R || this.#isCalcCross(myTank, latelyTank, site_L, site_S, tankWH)){
          if(disX > disY){
            if(myTank.Y > latelyTank.Y){
              escapeDirs.push(this.#DIRECTION.DOWN);
            }else{
              escapeDirs.push(this.#DIRECTION.UP);
            }
            if(myTank.X > latelyTank.X){
              escapeDirs.push(this.#DIRECTION.RIGHT);
            }else{
              escapeDirs.push(this.#DIRECTION.LEFT);
            }
          }else {
            if(myTank.X > latelyTank.X){
              escapeDirs.push(this.#DIRECTION.RIGHT);
            }else {
              escapeDirs.push(this.#DIRECTION.LEFT);
            }
            if(myTank.Y > latelyTank.Y){
              escapeDirs.push(this.#DIRECTION.DOWN);
            }else{
              escapeDirs.push(this.#DIRECTION.UP);
            }
          }
        }
      }
      //当防御范围内的坦克数量过多，则指定逃离方向
      if(scopeTanks.length > 4 && escapeDirs.length == 0){
        let dirNum_T = 0;
        let dirNum_D = 0;
        let dirNum_L = 0;
        let dirNum_R = 0;
        let dirX;
        let dirY;
        for(let bt of scopeTanks){
          if(myTank.X > bt.X){
            dirNum_R++;
          }else{
            dirNum_L++;
          }
          if(myTank.Y >= bt.Y){
            dirNum_D++;
          }else{
            dirNum_T++;
          }
        }
        if(dirNum_T > dirNum_D){
          dirY = this.#DIRECTION.UP;
        }else {
          dirY = this.#DIRECTION.DOWN;
        }
        if(dirNum_L > dirNum_R){
          dirX = this.#DIRECTION.LEFT;
        }else {
          dirX = this.#DIRECTION.RIGHT;
        }
        if(Math.max(dirNum_T, dirNum_D) > Math.max(dirNum_L, dirNum_R)){
          escapeDirs.push(dirY);
          escapeDirs.push(dirX);
        }else {
          escapeDirs.push(dirX);
          escapeDirs.push(dirY);
        }
      }
    }
    if(fireDirs.length <= 0){
      if(latelyTank != undefined){
        if(myTank.X > latelyTank.X){
          fireDirs.push(this.#DIRECTION.LEFT);
        }else {
          fireDirs.push(this.#DIRECTION.RIGHT);
        }
      }else {
        fireDirs.push(this.#DIRECTION.STOP);
      }
    }
    return latelyTank;
  }

  //从数组中删除某个元素
  #remove(val, arrList) {
    let index = $.inArray(val, arrList);
    if(index > -1){
      arrList.splice(index, 1);
    }
  }

  //中心区域方向
  #initCenterDirs(myTank, tankWH, whNum, centerDirs){

    let dirX = undefined;
    let dirY = undefined;
    let disX = undefined;
    let disY = undefined;
    if(myTank.X < whNum*tankWH){
      dirX = this.#DIRECTION.RIGHT;
      disX = myTank.X;
    }else if(myTank.X > screenX - (whNum+1)*tankWH){
      dirX = this.#DIRECTION.LEFT;
      disX = screenX - (myTank.X+tankWH);
    }
    if(myTank.Y < whNum*tankWH){
      dirY = this.#DIRECTION.DOWN;
      disY = myTank.Y;
    }else if(myTank.Y > screenY - (whNum+1)*tankWH){
      dirY = this.#DIRECTION.UP;
      disY = screenY - (myTank.Y+tankWH);
    }
    if(dirX != undefined && dirY != undefined){
      if(disX < disY){
        centerDirs.push(dirX);
        centerDirs.push(dirY);
      }else {
        centerDirs.push(dirY);
        centerDirs.push(dirX);
      }
    }else if(dirX != undefined){
      centerDirs.push(dirX);
    }else if(dirY != undefined){
      centerDirs.push(dirY);
    }
  }

  //躲避子弹，优先中心区域
  #avoidBullet(myTank, bullets, tankWH, bulletWH, alreadyTryDirs){

    let moveDir = undefined;
    let dirs = [];
    this.#initCenterDirs(myTank, tankWH, 3, dirs);
    let tmpDir = myTank.direction;
    if(tmpDir == undefined){
      tmpDir = Math.floor(Math.random()*4);
    }
    for(let i=0; i<4; i++, tmpDir++){
      let dir = tmpDir%4;
      if($.inArray(dir, dirs) < 0){
        dirs.push(dir);
      }
    }
    for(let dir of dirs){
      if($.inArray(dir, alreadyTryDirs) >= 0){
        continue;
      }else {
        alreadyTryDirs.push(dir);
      }
      moveDir = this.#tryMoveTank(myTank, dir, bullets, tankWH, bulletWH);
      if(moveDir != undefined){
        return moveDir;
      }
    }
    return moveDir;
  }
  //躲避坦克，优先中心区域
  #avoidTank(myTank, moveDirs, bullets, tankWH, bulletWH, alreadyTryDirs){
    let moveDir = undefined;
    for(let dir of moveDirs){
      if($.inArray(dir, alreadyTryDirs) >= 0){
        continue;
      }else {
        alreadyTryDirs.push(dir);
      }
      moveDir = this.#tryMoveTank(myTank, dir, bullets, tankWH, bulletWH);
      if(moveDir != undefined){
        return moveDir;
      }
    }
    return undefined;
  }

  //开火
  #myTankFire(myTank, aiTankNum, tankWH){
    let fireDir = myTank.direction;

    let mis = 100;
    let fireDis = 2000;

    if(this.#DIRECTION.UP == fireDir){
      fireDis = myTank.Y;
    }else if(this.#DIRECTION.DOWN == fireDir){
      fireDis = screenY - myTank.Y;
    }else if(this.#DIRECTION.LEFT == fireDir){
      fireDis = myTank.X;
      for(let amet of ametal) {
        if (amet[0] + amet[2] < myTank.X - tankWH) {
          if (myTank.Y + tankWH * 3 / 5 > amet[1] && myTank.Y + tankWH * 2 / 5 < amet[1] + amet[3]) {
            let tmpDis = myTank.X - amet[0] + amet[2];
            fireDis = tmpDis < fireDis ? tmpDis : fireDis;
          }
        }
      }
    }else if(this.#DIRECTION.RIGHT == fireDir){
      fireDis = screenX - myTank.X;
      for(let amet of ametal){
        if(amet[0] >= myTank.X+tankWH){
          if(myTank.Y + tankWH*3/5 > amet[1] && myTank.Y + tankWH*2/5 < amet[1]+amet[3]) {
            let tmpDis = amet[0] - (myTank.X+tankWH+5);
            fireDis = tmpDis < fireDis ? tmpDis : fireDis;
          }
        }
      }
    }
    if(fireDis > screenX*0.75){
      mis = 400;
    }else if(fireDis > screenX*0.5){
      mis = 300;
    }else if(fireDis > screenX*0.25){
      mis = 200;
    }
    let c = (new Date()).valueOf();
    if (c - this.firetimestamp > mis) {
      this.firetimestamp = c;
      this.#fire();
      document.onkeyup(this.#fireEv);
    }
  }

  //追击坦克
  #attackTank(myTank, latelyTank, tankWH, bulletWH, bullets, myAiTanks, enTank, enBullets, alreadyTryDirs){

    let moveDir = undefined;
    if(latelyTank == undefined){
      return moveDir;
    }

    let site_R = 1.8*tankWH;
    let site_L = 6.6*tankWH;
    let site_S = 1*tankWH;
    if(latelyTank === enTank){
      let step = this.#enTankNoFire(enBullets, bulletWH);
      if(step > 10){
        site_R = 0*tankWH;
        site_L = 0*tankWH;
        site_S = 0*tankWH;
      }else if(step > 5){
        site_R = 0*tankWH;
        site_L = 5*tankWH;
        site_S = 0*tankWH;
      }else {
        site_R = 0*tankWH;
        site_L = 6*tankWH;
        site_S = 0.5*tankWH;
      }
    }

    let dis = this.#calcTwoPointDistance(myTank.X+tankWH/2, myTank.Y+tankWH/2, latelyTank.X+tankWH/2, latelyTank.Y+tankWH/2);
    if(dis < site_R || this.#isCalcCross(myTank, latelyTank, site_L, site_S, tankWH)){
      return moveDir;
    }

    let atkDisX = Math.abs(myTank.X - latelyTank.X);//横向差距
    let atkDisY = Math.abs(myTank.Y - latelyTank.Y);//纵向差距

    let moveDirArry = [];
    if(myAiTanks.length > 5 || atkDisX > screenX/5){
      if(myAiTanks.length > 5){
        if(myTank.X<screenX/2){
          myAiTanks.sort(function (a, b) { return b.X - a.X;});
        }else {
          myAiTanks.sort(function (a, b) { return a.X - b.X;});
        }
        latelyTank = myAiTanks[1];
      }else {
        if(myTank.Y < 5*tankWH){
          let n = Math.floor(Math.random()*2);
          if(n == 0){
            moveDirArry.push(this.#DIRECTION.DOWN);
          }else {
            if(myTank.X < latelyTank.X){
              moveDirArry.push(this.#DIRECTION.RIGHT);
            }else {
              moveDirArry.push(this.#DIRECTION.LEFT);
            }
          }
        }
      }
      if(atkDisX > 30){
        if(myTank.X > latelyTank.X){
          moveDirArry.push(this.#DIRECTION.LEFT);
        }else {
          moveDirArry.push(this.#DIRECTION.RIGHT);
        }
        if(myTank.Y > latelyTank.Y){
          moveDirArry.push(this.#DIRECTION.UP);
        }else{
          moveDirArry.push(this.#DIRECTION.DOWN);
        }
      }else if(atkDisY > 30){
        if(myTank.Y > latelyTank.Y){
          moveDirArry.push(this.#DIRECTION.UP);
        }else {
          moveDirArry.push(this.#DIRECTION.DOWN);
        }
        if(myTank.X > latelyTank.X){
          moveDirArry.push(this.#DIRECTION.LEFT);
        }else {
          moveDirArry.push(this.#DIRECTION.RIGHT);
        }
      }
    }else if(atkDisX > atkDisY){
      if(atkDisY > 20){
        if(myTank.Y > latelyTank.Y){
          moveDirArry.push(this.#DIRECTION.UP);
        }else {
          moveDirArry.push(this.#DIRECTION.DOWN);
        }
        if(myTank.X > latelyTank.X){
          moveDirArry.push(this.#DIRECTION.LEFT);
        }else {
          moveDirArry.push(this.#DIRECTION.RIGHT);
        }
      }else {
        if(myTank.X > latelyTank.X){
          moveDirArry.push(this.#DIRECTION.LEFT);
        }else {
          moveDirArry.push(this.#DIRECTION.RIGHT);
        }
      }
    }else {
      if (atkDisX > 20) {
        if (myTank.X > latelyTank.X) {
          moveDirArry.push(this.#DIRECTION.LEFT);
        } else {
          moveDirArry.push(this.#DIRECTION.RIGHT);
        }
        if (myTank.Y > latelyTank.Y) {
          moveDirArry.push(this.#DIRECTION.UP);
        } else {
          moveDirArry.push(this.#DIRECTION.DOWN);
        }
      }else {
        if (myTank.Y > latelyTank.Y) {
          moveDirArry.push(this.#DIRECTION.UP);
        } else {
          moveDirArry.push(this.#DIRECTION.DOWN);
        }
      }
    }
    for(let dir of moveDirArry){
      if($.inArray(dir, alreadyTryDirs) >= 0){
        continue;
      }else {
        alreadyTryDirs.push(dir);
      }
      moveDir = this.#tryMoveTank(myTank, dir, bullets, tankWH, bulletWH);
      if(moveDir != undefined){
        return moveDir;
      }
    }
    return moveDir;
  }

  #tryMoveTank(myTank, direction, bullets, tankWH, bulletWH){

    let canMove = this.#canMoveToDir(myTank, direction, bullets, tankWH, bulletWH);
    if(canMove){
      this.#move(direction);
      return direction;
    }else {
      return undefined;
    }
  }

  //障碍阻挡-坦克
  #collisionMetalTank(tank, tankWH){
    for(let met of ametal){
      if(this.#checkSiteCollide(met[0], met[1], met[2], met[3], tank.X, tank.Y, tankWH, tankWH)){
        return true;
      }
    }
    return false;
  }
  //障碍阻挡-子弹
  #collisionMetalBullet(bulletX, bulletY, bulletWH){
    for(let met of ametal){
      if(this.#checkSiteCollide(met[0], met[1], met[2], met[3], bulletX.X-bulletWH/2, bulletY.Y-bulletWH/2, bulletWH, bulletWH)){
        return true;
      }
    }
    return false;
  }

  //障碍逃离方向判断-子弹
  #initCenterDirsMetal(tank, tankWH, centerDirs){
    for(let met of ametal){
      if(this.#checkSiteCollide(met[0], met[1], met[2]+tankWH, met[3]+tankWH, tank.X, tank.Y, tankWH, tankWH)){
        //上下边阻挡,优先左右移动
        if((met[1] < screenY/2 && tank.Y+tankWH < met[1]) || (met[1] > screenY/2 && tank.Y > met[1]+met[3])){
          if(tank.x+tankWH/2 > met[0]+met[2]/2){
            centerDirs.push(this.#DIRECTION.RIGHT)
          }else {
            centerDirs.push(this.#DIRECTION.LEFT)
          }
        }
        //左右边阻挡,优先上下移动
        if((met[0] < screenX/2 && tank.X+tankWH < met[0]) || (met[0] > screenX/2 && tank.X > met[0]+met[2])){
          if(tank.Y+tankWH/2 > met[1]+met[3]/2){
            centerDirs.push(this.#DIRECTION.DOWN)
          }else {
            centerDirs.push(this.#DIRECTION.UP)
          }
        }
      }
    }
    return false;
  }

  //十字相交判断
  #isCalcCross(myTank, latelyTank, siteLong, siteShort, tankWH){
    if(this.#checkSiteCollide(myTank.X+tankWH/2-siteLong/2, myTank.Y+tankWH/2-siteShort/2, siteLong, siteShort, latelyTank.X, latelyTank.Y, tankWH, tankWH)
        || this.#checkSiteCollide(myTank.X+tankWH/2-siteShort/2, myTank.Y+tankWH/2-siteLong/2, siteShort, siteLong, latelyTank.X, latelyTank.Y, tankWH, tankWH)){
      return true;
    }
    return false;
  }

  #enTankNoFire(bullets, bulletWH){
     if(bullets.length < 5){
      return 0;
    }
    let edgeDis = 10;
    for(let bullet of bullets){
      let tmpEdgeDis = 2000;
      if(this.#DIRECTION.UP == bullet.direction){
        if((bullet.X + bulletWH/2 > ametal[0][0] && bullet.X - bulletWH/2 < ametal[0][0]+ametal[0][2])
            || (bullet.X + bulletWH/2 > ametal[1][0] && bullet.X - bulletWH/2 < ametal[1][0]+ametal[1][2])){
          if(bullet.Y > ametal[2][1]+ametal[2][3]){
            edgeDis = bullet.Y-bulletWH/2 - ametal[2][1]+ametal[2][1];
          }else if(bullet.Y > ametal[0][1]+ametal[0][3]){
            edgeDis = bullet.Y-bulletWH/2 - ametal[0][1]+ametal[0][1];
          }
        }else {
          edgeDis = bullet.Y - bulletWH/2;
        }
      }else if(this.#DIRECTION.DOWN == bullet.direction){
        if((bullet.X + bulletWH/2 > ametal[0][0] && bullet.X - bulletWH/2 < ametal[0][0]+ametal[0][2])
            || (bullet.X + bulletWH/2 > ametal[1][0] && bullet.X - bulletWH/2 < ametal[1][0]+ametal[1][2])){
          if(bullet.Y < ametal[0][1]){
            edgeDis =  ametal[2][1] - (bullet.Y+bulletWH/2);
          }else if(bullet.Y < ametal[2][1]){
            edgeDis = ametal[2][1] - (bullet.Y+bulletWH/2);;
          }
        }else {
          edgeDis = screenY - (bullet.Y+bulletWH/2);
        }
      }else if(this.#DIRECTION.LEFT == bullet.direction){
        if((bullet.Y + bulletWH/2 > ametal[0][1] && bullet.Y - bulletWH/2 < ametal[0][1]+ametal[0][3])
            || (bullet.Y + bulletWH/2 > ametal[2][1] && bullet.Y - bulletWH/2 < ametal[2][1]+ametal[2][3])){
          if(bullet.X > ametal[1][0]+ametal[1][2]){
            edgeDis = bullet.X-bulletWH/2 - ametal[1][0]+ametal[1][2];
          }else if(bullet.X > ametal[0][0]+ametal[1][2]){
            edgeDis = bullet.X-bulletWH/2 - ametal[0][0]+ametal[0][2];
          }
        }else {
          edgeDis = bullet.X-bulletWH/2;
        }
      }else if(this.#DIRECTION.RIGHT == bullet.direction){
        if((bullet.Y + bulletWH/2 > ametal[0][1] && bullet.Y - bulletWH/2 < ametal[0][1]+ametal[0][3])
            || (bullet.Y + bulletWH/2 > ametal[2][1] && bullet.Y - bulletWH/2 < ametal[2][1]+ametal[2][3])){
          if(bullet.X + bulletWH/2 < ametal[0][0]){
            edgeDis = ametal[0][0] - (bullet.X+bulletWH/2);
          }else if(bullet.X < ametal[1][0]){
            edgeDis = ametal[1][0] - (bullet.X+bulletWH/2);
          }
        }else {
          edgeDis = screenX - (bullet.X+bulletWH/2);
        }
      }
      edgeDis = tmpEdgeDis < edgeDis ? tmpEdgeDis : edgeDis;
    }
    return edgeDis/10;
  }
})("A");