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
    const currentTank = cur
    const enemyTank = enr
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
    
    var BulletArray = new Array();
    for(var i=0;i<5;i++){        //一维长度为5
        BulletArray[i] = new Array();
        for(var j=0;j<5;j++){    //二维长度为5
            BulletArray[i][j] = this.#DIRECTION.STOP;
        }
    }
    this.#calcBulletArray(enemyBullets, currentTankX, currentTankY, BulletArray, currentTankWH, bulletWH)
    console.log(BulletArray)
    

    var isneedfire = false
    var isattack = true
    
    if(this.#DIRECTION.DOWN == BulletArray[1][2] || this.#DIRECTION.UP == BulletArray[3][2] || this.#DIRECTION.RIGHT == BulletArray[2][1] || this.#DIRECTION.LEFT == BulletArray[2][3]){
        isattack = false
    }
    if(BulletArray[1][2] > 4 || BulletArray[3][2] > 4 || BulletArray[2][1] > 4 || BulletArray[2][3] > 4){
        isattack = false
    }
    if(BulletArray[2][2] != this.#DIRECTION.STOP){
        isattack = false
    }
    
    console.log("LasttimeDefendAttackState ==========", this.LasttimeDefendAttackState) 
    if(isattack){
        moveDirection = this.#attackWithBulletArray(enemyTanks, currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection)//计算攻击方向
        this.LasttimeDefendAttackState = "attack"
        console.log("attackWithBulletArray moveDirection", moveDirection) 
    }else{
        moveDirection = this.#avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection)//计算躲避方向
        this.LasttimeDefendAttackState = "defend"
        console.log("avoidBulletWithBulletArray moveDirection", moveDirection) 
    }
    
    if(moveDirection == "noattack"){
        moveDirection = this.#avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection)
        console.log("avoidBulletWithBulletArray moveDirection noattack", moveDirection) 
    }
    
    if(this.priority == this.#DIRECTION.UP && currentTankX <= 250 && enemyTanks.length > 15){
        if (c - this.firetimestamp > 100) {
          console.log("fast fire========") 
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }  
    }
    //定时开火
    var c = (new Date()).valueOf()
    if (c - this.firetimestamp > 700) {
      this.firetimestamp = c
      this.#fire();
      document.onkeyup(this.#fireEv);
    }

    if(this.isneedfire && moveDirection == this.priority){
        if (c - this.firetimestamp > 300) {
          console.log("fast fire========") 
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }  
    }
    
    //移动坦克
    this.#move(moveDirection);
    if (undefined != moveDirection) {
      console.log(moveDirection)
    }
    this.priority=moveDirection
    
    this.#setName();
  }

  leave() {
    this.#setName();
    //this.drawBulletArrayMark();
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
  
  MustDIRECTION = {
    mustUP: 5,
    mustRIGHT: 6,
    mustDOWN: 7,
    mustLEFT: 8,
    mustNotUP: 9,
    mustNotRIGHT: 10,
    mustNotDOWN: 11,
    mustNotLEFT: 12,
  };
  
  LasttimeDefendAttackState = "defend"
  
  // 开火事件
  #fireEv;
  // 移动事件
  #moveEv;

  /*
  00  01  02  03  04
  10  11  12  13  14 
  20  21  22  23  24
  30  31  32  33  34
  40  41  42  43  44  
  我方坦克在22处
  */
  #calcBulletArray(arraybullet, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH) {
    var dis
    var thresholdvalue = 41
    for (const bullet of arraybullet) { 
      for(var i=-2;i<3;i++){       
        for(var j=-2;j<3;j++){ 
          var xn = 0
          var xnc = 0  
          var yn = 0
          var ync = 0
          if(i > 0){
            xn = 1
          }
          if(j > 0){
            yn = 1 
          }
          if(i == 0){
            xnc = 1
          }
          if(j == 0){
            ync = 1 
          }
          dis = this.#collision(
            currentTankX + i*81 - xn*30,
            currentTankY + j*81 - yn*30,
            bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
            (80+2-xnc*30), (80+2-ync*30), bulletWH * 1.2, bulletWH * 1.2
          );
          if (true == dis) {
            if(bullet.direction == this.#DIRECTION.DOWN){

                if(currentTankY-(bullet.Y+5) > 0 && currentTankY-(bullet.Y+5) < thresholdvalue){
                    if((bullet.X-5)-currentTankX >= 0 && (bullet.X+5)-currentTankX <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                    }
                    if((bullet.X-5)-(currentTankX+25) >= 0 && (bullet.X+5)-(currentTankX+25) <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                    }
                }
            }
            
            if(bullet.direction == this.#DIRECTION.UP){
                if((currentTankY+50)-(bullet.Y-5) < 0 && (bullet.Y-5)-(currentTankY+50) < thresholdvalue){
                    if((bullet.X-5)-currentTankX >= 0 && (bullet.X+5)-currentTankX <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                    }
                    if((bullet.X-5)-(currentTankX+25) >= 0 && (bullet.X+5)-(currentTankX+25) <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                    }
                }
            }
            
            if(bullet.direction == this.#DIRECTION.LEFT){
                if((currentTankX+50)-(bullet.X-5) < 0 && (bullet.X-5)-(currentTankX+50) < thresholdvalue){
                    if((bullet.Y-5)-currentTankY >= 0 && (bullet.Y+5)-currentTankY <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                    }
                    if((bullet.Y-5)-(currentTankY+25) >= 0 && (bullet.Y+5)-(currentTankY+25) <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                    }
                }
            }
            
            if(bullet.direction == this.#DIRECTION.RIGHT){
                if(currentTankX-(bullet.X+5) > 0 && currentTankX-(bullet.X+5) < thresholdvalue){
                    if((bullet.Y-5)-currentTankY >= 0 && (bullet.Y+5)-currentTankY <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                    }
                    if((bullet.Y-5)-(currentTankY+25) >= 0 && (bullet.Y+5)-(currentTankY+25) <= 25){
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                    }
                }
            }
            
            if(Bullet[j+2][i+2] == this.#DIRECTION.STOP){         
                if(j==-1 && i==-1 && currentTankX-(bullet.X+5) > 0 && currentTankX-(bullet.X-5) < 50 && currentTankY-bullet.Y > -5 && currentTankY-bullet.Y < 5 && bullet.direction == 1){
                    Bullet[1][1] = 4
                }else if(j==-1 && i==1 && (bullet.X+5)-(currentTankX+50) > 0 && (bullet.X+5)-(currentTankX+50) < 50 && currentTankY-bullet.Y > -5 && currentTankY-bullet.Y < 5 && bullet.direction == 3){
                    Bullet[1][3] = 4
                }else{
                    Bullet[j+2][i+2] = bullet.direction
                }
            }else{
                if(Bullet[j+2][i+2] < 4){
                    if(j==-1 && i==0 && bullet.direction == 2){
                        Bullet[j+2][i+2] = bullet.direction
                    }
                    if(j==1 && i==0 && bullet.direction == 0){
                        Bullet[j+2][i+2] = bullet.direction
                    }
                    if(j==0 && i==-1 && bullet.direction == 1){
                        Bullet[j+2][i+2] = bullet.direction
                    }
                    if(j==0 && i==1 && bullet.direction == 3){
                        Bullet[j+2][i+2] = bullet.direction
                    } 
                }
            }

            if(j==-1 && i==-1 && bullet.direction == 1){
                Bullet[j+2][i+2] = bullet.direction
            }
            
            if(j==1 && i==1 && bullet.direction == 0){
                Bullet[j+2][i+2] = bullet.direction
            }
            
            if(j==0 && i==-1 && bullet.direction == 1){
                Bullet[j+2][i+2] = bullet.direction
            }
            if(j==0 && i==1 && bullet.direction == 3){
                Bullet[j+2][i+2] = bullet.direction
            } 

          }
        }
      }
    }
    //console.log(Bullet)
  }
    
  #checkMustDirection(BulletArray) {
    for(var i1=0;i1<BulletArray.length;i1++){
        for(var j1 =0;j1<BulletArray[i1].length; j1++){
            if(BulletArray[i1][j1] > 4){
                console.log("=============getmust")
                //console.log("=============this.MustDIRECTION.mustDOWN", this.MustDIRECTION.mustDOWN)
                if(BulletArray[i1][j1] == 7){
                    return 2
                }
                if(BulletArray[i1][j1] == 5){
                    return 0
                }
                if(BulletArray[i1][j1] == 8){
                    return 3
                }
                if(BulletArray[i1][j1] == 6){
                    return 1
                }
            }
        }
    } 
    return "nomust"
  }
  
  drawBulletArrayMark() {
    var cur = undefined
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    aMyTankCount.forEach(element => {
      var c = element
      if(c['id'] == 100)
      {
        cur = c
      }
    });

    for(var i=-2;i<3;i++){       
      for(var j=-2;j<3;j++){ 
        var xn = 0
        var xnc = 0  
        var yn = 0
        var ync = 0
        if(i > 0){
          xn = 1
        }
        if(j > 0){
          yn = 1 
        }
        if(i == 0){
          xnc = 1
        }
        if(j == 0){
          ync = 1 
        }
        ctx.strokeRect(cur.X + i*81 - xn*30, cur.Y + j*81 - yn*30, (80+2-xnc*30), (80+2-ync*30));
      }  
    }

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
  
  #attackWithBulletArray(enemyTanks, currentTankX, currentTankY, currentTankWH, Bullet, moveDirection) {
      var ismust = this.#checkMustDirection(Bullet)
      console.log("ismust=============", ismust)
      if(ismust != "nomust"){
          return ismust;
      }

      var nearestEnemy = undefined
      var nearestdis = 9999

      for (var enemy of enemyTanks) {
        var dis = this.#calcTwoPointDistance(
          currentTankX,
          currentTankY,
            enemy.X,
            enemy.Y 
        );
    
        if(enemy['id'] != 200){//这是判断是不是对手的坦克，在最后PVP时要去掉
            if(enemyTanks.length > 16){
                if(enemy.X > 80 && enemy.Y > 80 && enemy.X < canvas.width-80 && enemy.Y < canvas.height-80){//不能太靠边
                    if (nearestdis > dis) {
                      nearestdis = dis;
                      nearestEnemy = enemy;
                    } 
                }    
            }else{
                    if (nearestdis > dis) {
                      nearestdis = dis;
                      nearestEnemy = enemy;
                    } 
            }
        }
      }

      if (undefined != nearestEnemy) {
        var disX = Math.abs(nearestEnemy.X - currentTankX)
        var disY = Math.abs(nearestEnemy.Y - currentTankY)
        
        if(enemyTanks.length > 15){
          //if((disX + disY) < 200){
          if((disX<150 && disY<150)){

              if ((disX < disY) && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.DOWN)
                    return this.#DIRECTION.DOWN;
                }
              } else if ((disX < disY) && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.UP)
                    return this.#DIRECTION.UP;                    
                }                
              } else if ((disX >= disY) && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.LEFT)
                    return this.#DIRECTION.LEFT;                    
                }                      
              } else if ((disX >= disY) && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.RIGHT)
                    return this.#DIRECTION.RIGHT;                    
                }                  
              }
              console.log("躲避============= null")
              return "noattack"
            }    
        }else{
            //if((disX + disY) < 170){
            if((disX<120 && disY<120)){

              if ((disX < disY) && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.DOWN)
                    return this.#DIRECTION.DOWN;                    
                }
              } else if ((disX < disY) && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.UP)
                    return this.#DIRECTION.UP; 
                }  
              } else if ((disX >= disY) && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.LEFT)
                    return this.#DIRECTION.LEFT;                    
                }     
              } else if ((disX >= disY) && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    console.log("太近了=============躲避", this.#DIRECTION.RIGHT)
                    return this.#DIRECTION.RIGHT;                    
                }   
              }
              console.log("躲避============= null")
              return "noattack"
            }   
            
        }

        //计算开炮
        if(disX < 25 && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
            if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

            }else{
                this.isneedfire = true
                if (moveDirection != this.#DIRECTION.UP) {
                  moveDirection = this.#DIRECTION.UP  
                  console.log("炮口调整", moveDirection)
                  return this.#DIRECTION.UP;
                }
                return moveDirection                 
            }  
        }
        if(disX < 25 && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    this.isneedfire = true
                    if (moveDirection != this.#DIRECTION.DOWN) {
                      moveDirection = this.#DIRECTION.DOWN  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.DOWN;
                    }
                    return moveDirection                 
                }              
        }
        
        if(disY < 25 && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    this.isneedfire = true
                    if (moveDirection != this.#DIRECTION.LEFT) {
                      moveDirection = this.#DIRECTION.LEFT  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.LEFT;
                    }
                    return moveDirection                   
                }              

        }
        if(disY < 25 && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    this.isneedfire = true
                    if (moveDirection != this.#DIRECTION.RIGHT) {
                      moveDirection = this.#DIRECTION.RIGHT  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.RIGHT;
                    }
                    return moveDirection               
                }              

        }        
        
        //计算移动
        if(enemyTanks.length > 16){
            if(currentTankX < canvas.width/2){
                if(currentTankX > 150 && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.RIGHT != Bullet[2][0] && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.UP != Bullet[3][1]){
                    if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                    }else{
                        console.log("追击1=============", this.#DIRECTION.LEFT)
                        return this.#DIRECTION.LEFT;                        
                    }
                }
                
                if(currentTankY > 250 && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.DOWN != Bullet[0][2] && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.LEFT != Bullet[1][3]){
                    if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                    }else{
                        console.log("追击2=============", this.#DIRECTION.UP)
                        return this.#DIRECTION.UP;                        
                    }  
                }                
            }else{
                if(currentTankX < canvas.width-150 && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.LEFT != Bullet[2][4] && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.UP != Bullet[3][3]){
                    if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                    }else{
                        console.log("追击1=============", this.#DIRECTION.RIGHT)
                        return this.#DIRECTION.RIGHT;                        
                    }
                }
                
                if(currentTankY > 250 && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.DOWN != Bullet[0][2] && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.LEFT != Bullet[1][3]){
                    if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                    }else{
                        console.log("追击2=============", this.#DIRECTION.UP)
                        return this.#DIRECTION.UP;                        
                    }  
                }                
            }
            
            //保守
            if ((nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    console.log("追击1=============", this.#DIRECTION.RIGHT)
                    return this.#DIRECTION.RIGHT;                    
                }
            } 
        
            if ((nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    console.log("追击1=============", this.#DIRECTION.LEFT)
                    return this.#DIRECTION.LEFT;                    
                }
            }
        }else{
            if ((nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    console.log("追击2=============", this.#DIRECTION.RIGHT)
                    return this.#DIRECTION.RIGHT;                    
                }   
            } 
            
            if ((nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    console.log("追击2=============", this.#DIRECTION.LEFT)
                    return this.#DIRECTION.LEFT;                    
                }    
            }            
        }
              
        if ((nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    console.log("追击2=============", this.#DIRECTION.UP)
                    return this.#DIRECTION.UP;                    
                }  
        } 
        
        //if ((disX < disY) && (nearestEnemy.Y >= currentTankY)&& this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {
        if ((nearestEnemy.Y >= currentTankY)&& this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    console.log("追击2=============", this.#DIRECTION.DOWN)
                    return this.#DIRECTION.DOWN;                    
                }
        } 

        console.log("追击============= null")
        return "noattack"
      }
  }

  #avoidBulletWithBulletArrayEasy(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection) {

        return "safe"
  }
  
  #avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection) {
      
      var ismust = this.#checkMustDirection(Bullet)
      if(ismust != "nomust"){
          return ismust;
      }
      
      var moveDirectionleft = undefined
      var moveDirectionright = undefined
      var moveDirectionup = undefined
      var moveDirectiondown = undefined

      console.log("this.priority--"+this.priority)
      if (this.#DIRECTION.DOWN == Bullet[1][2] || this.#DIRECTION.UP == Bullet[3][2] || this.#DIRECTION.UP == Bullet[2][2] || this.#DIRECTION.DOWN == Bullet[2][2]) { //必须左右移动
        console.log("准备左移或者右移--")
        if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
          ) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.UP != Bullet[3][1] && this.#DIRECTION.RIGHT != Bullet[2][0] && this.#DIRECTION.STOP == Bullet[2][1]) {
            moveDirectionleft = this.#DIRECTION.LEFT;
            console.log("准备左移--")
            if(this.priority == this.#DIRECTION.LEFT){//防止来回抖动
                console.log("安全躲避移动左1--")
                return moveDirectionleft 
            }
            if(this.#DIRECTION.DOWN == Bullet[0][1] || this.#DIRECTION.UP == Bullet[4][1] || this.#DIRECTION.DOWN == Bullet[1][0] || this.#DIRECTION.UP == Bullet[3][0]){

            }else{
                //console.log("安全躲避移动左--")
                //return moveDirectionleft
            }
        }
        if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
        ) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.UP != Bullet[3][3] && this.#DIRECTION.LEFT != Bullet[2][4] && this.#DIRECTION.STOP == Bullet[2][3]) {       
            moveDirectionright = this.#DIRECTION.RIGHT;
            console.log("准备右移--")
            if(this.priority == this.#DIRECTION.RIGHT){//防止来回抖动
                console.log("安全躲避移动右1--")
                return moveDirectionright 
            }
            if(this.#DIRECTION.DOWN == Bullet[0][3] || this.#DIRECTION.UP == Bullet[4][3] || this.#DIRECTION.DOWN == Bullet[1][4] || this.#DIRECTION.UP == Bullet[3][4]){

            }else{
                //console.log("安全躲避移动右--")
                //return moveDirectionright
            }
        }
        if(moveDirectionright != undefined && this.priority == this.#DIRECTION.RIGHT){
            console.log("相对安全右1")
            return moveDirectionright;
        }
        if(moveDirectionleft != undefined && this.priority == this.#DIRECTION.LEFT){
            console.log("相对安全左1")
            return moveDirectionleft;
        }
        if(moveDirectionright != undefined){
            console.log("相对安全右2")
            return moveDirectionright;
        }
        if(moveDirectionleft != undefined){
            console.log("相对安全左2")
            return moveDirectionleft;
        }
        if(this.priority == this.#DIRECTION.LEFT || this.priority == this.#DIRECTION.RIGHT){
            console.log("保持11")
            return this.priority//都不安全，保持当前方向
        }
        console.log("死就死了--")
        return this.#DIRECTION.RIGHT//都不安全，保持当前方向
      }
      
      if (this.#DIRECTION.RIGHT == Bullet[2][1] || this.#DIRECTION.LEFT == Bullet[2][3] || this.#DIRECTION.RIGHT == Bullet[2][2] || this.#DIRECTION.LEFT == Bullet[2][2]) { //必须上下移动
        console.log("准备上移或者下移--")
        if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
          ) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.LEFT != Bullet[1][3] && this.#DIRECTION.DOWN != Bullet[0][2] && this.#DIRECTION.STOP == Bullet[1][2]) {
            moveDirectionup = this.#DIRECTION.UP;
            console.log("准备上移--")
            if(this.priority == this.#DIRECTION.UP){
                console.log("安全躲避移动上1--")
                return moveDirectionup 
            }
            if(this.#DIRECTION.RIGHT == Bullet[0][1] || this.#DIRECTION.LEFT == Bullet[0][3] || this.#DIRECTION.RIGHT == Bullet[1][0] || this.#DIRECTION.LEFT == Bullet[1][4]){

            }else{
                //console.log("安全躲避移动上--")
                //return moveDirectionup
            }
        }
        if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
        ) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.LEFT != Bullet[3][3] && this.#DIRECTION.UP != Bullet[4][2] && this.#DIRECTION.STOP == Bullet[3][2]) {       
            console.log("准备下移--")
            moveDirectiondown = this.#DIRECTION.DOWN;
            if(this.priority == this.#DIRECTION.DOWN){
                console.log("安全躲避移动下1--")
                return moveDirectiondown 
            }
            if(this.#DIRECTION.RIGHT == Bullet[3][0] || this.#DIRECTION.LEFT == Bullet[3][4] || this.#DIRECTION.RIGHT == Bullet[4][1] || this.#DIRECTION.LEFT == Bullet[4][3]){

            }else{
                //console.log("安全躲避移动下--")
                //return moveDirectiondown
            }
        }
        if(moveDirectiondown != undefined && this.priority == this.#DIRECTION.DOWN){
            console.log("相对安全下1")
            return moveDirectiondown;
        }
        if(moveDirectionup != undefined && this.priority == this.#DIRECTION.UP){
            console.log("相对安全上1")
            return moveDirectionup;
        }
        if(moveDirectiondown != undefined){
            console.log("相对安全下2")
            return moveDirectiondown;
        }
        if(moveDirectionup != undefined){
            console.log("相对安全上2")
            return moveDirectionup;
        }
        if(this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.DOWN){
            console.log("保持11")
            return this.priority//都不安全，保持当前方向
        }
        console.log("死就死了--")
        return this.#DIRECTION.DOWN//都不安全，保持当前方向
      }
    
    /*if (this.#DIRECTION.RIGHT == Bullet[1][1] || this.#DIRECTION.LEFT == Bullet[1][1] || this.#DIRECTION.STOP != Bullet[1][2] || this.#DIRECTION.RIGHT == Bullet[1][3] || this.#DIRECTION.LEFT == Bullet[1][3] ) {//非必要移动
        if(this.#DIRECTION.STOP == Bullet[3][2]){
            console.log("非必要躲避移动上--")
            this.priority = this.#DIRECTION.UP;
            return this.#DIRECTION.UP
        }
    }
    
    if (this.#DIRECTION.RIGHT == Bullet[3][1] || this.#DIRECTION.LEFT == Bullet[3][1] || this.#DIRECTION.STOP != Bullet[3][2] || this.#DIRECTION.RIGHT == Bullet[3][3] || this.#DIRECTION.LEFT == Bullet[3][3] ) {//非必要移动
        if(this.#DIRECTION.STOP == Bullet[1][1]){
            console.log("非必要躲避移动下--")
            this.priority = this.#DIRECTION.DOWN;
            return this.#DIRECTION.DOWN  
        }
    }
    
    if (this.#DIRECTION.UP == Bullet[1][1] || this.#DIRECTION.DOWN == Bullet[1][1] || this.#DIRECTION.STOP != Bullet[2][1] || this.#DIRECTION.UP == Bullet[3][1] || this.#DIRECTION.DOWN == Bullet[3][1] ) {//非必要移动
        if(this.#DIRECTION.STOP == Bullet[2][3]){
            console.log("非必要躲避移动右--")
            this.priority = this.#DIRECTION.RIGHT;
            return this.#DIRECTION.RIGHT
        }
    }
    
    if (this.#DIRECTION.UP == Bullet[1][3] || this.#DIRECTION.DOWN == Bullet[1][3]  || this.#DIRECTION.STOP != Bullet[2][3] || this.#DIRECTION.UP == Bullet[3][3] || this.#DIRECTION.DOWN == Bullet[3][3] ) {//非必要移动
        if(this.#DIRECTION.STOP == Bullet[2][1]){
            console.log("非必要躲避移动下--")
            this.priority = this.#DIRECTION.LEFT;
            return this.#DIRECTION.LEFT 
        }
    }*/
    
    console.log("保持--")    
    return this.#DIRECTION.STOP
  }

  #calcTanksCenter(Tanks) {
    var centerX = 0
    var centerY = 0
    for (const enemy of Tanks) {
        centerX += enemy.X
        centerY += enemy.Y
    }
    var center=new Array(centerX/2,centerY/2);
    //console.log("=============tankscenterX:"+centerX/2)
    //console.log("=============tankscenterY:"+centerY/2)
    return center;
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
    ).value = "畅游业务服务队"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "畅游业务服务队"
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
})("B");