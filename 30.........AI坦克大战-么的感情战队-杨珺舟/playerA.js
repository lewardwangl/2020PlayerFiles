window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;
    this.cur = undefined
    // 坦克的宽高
    this.currentTankWH = 50;
    // 子弹的宽高
    this.bulletWH = 10;
    // 紧急躲避
    this.bigMove = new Map();
    // limit
    this.limitX = 0;
    this.limitY = 300;
  }

  unitTest() {
    const enemyBullets = aBulletCount;
    const collisionDirections = this.predictAllBulletCollision(enemyBullets, this.currentTankWH, this.bulletWH);
    console.log("nearestTank:"+nearestTank.X +","+nearestTank.Y);
    console.log("cur:"+this.cur.X +","+this.cur.Y);
    this.attackTank(nearestTank,collisionDirections)
  }

  land() {
    // 当前的坦克实例
    this.cur = undefined
    aMyTankCount.forEach(element => {
      var c = element
      if(c['id'] == 100)
      {
        this.cur = c
      }
      if(c['id'] == 200)
      {
        this.enr = c
      }
    });
    const currentTank = this.cur
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

    this.limitX = 0;
    this.limitY = 300;
    const collisionDirections = this.predictAllBulletCollision(enemyBullets, currentTankWH, bulletWH);
    var nearestTank = this.findNearestTank2(enemyTanks,bulletWH);
    console.log("nearestTank:"+nearestTank.direction+","+nearestTank.X +","+nearestTank.Y);
    console.log("cur:"+this.cur.direction+","+this.cur.X +","+this.cur.Y);
    this.attackTank(nearestTank,collisionDirections)

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


  calcTwoPointDistance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
  }

  predictCollision(myTank, bullet, myTankWH, bulletWH) {
    let tx = myTank.X
    let ty = myTank.Y
    // let ts = myTank.speed
    let ts = myTankWH *5
    let bx = bullet.X - bulletWH/2
    let by = bullet.Y - bulletWH/2
    let bs = bullet.speed
    let bd = bullet.direction
    let resultList = [];
    let dis;
    //子弹过近
    let tbdis = this.calcTwoPointDistance(tx+myTankWH/2,ty+myTankWH/2,bx+bulletWH/2,by+bulletWH/2);
    if (tbdis < this.currentTankWH * 3){
      ts = myTankWH * 1.5 + bs*2;
      if (this.PlayercheckCollide(
        tx, ty - ts,
        bx ,by ,
        // bx ,by ,
        myTankWH, ts, bulletWH , bulletWH 
      )){
        console.log("上方会炸");
        resultList.push(this.#DIRECTION.UP);
      }
      if (this.PlayercheckCollide(
        tx, ty+ myTankWH,
        bx ,by ,
        // bx ,by ,
        myTankWH, ts, bulletWH , bulletWH 
      )){
        console.log("下方会炸");
        resultList.push(this.#DIRECTION.DOWN);
      }
      if (this.PlayercheckCollide(
        tx + myTankWH, ty,
        bx ,by ,
        // bx ,by ,
        ts, myTankWH, bulletWH , bulletWH 
      )){
        console.log("右方会炸");
        resultList.push(this.#DIRECTION.RIGHT);
      }
      if (this.PlayercheckCollide(
        tx - ts, ty,
        bx ,by ,
        // bx ,by ,
        ts, myTankWH, bulletWH , bulletWH 
      )){
        console.log("左方会炸");
        resultList.push(this.#DIRECTION.LEFT);
      }
      if (resultList.length == 0){
        ts = myTankWH;
        if (this.PlayercheckCollide(
          tx - ts, ty -ts,
          bx ,by ,
          // bx ,by ,
          ts, ts, bulletWH , bulletWH 
        )){
          console.log("左上方有弹");
          if (bullet.direction == this.#DIRECTION.DOWN){
            resultList.push(this.#DIRECTION.LEFT);
          }
          if (bullet.direction == this.#DIRECTION.RIGHT){
            resultList.push(this.#DIRECTION.UP);
          }
        }
        if (this.PlayercheckCollide(
          tx - ts, ty + myTankWH,
          bx ,by ,
          // bx ,by ,
          ts, ts, bulletWH , bulletWH 
        )){
          console.log("左下方有弹");
          if (bullet.direction == this.#DIRECTION.UP){
            resultList.push(this.#DIRECTION.LEFT);
          }
          if (bullet.direction == this.#DIRECTION.RIGHT){
            resultList.push(this.#DIRECTION.DOWN);
          }
        }
        if (this.PlayercheckCollide(
          tx + myTankWH, ty + myTankWH,
          bx ,by ,
          // bx ,by ,
          ts, ts, bulletWH , bulletWH 
        )){
          console.log("右下方有弹");
          if (bullet.direction == this.#DIRECTION.UP){
            resultList.push(this.#DIRECTION.RIGHT);
          }
          if (bullet.direction == this.#DIRECTION.LEFT){
            resultList.push(this.#DIRECTION.DOWN);
          }
        }
        if (this.PlayercheckCollide(
          tx + myTankWH, ty - ts,
          bx ,by ,
          // bx ,by ,
          ts, ts, bulletWH , bulletWH 
        )){
          console.log("右上方有弹");
          if (bullet.direction == this.#DIRECTION.DOWN){
            resultList.push(this.#DIRECTION.RIGHT);
          }
          if (bullet.direction == this.#DIRECTION.LEFT){
            resultList.push(this.#DIRECTION.UP);
          }
        }
      }
      return resultList;
    }
    let tzx = tx + myTankWH/2;
    let tzy = ty + myTankWH/2;
    let bzx = bx + bulletWH/2;
    let bzy = by + bulletWH/2;
    if (tzx >= bzx){
      if(tzy >= bzy){//左上
        if (bd == this.#DIRECTION.RIGHT){
          let ycha = Math.abs(tzy-bzy);
          if (ycha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx - ts, ty,
              bx + bulletWH ,by ,
              // bx ,by ,
              ts, myTankWH, bs + bulletWH , bulletWH 
            );
            if (dis){
              console.log("左方会炸");
              resultList.push(this.#DIRECTION.LEFT);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx, ty - ts,
          //   bx + bulletWH ,by ,
          //   // bx ,by ,
          //   myTankWH, ts, bs + bulletWH , bulletWH 
          // );
          // if (dis){
          //   console.log("上方会炸");
          //   resultList.push(this.#DIRECTION.UP);
          // }
          
        }
        if (bd == this.#DIRECTION.DOWN){
          let xcha = Math.abs(tzx-bzx);
          if (xcha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx, ty - ts,
              bx ,by + bulletWH ,
              // bx ,by ,
              ts, myTankWH, bulletWH , bs+bulletWH 
            );
            if (dis){
              console.log("上方会炸");
              resultList.push(this.#DIRECTION.UP);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx - ts, ty,
          //   bx ,by + bulletWH ,
          //   // bx ,by ,
          //   ts, myTankWH, bulletWH , bs+bulletWH 
          // );
          // if (dis){
          //   console.log("左方会炸");
          //   resultList.push(this.#DIRECTION.LEFT);
          // }
          
        }
      }else{//左下
        if (bd == this.#DIRECTION.RIGHT){
          let ycha = Math.abs(tzy-bzy);
          if (ycha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx - ts, ty,
              bx + bulletWH ,by ,
              // bx ,by ,
              ts, myTankWH, bs , bulletWH 
            );
            if (dis){
              console.log("左方会炸");
              resultList.push(this.#DIRECTION.LEFT);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx, ty + myTankWH,
          //   bx + bulletWH ,by ,
          //   // bx ,by ,
          //   myTankWH, ts, bs , bulletWH 
          // );
          // if (dis){
          //   console.log("下方会炸");
          //   resultList.push(this.#DIRECTION.DOWN);
          // }
          
        }
        if (bd == this.#DIRECTION.UP){
          let cha = Math.abs(tzx-bzx);
          if (cha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx, ty + myTankWH,
              bx ,by - bs ,
              // bx ,by ,
              myTankWH, myTankWH + ts, bulletWH , bs 
            );
            if (dis){
              console.log("下方会炸");
              resultList.push(this.#DIRECTION.DOWN);
            }
          }
          
          // dis = this.PlayercheckCollide(
          //   tx - ts, ty,
          //   bx ,by - bs ,
          //   // bx ,by ,
          //   ts, myTankWH, bulletWH , bs 
          // );
          // if (dis){
          //   console.log("左方会炸");
          //   resultList.push(this.#DIRECTION.LEFT);
          // }
        }
      }
    }else{
      if(tzy >= bzy){//右上
        if (bd == this.#DIRECTION.LEFT){
          let cha = Math.abs(tzy-bzy);
          if (cha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx + myTankWH, ty,
              bx - bs ,by ,
              // bx ,by ,
              ts, myTankWH, bs, bulletWH 
            );
            if (dis){
              console.log("右方会炸");
              resultList.push(this.#DIRECTION.RIGHT);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx, ty - ts,
          //   bx - bs ,by ,
          //   // bx ,by ,
          //   myTankWH, ts, bs, bulletWH 
          // );
          // if (dis){
          //   console.log("上方会炸");
          //   resultList.push(this.#DIRECTION.UP);
          // }
          
        }
        if (bd == this.#DIRECTION.DOWN){
          let cha = Math.abs(tzx-bzx);
          if (cha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx, ty - ts,
              bx, by + bulletWH,
              // bx ,by ,
              myTankWH, ts, bulletWH , bs 
            );
            if (dis){
              console.log("上方会炸");
              resultList.push(this.#DIRECTION.UP);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx + myTankWH, ty,
          //   bx, by + bulletWH,
          //   // bx ,by ,
          //   ts, myTankWH, bulletWH , bs 
          // );
          // if (dis){
          //   console.log("右方会炸");
          //   resultList.push(this.#DIRECTION.RIGHT);
          // }
        }
      }else{//右下
        if (bd == this.#DIRECTION.LEFT){
          let cha = Math.abs(tzy-bzy);
          if (cha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx + myTankWH, ty,
              bx - bs ,by ,
              // bx ,by ,
              ts, myTankWH, bs , bulletWH 
            );
            if (dis){
              console.log("右方会炸");
              resultList.push(this.#DIRECTION.RIGHT);
            }
          }
          // dis = this.PlayercheckCollide(
          //   tx, ty - ts,
          //   bx - bs ,by ,
          //   // bx ,by ,
          //   myTankWH, ts, bs , bulletWH 
          // );
          // if (dis){
          //   console.log("上方会炸");
          //   resultList.push(this.#DIRECTION.UP);
          // }
          
        }
        if (bd == this.#DIRECTION.UP){
          let cha = Math.abs(tzx-bzx);
          if (cha <= myTankWH/2){
            dis = this.PlayercheckCollide(
              tx, ty + myTankWH,
              bx,by - bs ,
              // bx ,by ,
              myTankWH, ts, bulletWH, bs
            );
            if (dis){
              console.log("上方会炸");
              resultList.push(this.#DIRECTION.UP);
            }
          }
          
          // dis = this.PlayercheckCollide(
          //   tx + myTankWH, ty,
          //   bx ,by - bs ,
          //   // bx ,by ,
          //   ts, myTankWH, bulletWH, bs
          // );
          // if (dis){
          //   console.log("右方会炸");
          //   resultList.push(this.#DIRECTION.RIGHT);
          // }
        }
      }
    }
    return resultList;
  }

  PlayercheckCollide(myTankx, myTanky, zonex, zoney, currentTankWHx, currentTankWHy, bulletWHx, bulletWHy) {
    return this.PlayercheckCollideBase(myTankx, myTanky, currentTankWHx, currentTankWHy, zonex, zoney, bulletWHx, bulletWHy);
  }

  PlayercheckCollideBase(A, B, C, D, E, F, G, H) {
    var rect = this.checkCollideBase(A,B, C, D, E, F, G, H);
    var isCollide = (rect[2] - rect[0]) * (rect[3] - rect[1]) > 0;
    if (isCollide > 0){
      return true;
    }
    return false;
  }

  checkCollideBase(A, B, C, D, E, F, G, H) {
    C += A;//算出矩形1右下角横坐标
    D += B;//算出矩形1右下角纵坐标
    G += E;//算出矩形2右下角横纵标
    H += F;//算出矩形2右下角纵坐标
    if(C <= E || G <= A || D <= F || H <= B){//两个图形没有相交
      return [0, 0, 0, 0];
    }
    var tmpX, tmpY;
    if(E > A){//图形2在图形1右边
      tmpX = G < C ? [E, G] : [E, C];
    }else{//图形2在图形1左边
      tmpX = C < G ? [A, C] : [A, G];
    }
    if(F > B){//图形2在图形1下边
      tmpY = H < D ? [F, H] : [F, D];
    }else{//图形2在图形1上边
      tmpY = D < H ? [B, D] : [B,H];
    }
    return [tmpX[0], tmpY[0], tmpX[1], tmpY[1]];
  }
  /* 
  * 预测可能的碰撞方向
  */
  predictAllBulletCollision(arraybullet, currentTankWH, bulletWH) {
    var collisionDirectMap = new Map();
    var that = this;
    for (const bullet of arraybullet) {
      if (bullet.X < screenX/2){
        if (bullet.direction == that.#DIRECTION.LEFT){
          if (bullet.Y > that.limitY){
            that.limitY = bullet.Y;
          }
        }
        if (bullet.direction == that.#DIRECTION.DOWN){
          if (bullet.X > that.limitX){
            that.limitX = bullet.X;
          }
        }
      }
      
      var collisionDirect = this.predictCollision(this.cur,bullet,currentTankWH,bulletWH);
      if (collisionDirect != undefined && collisionDirect.length > 0){
        collisionDirect.forEach(function (item) {
          if (collisionDirectMap.has(item)){
            let oldBullet = collisionDirectMap.get(item);
            let halfTWH = currentTankWH/2;
            let halfBWH = bulletWH/2;
            let oldDis = that.calcTwoPointDistance(that.cur.X+halfTWH,that.cur.Y+halfTWH,oldBullet.X,oldBullet.Y);
            let newDis = that.calcTwoPointDistance(that.cur.X+halfTWH,that.cur.Y+halfTWH,bullet.X,bullet.Y);
            if(oldDis > newDis){
              collisionDirectMap.set(item, bullet);
            }
            if(item == that.#DIRECTION.UP){
              that.bigMove.set(item,Math.abs(bullet.X,oldBullet.X));
            }else if(item == that.#DIRECTION.RIGHT){
              that.bigMove.set(item,Math.abs(bullet.Y,oldBullet.Y));
            }else if(item == that.#DIRECTION.DOWN){
              that.bigMove.set(item,Math.abs(bullet.X,oldBullet.X));
            }else{
              that.bigMove.set(item,Math.abs(bullet.Y,oldBullet.Y));
            }
          }else{
            collisionDirectMap.set(item, bullet);
          }
          console.log("collision:"+item+",["+bullet.name+"],"+bullet.direction+","+bullet.X +","+bullet.Y);
        });
      }
    }
    console.log(collisionDirectMap);
    return collisionDirectMap
  }

  /* 
  * 寻找最近的tank
  */
  findNearestTank(enemyTanks,bulletWH) {
    let ctx = this.cur.X + this.currentTankWH/2;
    let cty = this.cur.Y + this.currentTankWH/2;
    var nearestTank = enemyTanks[0];
    let nearestDis = this.calcTwoPointDistance(ctx, cty, nearestTank.X + bulletWH/2, nearestTank.Y + bulletWH/2);
    for (const enemy of enemyTanks) {
      const dis = this.calcTwoPointDistance(ctx, cty, enemy.X + bulletWH/2, enemy.Y + bulletWH/2);
      if (dis < nearestDis){
        nearestDis = dis
        nearestTank = enemy
      }
    }
    return nearestTank
  }

  /* 
  * 寻找最近的tank
  */
 findNearestTank2(enemyTanks,bulletWH) {
  if (aTankCount.length > 11){
    var nearestTank;
    for (const enemy of enemyTanks) {
      let dis = this.calcTwoPointDistance(this.cur.X, this.cur.Y, enemy.X, enemy.Y);
      if (dis < this.currentTankWH * 3){
        return enemy;
      }
      if(enemy.X < screenX / 2){
        if (nearestTank == undefined){
          nearestTank = enemy;
        }else{
          if(enemy.X > nearestTank.X){
            nearestTank = enemy;
          }
        }
        if(enemy.X > this.limitX){
          this.limitX = enemy.X;
        }
      }
      if(enemy.Y > this.limitY){
        this.limitY = enemy.Y;
      }
    }
    return nearestTank;
  }
  return this.findNearestTank(enemyTanks,bulletWH);
}

  /* 
  * 攻击tank
  */
  attackTank(enemyTank, excludeDirect) {
    let aimDirect = this.aimTank(enemyTank);
    let traceDirect = this.traceTank(enemyTank,aimDirect,excludeDirect);
    console.log("traceDirect-"+traceDirect)
    const dis = this.calcTwoPointDistance(this.cur.X, this.cur.Y, enemyTank.X, enemyTank.Y)
    if (dis < (this.currentTankWH * 10)){
      var c = (new Date()).valueOf()
      if ((c - this.firetimestamp) > 500) {
        this.firetimestamp = c;
        this.fire(traceDirect);
      }
    }
    this.move(traceDirect);
  }

  /* 
  * 追踪tank
  */
  traceTank(enemyTank, traceDirect, excludeDirect) {
    var direct = traceDirect;
    console.log("this.limitY="+this.limitY);
    console.log("this.limitX="+this.limitX);
    if (aTankCount.length > 11){
      if (this.cur.Y < this.limitY || this.cur.X < this.limitX){
        if(this.cur.Y < this.limitY){
          return this.escapeBullet(this.#DIRECTION.DOWN,excludeDirect);
        }
        return this.escapeBullet(this.#DIRECTION.RIGHT,excludeDirect);
      }
    }
    if((this.cur.X > screenX - 100)){
      return this.escapeBullet(this.#DIRECTION.LEFT,excludeDirect);
    }
    
    const dis = this.calcTwoPointDistance(this.cur.X, this.cur.Y, enemyTank.X, enemyTank.Y)
    if (dis < (this.currentTankWH * 2)){
      console.log("溜了");
      var escapeDirect = this.negativeDirection(direct);;
      if (excludeDirect == undefined || excludeDirect.length == 0){
        return escapeDirect;
      }
      return this.escapeBullet(escapeDirect,excludeDirect);
    }
    return this.escapeBullet(direct,excludeDirect);
  }

  /* 
  * 躲避子弹tank
  */
 escapeBullet(traceDirect, excludeDirect) {
   console.log("traceDirect-----"+traceDirect);
  let cc = excludeDirect.size;
  let escapeDirect;
  if (cc == 0){
    return traceDirect;
  }else if (cc == 1){
    escapeDirect = [...excludeDirect.keys()][0]
    let bullet = excludeDirect.get(escapeDirect);
    return this.escapeBulletForOne(traceDirect,escapeDirect,bullet);
  }else if (cc == 2){
    let ed1 = [...excludeDirect.keys()][0];
    let ed2 = [...excludeDirect.keys()][1];
    let bullet1 = excludeDirect.get(ed1);
    let bullet2 = excludeDirect.get(ed2);
    let td1 = this.escapeBulletForOne(traceDirect,ed1,bullet1);
    let td2 = this.escapeBulletForOne(traceDirect,ed2,bullet2);
    if (td1 == td2){
      return td2;
    }
    let ctx = this.cur.X + this.currentTankWH/2;
    let cty = this.cur.Y + this.currentTankWH/2;
    let dis1 = this.calcTwoPointDistance(ctx, cty, bullet1.X, bullet1.Y);
    let dis2 = this.calcTwoPointDistance(ctx, cty, bullet2.X, bullet2.Y);
    if(td1 == traceDirect){
      if (dis1 < dis2){
        return td1;
      }
      return td2;
    }
    if(td2 == traceDirect){
      if (dis2 < dis1){
        return td2;
      }
      return td1;
    }
    if (dis1 > dis2){
      return td2;
    }
    return td1;
    // return this.escapeBulletForTwo(traceDirect,excludeDirect);
  }else if (cc == 3){
    let ed1 = [...excludeDirect.keys()][0];
    let ed2 = [...excludeDirect.keys()][1];
    let ed3 = [...excludeDirect.keys()][2];
    let bullet1 = excludeDirect.get(ed1);
    let bullet2 = excludeDirect.get(ed2);
    let bullet3 = excludeDirect.get(ed3);
    let td1 = this.escapeBulletForOne(traceDirect,ed1,bullet1);
    let td2 = this.escapeBulletForOne(traceDirect,ed2,bullet2);
    let td3 = this.escapeBulletForOne(traceDirect,ed3,bullet3);
    let map = new Map();
    let ctx = this.cur.X + this.currentTankWH/2;
    let cty = this.cur.Y + this.currentTankWH/2;
    let dis1 = this.calcTwoPointDistance(ctx, cty, bullet1.X, bullet1.Y);
    let dis2 = this.calcTwoPointDistance(ctx, cty, bullet2.X, bullet2.Y);
    let dis3 = this.calcTwoPointDistance(ctx, cty, bullet3.X, bullet3.Y);
    if(td1 != traceDirect){
      map.set(td1,dis1);
    }
    if(td2 != traceDirect){
      let tmpDis = map.get(td2);
      if(undefined != tmpDis){
        if (dis2 < tmpDis){
          map.set(td2,dis2);
        }
      }else{
        map.set(td2,dis2);
      }
    }
    if(td3 != traceDirect){
      let tmpDis = map.get(td3);
      if(undefined != tmpDis){
        if (dis3 < tmpDis){
          map.set(td3,dis3);
        }
      }else{
        map.set(td3,dis3);
      }
    }
    if (map.length == 0){
      return traceDirect;
    }
    let minDis = 10000000;
    let mintd;
    map.forEach((value, key) => {
      if (value < minDis){
        mintd = key;
      }
    });
    return mintd;
  }
  return traceDirect
}

escapeBulletForOne(traceDirect,escapeDirect, bullet){
  let bs = bullet.speed;
  let tankWHGap = this.currentTankWH / 2;
  let bulletWHGap = this.bulletWH / 2;
  let xcha = this.cur.X + tankWHGap - bullet.X;
  let ycha = this.cur.Y + tankWHGap - bullet.Y;
  let safeW = bs*2 + this.currentTankWH;
  if (escapeDirect == this.#DIRECTION.UP){
    let ch = Math.abs(ycha);
    if(bullet.direction != this.#DIRECTION.DOWN && (ch > safeW || traceDirect != this.#DIRECTION.UP)){
      return traceDirect;
    }
    if (xcha > 0){
      return this.#DIRECTION.RIGHT;
    }else if(xcha == 0){
      if(this.cur.X < this.currentTankWH){
        return this.#DIRECTION.RIGHT;
      }else if (this.cur.X > screenX - this.currentTankWH){
        return this.#DIRECTION.LEFT;
      }
    }
    return this.#DIRECTION.LEFT;
  }
  if (escapeDirect == this.#DIRECTION.RIGHT){
    let ch = Math.abs(xcha);
    if(bullet.direction != this.#DIRECTION.LEFT && (ch > safeW || traceDirect != this.#DIRECTION.RIGHT)){
      return traceDirect;
    }
    if (ycha > 0){
      return this.#DIRECTION.DOWN;
    }else if(ycha == 0){
      if(this.cur.Y < this.currentTankWH){
        return this.#DIRECTION.DOWN;
      }else if (this.cur.Y > screenY - this.currentTankWH){
        return this.#DIRECTION.UP;
      }
    }
    return this.#DIRECTION.UP;
  }
  if (escapeDirect == this.#DIRECTION.DOWN){
    let ch = Math.abs(ycha);
    if(bullet.direction != this.#DIRECTION.UP && (ch > safeW || traceDirect != this.#DIRECTION.DOWN)){
      return traceDirect;
    }
    if (xcha > 0){
      return this.#DIRECTION.RIGHT;
    }else if(xcha == 0){
      if(this.cur.X < this.currentTankWH){
        return this.#DIRECTION.RIGHT;
      }else if (this.cur.X > screenX - this.currentTankWH){
        return this.#DIRECTION.LEFT;
      }
    }
    return this.#DIRECTION.LEFT;
  }
  let ch = Math.abs(xcha);
    if(bullet.direction != this.#DIRECTION.RIGHT && (ch > safeW || traceDirect != this.#DIRECTION.LEFT)){
      return traceDirect;
    }
  if (ycha > 0){
    return this.#DIRECTION.DOWN;
  }else if(ycha == 0){
    if(this.cur.Y < this.currentTankWH){
      return this.#DIRECTION.DOWN;
    }else if (this.cur.Y > screenY - this.currentTankWH){
      return this.#DIRECTION.UP;
    }
  }
  return this.#DIRECTION.UP;
}

escapeBulletForTwo(traceDirect, excludeDirectMap) {
  if (excludeDirectMap.has(this.#DIRECTION.UP) && excludeDirectMap.has(this.#DIRECTION.DOWN)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.UP;
      let d2 = this.#DIRECTION.DOWN;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let bd1 = bullet1.direction;
      let bd2 = bullet2.direction;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        if (xcha1 > 0){
          if (bd1 == this.#DIRECTION.UP){
            if (traceDirect != this.#DIRECTION.UP){
              return traceDirect;
            }
          }
          return this.#DIRECTION.RIGHT;
        }
        return this.#DIRECTION.LEFT;
      }
      if (xcha2 > 0){
        return this.#DIRECTION.RIGHT;
      }
      return this.#DIRECTION.LEFT;
    }
  }
  if (excludeDirectMap.has(this.#DIRECTION.UP) && excludeDirectMap.has(this.#DIRECTION.LEFT)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.UP;
      let d2 = this.#DIRECTION.LEFT;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        return this.#DIRECTION.RIGHT;
      }
      return this.#DIRECTION.DOWN;
    }
  }
  if (excludeDirectMap.has(this.#DIRECTION.UP) && excludeDirectMap.has(this.#DIRECTION.RIGHT)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.UP;
      let d2 = this.#DIRECTION.RIGHT;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        return this.#DIRECTION.LEFT;
      }
      return this.#DIRECTION.DOWN;
    }
  }
  if (excludeDirectMap.has(this.#DIRECTION.RIGHT) && excludeDirectMap.has(this.#DIRECTION.DOWN)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.DOWN;
      let d2 = this.#DIRECTION.RIGHT;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        return this.#DIRECTION.LEFT;
      }
      return this.#DIRECTION.UP;
    }
  }
  if (excludeDirectMap.has(this.#DIRECTION.RIGHT) && excludeDirectMap.has(this.#DIRECTION.LEFT)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.LEFT;
      let d2 = this.#DIRECTION.RIGHT;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        if (ycha1 > 0){
          return this.#DIRECTION.DOWN;
        }
        return this.#DIRECTION.UP;
      }
      if (ycha2 > 0){
        return this.#DIRECTION.DOWN;
      }
      return this.#DIRECTION.UP;
    }
  }
  if (excludeDirectMap.has(this.#DIRECTION.DOWN) && excludeDirectMap.has(this.#DIRECTION.LEFT)){
    if(excludeDirectMap.has(traceDirect)){
      let d1 = this.#DIRECTION.DOWN;
      let d2 = this.#DIRECTION.LEFT;
      let bullet1 = excludeDirectMap.get(d1);
      let bullet2 = excludeDirectMap.get(d2);
      let tankWHGap = this.currentTankWH / 2;
      let bulletWHGap = this.bulletWH / 2;
      let tankZX = this.cur.X + tankWHGap;
      let tankZY = this.cur.Y + tankWHGap;
      let bullet1ZX = bullet1.X;
      let bullet1ZY = bullet1.Y;
      let bullet2ZX = bullet2.X;
      let bullet2ZY = bullet2.Y;
      let dis1 = this.calcTwoPointDistance(tankZX,tankZY,bullet1ZX,bullet1ZY);
      let dis2 = this.calcTwoPointDistance(tankZX,tankZY,bullet2ZX,bullet2ZY);
      let xcha1 = tankZX - bullet1ZX;
      let ycha1 = tankZY - bullet1ZY;
      let xcha2 = tankZX - bullet2ZX;
      let ycha2 = tankZY - bullet2ZY;
      if (dis1 < dis2){
        return this.#DIRECTION.RIGHT;
      }
      return this.#DIRECTION.UP;
    }
  }
  return traceDirect;
}

// 反方向
negativeDirection(direct){
  return direct + 2 >= 4 ? direct - 2 : direct + 2;
}

  /* 
  * 瞄准敌方tank
  */
  aimTank(enemyTank) {
    var traceDirect;
    let tankWHGap = this.currentTankWH / 2;
    let xcha = this.cur.X + tankWHGap - enemyTank.X - tankWHGap;
    let ycha = this.cur.Y + tankWHGap - enemyTank.Y - tankWHGap;
    if (xcha < 0){
      if(ycha < 0){//右下
        if ((-1*xcha) > (-1*ycha)){//偏右
          if((-1*ycha) <= tankWHGap){
            return this.#DIRECTION.RIGHT
          }
          return this.#DIRECTION.DOWN
        }
        //偏下
        if((-1*xcha) <= tankWHGap){
          return this.#DIRECTION.DOWN
        }
        return this.#DIRECTION.RIGHT
      }
      if((-1*ycha) <= tankWHGap){
        return this.#DIRECTION.RIGHT
      }
      //右上
      if ((-1*xcha) > (ycha)){//偏右
        if((ycha) <= tankWHGap){
          return this.#DIRECTION.RIGHT
        }
        return this.#DIRECTION.UP
      }
      //偏上
      if((-1*xcha) <= tankWHGap){
        return this.#DIRECTION.UP
      }
      return this.#DIRECTION.RIGHT
    }
    if (xcha == 0){
      if(ycha < 0){//下
        return this.#DIRECTION.DOWN
      }
      //上
      return this.#DIRECTION.UP
    }
    if(ycha < 0){//左下
      if ((xcha) > (-1*ycha)){//偏左
        if((-1*ycha) <= tankWHGap){
          return this.#DIRECTION.LEFT
        }
        return this.#DIRECTION.DOWN
      }
      //偏下
      if((xcha) <= tankWHGap){
        return this.#DIRECTION.DOWN
      }
      return this.#DIRECTION.LEFT
    }
    if (ycha == 0){
      //左
      return this.#DIRECTION.LEFT
    }
    //左上
    if ((xcha) > (ycha)){//偏左
      if((ycha) <= tankWHGap){
        return this.#DIRECTION.LEFT
      }
      return this.#DIRECTION.UP
    }
    //偏上
    if((xcha) <= tankWHGap){
      return this.#DIRECTION.UP
    }
    return this.#DIRECTION.LEFT
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
    ).value = "么的感情"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "么的感情"
  }
  // 控制移动   举例子：  向左移动： this.move(this.#DIRECTION.LEFT)
  move(direction) {
    if (typeof direction === undefined) return;
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction);
    document.onkeydown(this.#moveEv);
  }
  // 开火
  fire(direction) {
    this.#fireEv.keyCode = this.type === "A" ? 32 : 8;
    document.onkeydown(this.#fireEv);
  }

  // 判断是否快到边界了
  isNearBoundary(X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
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
      this.isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.isNearBoundary(X, Y, this.#DIRECTION.UP) ||
      this.isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
      this.isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    );
  }

  collisionMetal(x,y,r){
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