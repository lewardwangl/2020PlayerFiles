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
        if (this.type == 'A') {
            if(c['id'] == 100)
            {
                cur = c
            }
            if(c['id'] == 200)
            {
                enr = c
            }
        } else {
             if(c['id'] == 200)
            {
                cur = c
            }
            if(c['id'] == 100)
            {
                enr = c
            }           
        }
        //console.log("=============1c id:"+c['id'])
        //console.log("=============1this.type:"+this.type)
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
    
    //计算敌方坦克群的中心点
    //var tanscenter = this.#calcTanksCenter(enemyTanks)

    //计算子弹矩阵
    var BulletArray = new Array();
    for(var i=0;i<5;i++){        //一维长度为5
        BulletArray[i] = new Array();
        for(var j=0;j<5;j++){    //二维长度为5
            BulletArray[i][j] = this.#DIRECTION.STOP;
        }
    }
    
    var CollideWallArray = new Array();
    for(var i=0;i<5;i++){        //一维长度为5
        CollideWallArray[i] = new Array();
        for(var j=0;j<5;j++){    //二维长度为5
            CollideWallArray[i][j] = this.#DIRECTION.STOP;
        }
    }
    
    this.#calcBulletArray(enemyBullets, currentTankX, currentTankY, BulletArray, currentTankWH, bulletWH)
    this.#calcBulletArrayisCollideWall(currentTankX, currentTankY, CollideWallArray, currentTankWH, bulletWH)
    //console.log(BulletArray)
    //console.log(CollideWallArray)
    
    //是否需要开火
    var isneedfire = false
    var mustfire = false
    
    //进攻还是躲避
    var isattack = true
    
    //激进型（前后左右没致命子弹就进攻）
    if(this.#DIRECTION.DOWN == BulletArray[1][2] || this.#DIRECTION.UP == BulletArray[3][2] || this.#DIRECTION.RIGHT == BulletArray[2][1] || this.#DIRECTION.LEFT == BulletArray[2][3]){
        isattack = false
    }
    if(BulletArray[1][2] > 4 || BulletArray[3][2] > 4 || BulletArray[2][1] > 4 || BulletArray[2][3] > 4){
        isattack = false
    }
    if(BulletArray[2][2] != this.#DIRECTION.STOP){
        isattack = false
    }
    
    if(BulletArray[0][2] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    if(BulletArray[1][2] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    //A出生点时起作用
    if(BulletArray[1][1] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    if(BulletArray[0][1] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    if(BulletArray[0][0] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    if(BulletArray[1][0] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    //B出生点时起作用
    if(BulletArray[1][3] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }
    if(BulletArray[0][3] != this.#DIRECTION.STOP){
        this.firstBullet = false
    }    
    if(BulletArray[0][4] != this.#DIRECTION.STOP){
        this.firstBullet = false
    } 
    if(BulletArray[1][4] != this.#DIRECTION.STOP){
        this.firstBullet = false
    } 
    /*
    //保守型（子弹矩阵内没子弹才进攻）
    for(var i1=0;i1<BulletArray.length;i1++){
        for(var j1 =0;j1<BulletArray[i1].length; j1++){
            if(BulletArray[i1][j1] != this.#DIRECTION.STOP){
                isattack = false
                break
            }
        }
    } 
    */
    console.log("LasttimeDefendAttackState ==========", this.LasttimeDefendAttackState) 
    if(isattack){
        moveDirection = this.#attackWithBulletArray(enemyTanks, currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection, CollideWallArray)//计算攻击方向
        this.LasttimeDefendAttackState = "attack"
        console.log("attackWithBulletArray moveDirection", moveDirection) 
    }else{
        moveDirection = this.#avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection, CollideWallArray)//计算躲避方向
        this.LasttimeDefendAttackState = "defend"
        this.firstBullet = false
        console.log("avoidBulletWithBulletArray moveDirection", moveDirection) 
    }
    
    if(moveDirection == "noattack"){
        moveDirection = this.#avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, BulletArray, moveDirection, CollideWallArray)
        console.log("avoidBulletWithBulletArray moveDirection noattack", moveDirection) 
    }
    
    //开局时向上攻击优先
    //if(moveDirection == this.#DIRECTION.UP && currentTankX <= 300 && enemyTanks.length > 12){//enemyTanks.length > 12是因为旗鼓相当的时候，这个值降得很快
    if(this.priority == this.#DIRECTION.UP && currentTankX <= 300 && enemyTanks.length > 12){//enemyTanks.length > 12是因为旗鼓相当的时候，这个值降得很快
        if (c - this.firetimestamp > 50) {
          console.log("fast fire1========",this.priority) 
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }  
    }
    if(this.mustfire){
        if (c - this.firetimestamp > 40) {//20毫秒=1个tick，所以firetimestamp应该为20的整数倍
          console.log("fast fire5========",this.priority) 
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }  
    }
    //定时开火
    var c = (new Date()).valueOf()
    if (c - this.firetimestamp > 800) {//保证需要连发的时候能连发
      console.log("fire========",this.priority) 
      this.firetimestamp = c
      this.#fire();
      document.onkeyup(this.#fireEv);
    }
    //角度好快速fire
    if(this.isneedfire){
    //if(this.isneedfire && moveDirection == this.priority){
        //同一时刻屏幕上只能有你的5颗子弹，子弹从屏幕的一边飞到另一边要好久
        var slowdown = false
        if(currentTankX < 700 && this.priority == this.#DIRECTION.RIGHT){
            slowdown = true
        }
        if(currentTankX > canvas.width-700 && this.priority == this.#DIRECTION.LEFT){
            slowdown = true
        }
        if(currentTankY > 500 && this.priority == this.#DIRECTION.UP){
            slowdown = true
        }
        if(currentTankY < canvas.height-500 && this.priority == this.#DIRECTION.DOWN){
            slowdown = true
        }
        if(slowdown){
            if (c - this.firetimestamp > 500) {
              console.log("fast fire2========",this.priority) 
              this.firetimestamp = c
              this.#fire();
              document.onkeyup(this.#fireEv);
            }              
        }else{
            if (c - this.firetimestamp > 150) {
              console.log("fast fire2========",this.priority) 
              this.firetimestamp = c
              this.#fire();
              document.onkeyup(this.#fireEv);
            }              
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
    WallorMetal: 13,//墙或铁块，只是墙的话，可以通过距离来判断，但是考虑到途中的铁块，就统一加了一种类型
  };
  
  LasttimeDefendAttackState = "defend"//defend表示躲避致命攻击，attackwithdefend是进攻的时候躲避近距离坦克
  firstBullet = true
  
  // 开火事件
  #fireEv;
  // 移动事件
  #moveEv;

  #calcBulletArrayisCollideWall(currentTankX, currentTankY, CollideWallArray, currentTankWH, bulletWH) {//计算撞墙矩阵     
    var isCollideWall = false
    var nearWallDis = 55//这个值不能大于80，否则会影响到坦克所在的行或列
    for(var i=-2;i<3;i++){       
      for(var j=-2;j<3;j++){ 
        isCollideWall = false
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
        
        if(isCollideWall == false && currentTankX + i*81 - xn*30 < nearWallDis){
            isCollideWall = this.#isNearBoundary(currentTankX + i*81 - xn*30, currentTankY + j*81 - yn*30, this.#DIRECTION.LEFT, currentTankWH)
        } 
        
        if(isCollideWall == false && currentTankY + j*81 - yn*30 < nearWallDis){
            isCollideWall = this.#isNearBoundary(currentTankX + i*81 - xn*30, currentTankY + j*81 - yn*30, this.#DIRECTION.UP, currentTankWH)
        }
        
        if(isCollideWall == false && currentTankX + i*81 - xn*30 > canvas.width - nearWallDis){
            isCollideWall = this.#isNearBoundary(currentTankX + i*81 - xn*30, currentTankY + j*81 - yn*30, this.#DIRECTION.RIGHT, currentTankWH)
        }
        
        if(isCollideWall == false && currentTankY + j*81 - yn*30 > canvas.hight - nearWallDis){
            isCollideWall = this.#isNearBoundary(currentTankX + i*81 - xn*30, currentTankY + j*81 - yn*30, this.#DIRECTION.DOWN, currentTankWH)
        }
        
        if(isCollideWall && CollideWallArray[j+2][i+2] == this.#DIRECTION.STOP){
            //console.log("=============CollideWall")
            CollideWallArray[j+2][i+2] = this.MustDIRECTION.WallorMetal
        } 
      }  
    }  

    //当躲子弹考到墙边的时候，会出现坦克所在行列都是WallorMetal的情况，此时需要把CollideWallArray置零
    if(CollideWallArray[0][2] == this.MustDIRECTION.WallorMetal && CollideWallArray[1][2] == this.MustDIRECTION.WallorMetal && CollideWallArray[3][2] == this.MustDIRECTION.WallorMetal && CollideWallArray[4][2] == this.MustDIRECTION.WallorMetal){
        for(var i=-2;i<3;i++){       
            for(var j=-2;j<3;j++){ 
                CollideWallArray[j+2][i+2] = this.#DIRECTION.STOP
            }
        }
    }
    if(CollideWallArray[2][0] == this.MustDIRECTION.WallorMetal && CollideWallArray[2][1] == this.MustDIRECTION.WallorMetal && CollideWallArray[2][3] == this.MustDIRECTION.WallorMetal && CollideWallArray[2][4] == this.MustDIRECTION.WallorMetal){
        for(var i=-2;i<3;i++){       
            for(var j=-2;j<3;j++){ 
                CollideWallArray[j+2][i+2] = this.#DIRECTION.STOP
            }
        }        
    }
  }
        
        
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
    var thresholdvalue = 45
    outer:
    for (const bullet of arraybullet) { 
      for(var i=-2;i<3;i++){
        inter:         
        for(var j=-2;j<3;j++){ 
          var xn = 0
          var xnc = 0  
          var yn = 0
          var ync = 0
          var ync = 0
          if(i > 0){//由于每个宫格的长宽不一样，所以加了这些调整项
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
          dis = this.#collision(//这颗子弹和这个宫格发生了碰撞
            currentTankX + i*81 - xn*30,
            currentTankY + j*81 - yn*30,
            bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
            (80+2-xnc*30), (80+2-ync*30), bulletWH * 1.2, bulletWH * 1.2
          );

          if (true == dis) {
            //console.log("=============1calcBulletArray i:"+i+" j:"+j)
            //四个主要方向上的致命判断
            var dis2 = false
            if(bullet.direction == this.#DIRECTION.DOWN){//currentTankX和currentTankY是坦克的左上点，bullet.X和bullet.Y是子弹中心点，所以计算有些差异
                //for debug
                /*if(j==-1 && i==0){
                    console.log("=============xxxxbullet.X:"+bullet.X)
                    console.log("=============bullet.Y:"+bullet.Y)
                    console.log("=============currentTankX:"+currentTankX)
                    console.log("=============currentTankY:"+currentTankY)
                    console.log(currentTankY-(bullet.Y+5))
                    console.log((bullet.X-5)-currentTankX)
                }
                console.log("=============xxxx0")*/
                
                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 0,
                  currentTankY - thresholdvalue,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  24, thresholdvalue, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx3")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }

                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 25,
                  currentTankY - thresholdvalue,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  25, thresholdvalue, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx4")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }                
                
                /*一开始写的方法，太绕
                if(currentTankY-(bullet.Y+5) > 0 && currentTankY-(bullet.Y+5) < thresholdvalue){//子弹在坦克上方，且Y方向小于安全距离
                    console.log("=============xxxx2")
                    if((bullet.X-5)-currentTankX >= 0 && (bullet.X+5)-currentTankX <= 25){//子弹在坦克左半边
                        console.log("=============xxxx3")
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                        break outer//既然有必须要躲的了，就不用再计算了
                    }
                    if((bullet.X-5)-(currentTankX+25) >= 0 && (bullet.X+5)-(currentTankX+25) <= 25){//子弹在坦克右半边
                        console.log("=============xxxx4")
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                        break outer
                    }
                }
                */
            }
            
            if(bullet.direction == this.#DIRECTION.UP){
                
                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 0,
                  currentTankY + 50 + thresholdvalue,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  24, thresholdvalue, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx5")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }

                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 25,
                  currentTankY + 50 + thresholdvalue,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  25, thresholdvalue, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx6")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }  
                
                /*一开始写的方法，太绕
                if((currentTankY+50)-(bullet.Y-5) < 0 && (bullet.Y-5)-(currentTankY+50) < thresholdvalue){//子弹在坦克下方，且Y方向小于安全距离
                    if((bullet.X-5)-currentTankX >= 0 && (bullet.X+5)-currentTankX <= 25){//子弹在坦克左半边
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustRIGHT
                        break outer
                    }
                    if((bullet.X-5)-(currentTankX+25) >= 0 && (bullet.X+5)-(currentTankX+25) <= 25){//子弹在坦克右半边
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustLEFT
                        break outer
                    }
                }
                */
            }
            
            if(bullet.direction == this.#DIRECTION.LEFT){
                //for debug
                /*if(j==0 && i==1){
                    console.log("=============xxxxbullet.X:"+bullet.X)
                    console.log("=============bullet.Y:"+bullet.Y)
                    console.log("=============currentTankX:"+currentTankX)
                    console.log("=============currentTankY:"+currentTankY)
                    console.log((currentTankX+50)-(bullet.X-5))
                    console.log((bullet.Y-5)-currentTankY)
                }
                console.log("=============xxxx5")*/
                
                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 50 + thresholdvalue,
                  currentTankY + 0,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  thresholdvalue, 24, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx7")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }

                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX + 50 + thresholdvalue,
                  currentTankY + 25,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  thresholdvalue, 25, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx8")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                    break outer//既然有必须要躲的了，就不用再计算了                    
                } 
                
                /*一开始写的方法，太绕
                if((currentTankX+50)-(bullet.X-5) < 0 && (bullet.X-5)-(currentTankX+50) < thresholdvalue){//子弹在坦克右方，且X方向小于安全距离
                    console.log("=============xxxx6")
                    if((bullet.Y-5)-currentTankY >= 0 && (bullet.Y+5)-currentTankY <= 25){//子弹在坦克上半边
                        console.log("=============xxxx7")
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                        break outer
                    }
                    if((bullet.Y-5)-(currentTankY+25) >= 0 && (bullet.Y+5)-(currentTankY+25) <= 25){//子弹在坦克下半边
                        console.log("=============xxxx8")
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                        break outer
                    }
                }*/
            }
            
            if(bullet.direction == this.#DIRECTION.RIGHT){
                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX - thresholdvalue,
                  currentTankY + 0,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  thresholdvalue, 24, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx7")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                    break outer//既然有必须要躲的了，就不用再计算了                    
                }

                dis2 = this.#collision(//这颗子弹和这个宫格发生了碰撞
                  currentTankX - thresholdvalue,
                  currentTankY + 25,
                  bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                  thresholdvalue, 25, bulletWH * 1.2, bulletWH * 1.2
                );                
                
                if(dis2){
                    console.log("=============xxxx8")
                    Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                    break outer//既然有必须要躲的了，就不用再计算了                    
                } 
                
                /*if(currentTankX-(bullet.X+5) > 0 && currentTankX-(bullet.X+5) < thresholdvalue){//子弹在坦克右方，且X方向小于安全距离
                    if((bullet.Y-5)-currentTankY >= 0 && (bullet.Y+5)-currentTankY <= 25){//子弹在坦克上半边
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustDOWN
                        break outer
                    }
                    if((bullet.Y-5)-(currentTankY+25) >= 0 && (bullet.Y+5)-(currentTankY+25) <= 25){//子弹在坦克下半边
                        Bullet[j+2][i+2] = this.MustDIRECTION.mustUP
                        break outer
                    }
                }*/
            }

            //console.log("=============2calcBulletArray i:"+i+" j:"+j)
            //防止子弹压线（主要处理四个角--由于压线导致四个角上有子弹的方向，则去掉），其实这块应该像生成宫格时那样用碰撞检测来做         
            if(j==-1 && i==-1 && currentTankX-(bullet.X+5) > 0 && currentTankX-(bullet.X-5) < 50 && currentTankY-bullet.Y > -5 && currentTankY-bullet.Y < 5 && bullet.direction == this.#DIRECTION.RIGHT){//对压线的处理，子弹在11和21的交界线上，且方向向右
                continue inter//如果压线就不计算这颗子弹对这个角的影响了,计算下一个宫格去了 
                //Bullet[1][1] = this.#DIRECTION.STOP
            }else if(j==-1 && i==1 && (bullet.X+5)-(currentTankX+50) > 0 && (bullet.X+5)-(currentTankX+50) < 50 && currentTankY-bullet.Y > -5 && currentTankY-bullet.Y < 5 && bullet.direction == this.#DIRECTION.LEFT){//对压线的处理，子弹在13和23的交界线上，且方向向左
                continue inter
                //Bullet[1][3] = this.#DIRECTION.STOP
            
            }else if(j==1 && i==-1 && currentTankX-(bullet.X+5) > 0 && currentTankX-(bullet.X-5) < 50 && (currentTankY+50)-bullet.Y > -5 && (currentTankY+50)-bullet.Y < 5 && bullet.direction == this.#DIRECTION.RIGHT){//对压线的处理，子弹在31和21的交界线上，且方向向右
                continue inter
                //Bullet[3][1] = this.#DIRECTION.STOP
            }else if(j==1 && i==1 && (bullet.X+5)-(currentTankX+50) > 0 && (bullet.X+5)-(currentTankX+50) < 50 && (currentTankY+50)-bullet.Y > -5 && (currentTankY+50)-bullet.Y < 5 && bullet.direction == this.#DIRECTION.LEFT){//对压线的处理，子弹在33和23的交界线上，且方向向左
                continue inter
                //Bullet[3][3] = this.#DIRECTION.STOP
 
            }else if(j==-1 && i==-1 && currentTankX-bullet.X > -5 && currentTankX-bullet.X < 5 && currentTankY-bullet.Y > 0 && currentTankY-bullet.Y < 50 && bullet.direction == this.#DIRECTION.DOWN){//对压线的处理，子弹在11和12的交界线上，且方向向右
                continue inter
                //Bullet[1][1] = this.#DIRECTION.STOP
            }else if(j==1 && i==-1 && currentTankX-bullet.X > -5 && currentTankX-bullet.X < 5 && bullet.Y-(currentTankY+50) > 0 && bullet.Y-(currentTankY+50) < 50 && bullet.direction == this.#DIRECTION.UP){//对压线的处理，子弹在31和32的交界线上，且方向向左
                continue inter
                //Bullet[3][1] = this.#DIRECTION.STOP
            
            }else if(j==-1 && i==1 && (currentTankX+50)-bullet.X > -5 && (currentTankX+50)-bullet.X < 5 && currentTankY-bullet.Y > 0 && currentTankY-bullet.Y < 50 && bullet.direction == this.#DIRECTION.DOWN){//对压线的处理，子弹在12和13的交界线上，且方向向右
                continue inter
                //Bullet[1][3] = this.#DIRECTION.STOP
            }else if(j==1 && i==1 && (currentTankX+50)-bullet.X > -5 && (currentTankX+50)-bullet.X < 5 && bullet.Y-(currentTankY+50) > 0 && bullet.Y-(currentTankY+50) < 50 && bullet.direction == this.#DIRECTION.UP){//对压线的处理，子弹在33和32的交界线上，且方向向左
                continue inter
                //Bullet[3][3] = this.#DIRECTION.STOP   
            }
            
            //console.log("=============3calcBulletArray i:"+i+" j:"+j)            
            //重叠的情况下，保留四个主方向上重要的子弹方向
            var dis1 
            if(Bullet[j+2][i+2] < 4){
                if(j==-1 && i==0 && bullet.direction == this.#DIRECTION.DOWN){
                    dis1 = this.#collision(//这颗子弹和[1][2]这个宫格发生了碰撞
                        currentTankX + 0*81 - 0*30,
                        currentTankY - 1*81 - 0*30,
                        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                        (80+2-1*30), (80+2-0*30), bulletWH * 1.2, bulletWH * 1.2
                      );
                    if (true == dis1) {
                        Bullet[j+2][i+2] = bullet.direction
                        continue inter                        
                    }
                }
                if(j==1 && i==0 && bullet.direction == this.#DIRECTION.UP){
                      dis = this.#collision(
                        currentTankX + 1*81 - 0*30,
                        currentTankY + 0*81 - 1*30,
                        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                        (80+2-1*30), (80+2-0*30), bulletWH * 1.2, bulletWH * 1.2
                      );
                    if (true == dis1) {
                        Bullet[j+2][i+2] = bullet.direction
                        continue inter                        
                    }
                }
                if(j==0 && i==-1 && bullet.direction == this.#DIRECTION.RIGHT){
                      dis = this.#collision(
                        currentTankX - 1*81 - xn*30,
                        currentTankY + 0*81 - yn*30,
                        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                        (80+2-0*30), (80+2-1*30), bulletWH * 1.2, bulletWH * 1.2
                      );
                    if (true == dis1) {
                        Bullet[j+2][i+2] = bullet.direction
                        continue inter                        
                    }
                }
                if(j==0 && i==1 && bullet.direction == this.#DIRECTION.LEFT){
                      dis = this.#collision(
                        currentTankX + 1*81 - 1*30,
                        currentTankY + 0*81 - 0*30,
                        bullet.X - bulletWH/2 - 1 , bullet.Y- bulletWH/2 - 1 ,
                        (80+2-0*30), (80+2-1*30), bulletWH * 1.2, bulletWH * 1.2
                      );
                    if (true == dis1) {
                        Bullet[j+2][i+2] = bullet.direction
                        continue inter                        
                    }
                } 
            }else{
                
            }
            
            
            //console.log("=============4calcBulletArray i:"+i+" j:"+j)
            if(Bullet[j+2][i+2] == this.#DIRECTION.STOP){
                    Bullet[j+2][i+2] = bullet.direction//经过以上各种计算，这个宫格还是空，就把子弹方向赋值过去
            }               
                
            /*switch (bullet.direction) {//在子弹方向上延长一格，以提高预测性
              case this.#DIRECTION.UP:
                if(j+2-1>0){
                  Bullet[j+2-1][i+2] = bullet.direction
                }
                break;
              case this.#DIRECTION.DOWN:
                if(j+2+1<5){
                  Bullet[j+2+1][i+2] = bullet.direction
                }
                break;
              case this.#DIRECTION.LEFT:
                if(i+2-1>0){
                  Bullet[j+2][i+2-1] = bullet.direction
                }
                break;
              case this.#DIRECTION.RIGHT:
                if(i+2+1<5){
                  Bullet[j+2][i+2+1] = bullet.direction
                }
                break;
            }*/
            //console.log("=============Bullet i:"+i+" j:"+j+" direction:"+bullet.direction)
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
                //console.log("=============getmust")
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
    var enr = undefined
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    aMyTankCount.forEach(element => {
        var c = element
        //console.log("=============c id:"+c['id'])
        //console.log("=============this.type:"+this.type)
        if (this.type == 'A') {
            //console.log("=============AAAA")
            if(c['id'] == 100)
            {
                cur = c
            }
            if(c['id'] == 200)
            {
                enr = c
            }
        } else {
            //console.log("=============BBBB")
             if(c['id'] == 200)
            {
                cur = c
            }
            if(c['id'] == 100)
            {
                enr = c
            }           
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
    /*
    //画了一个矩形
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 10;
    ctx.strokeRect(this.extents[0].min, this.extents[1].min,
        this.ranges[0], this.ranges[1]);
    */
    
    /*
    //在敌方坦克上画了个方块
    ctx.fillStyle = 'blue';
    for(var i = 0,aTankLen = aTankCount.length; i < aTankLen; i++){
        var tank = aTankCount[i];
        ctx.fillRect(tank.X, tank.Y, 20, 20);
    }
    */
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
  
  #attackWithBulletArray(enemyTanks, currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, CollideWallArray) {
      var ismust = this.#checkMustDirection(Bullet)
      console.log("ismust=============", ismust)
      if(ismust != "nomust"){
          this.LasttimeDefendAttackState = "defend"
          return ismust;
      }
      
      //优先躲子弹
      moveDirection = this.#avoidBulletWithBulletArrayEasy(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, CollideWallArray)
      if(moveDirection != "safe"){
        return  moveDirection
      }
        
      /*
      //这些是进攻的前提，所以不用再判断一次了
      
      if (this.#DIRECTION.DOWN == Bullet[1][2] || this.#DIRECTION.UP == Bullet[3][2] || this.#DIRECTION.UP == Bullet[2][2] || this.#DIRECTION.DOWN == Bullet[2][2]) { //必须左右移动
        console.log("noattack1=============")
        return "noattack"
      }
      if (this.#DIRECTION.RIGHT == Bullet[2][1] || this.#DIRECTION.LEFT == Bullet[2][3] || this.#DIRECTION.RIGHT == Bullet[2][2] || this.#DIRECTION.LEFT == Bullet[2][2]) { //必须上下移动
        console.log("noattack2=============")
        return "noattack"
      }
      if(Bullet[1][2] > 4 || Bullet[3][2] > 4 || BulletArray[2][1] > 4 || Bullet[2][3] > 4){//是否有威胁
        console.log("noattack3=============")
        return "noattack"
      }
      if(Bullet[2][2] != this.#DIRECTION.STOP){
        console.log("noattack4=============")
        return "noattack"
      }
      */
      
      //寻找最近的坦克
      var nearestEnemy = undefined
      var nearestdis = 9999

      for (var enemy of enemyTanks) {
        var dis = this.#calcTwoPointDistance(
          currentTankX,
          currentTankY,
            enemy.X,
            enemy.Y 
        );
    
        if(enemy != this.enr){//这是判断是不是对手的坦克
            if(enemyTanks.length > 16){
                if(enemy.X > 5 && enemy.Y > 5 && enemy.X < canvas.width-5 && enemy.Y < canvas.height-5){//不能太靠边，太靠边的敌人就不追了（有个问题就是你的敌人都靠边了，你的坦克就开始向对面跑了），已经有MustDIRECTION.WallorMetal了，所以这个可以取消了
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

      //向最近的坦克移动
      if (undefined != nearestEnemy) {
        var disX = Math.abs(nearestEnemy.X - currentTankX)
        var disY = Math.abs(nearestEnemy.Y - currentTankY)
        
        //console.log("disX=============", disX)
        //console.log("disY=============", disY)
        //console.log("nearestEnemy.X=============", nearestEnemy.X)
        //console.log("nearestEnemy.Y=============", nearestEnemy.Y)
        //console.log("currentTankX=============", currentTankX)
        //console.log("currentTankY=============", currentTankY)
        //console.log("Bullet[1][1]=============", Bullet[1][1])
        //console.log("this.#DIRECTION.STOP=============", this.#DIRECTION.STOP)
        
        if((disX<60 && disY<60)){
            this.mustfire = true
        }
        
        if((disX<250 && disY<100)){//80就是安全距离，ai坦克应该躲不开了
            this.isneedfire = true
        }
        
        if((disX<100 && disY<250)){
            this.isneedfire = true
        }
        
        //这两个值大了就会来回抖动，浪费时间；小了容易暴毙
        var safedis1=150
        var safedis2=150
        
        if(enemyTanks.length > 15){
          //if((disX + disY) < 200){
          if((disX<safedis1 && disY<safedis1)){//安全距离
              //优先躲子弹，太保守了，反而容易死
              moveDirection = this.#avoidBulletWithBulletArrayEasy(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
              if(moveDirection != "safe"){
                return  moveDirection
              }
              
              //再躲坦克
              if ((disX < disY) && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3] && this.#DIRECTION.UP != Bullet[4][2]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){//上一步在躲致命攻击，就不要再反方向回去了

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.UP){//防抖动
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)//离敌方坦克很近了，停一步准备开火
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[3][2] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.DOWN)
                        return this.#DIRECTION.DOWN;  
                    }
                }
              } else if ((disX < disY) && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3] && this.#DIRECTION.DOWN != Bullet[0][2]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.DOWN){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[1][2] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.UP)
                        return this.#DIRECTION.UP; 
                    }                                                   
                }                
              } else if ((disX >= disY) && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1] && this.#DIRECTION.RIGHT != Bullet[2][0]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.RIGHT){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[2][1] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.LEFT)
                        return this.#DIRECTION.LEFT;  
                    }                       
                }                      
              } else if ((disX >= disY) && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3] && this.#DIRECTION.LEFT != Bullet[2][4]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.LEFT){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[2][3] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.RIGHT)
                        return this.#DIRECTION.RIGHT;
                    }                       
                }                  
              }
              console.log("躲避============= null")
              return "noattack"
            }    
        }else{
            //if((disX + disY) < 170){
            if((disX<safedis2 && disY<safedis2)){
              //优先躲子弹
              moveDirection = this.#avoidBulletWithBulletArrayEasy(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, CollideWallArray)
              if(moveDirection != "safe"){
                return  moveDirection
              }
              
              //再躲坦克
              if ((disX < disY) && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3] && this.#DIRECTION.UP != Bullet[4][2]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){//上一步在躲致命攻击，就不要再反方向回去了

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.UP){//防抖动
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)//离敌方坦克很近了，停一步准备开火
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[3][2] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.DOWN)
                        return this.#DIRECTION.DOWN;  
                    }
                }
              } else if ((disX < disY) && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3] && this.#DIRECTION.DOWN != Bullet[0][2]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.DOWN){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[1][2] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.UP)
                        return this.#DIRECTION.UP; 
                    }                                                   
                }                
              } else if ((disX >= disY) && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1] && this.#DIRECTION.RIGHT != Bullet[2][0]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.RIGHT){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[2][1] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.LEFT)
                        return this.#DIRECTION.LEFT;  
                    }                       
                }                      
              } else if ((disX >= disY) && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3] && this.#DIRECTION.LEFT != Bullet[2][4]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    if(this.LasttimeDefendAttackState == "attack" && this.priority == this.#DIRECTION.LEFT){
                        this.isneedfire = true
                        console.log("太近了=============躲避", this.#DIRECTION.STOP)
                        return this.#DIRECTION.STOP;                         
                    }
                    if(CollideWallArray[2][3] != this.MustDIRECTION.WallorMetal){//如果下移会撞墙，就不返回，继续执行下面的调整炮口或追击
                        this.LasttimeDefendAttackState == "attackwithdefend"
                        console.log("太近了=============躲避", this.#DIRECTION.RIGHT)
                        return this.#DIRECTION.RIGHT;
                    }                       
                }                  
              }
              console.log("躲避============= null")
              return "noattack"
            }   
            
        }

        //计算开炮
        var firedis = 35
        if(disX < firedis && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3] && this.#DIRECTION.DOWN != Bullet[0][2]) {
            if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

            }else{
                if (moveDirection != this.#DIRECTION.UP) {
                  moveDirection = this.#DIRECTION.UP  
                  console.log("炮口调整", moveDirection)
                  return this.#DIRECTION.UP;
                }else{
                  this.isneedfire = true
                  return moveDirection     
                }            
            }  
        }
        if(disX < firedis && (nearestEnemy.Y >= currentTankY) && this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3] && this.#DIRECTION.UP != Bullet[4][2]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    if (moveDirection != this.#DIRECTION.DOWN) {
                      moveDirection = this.#DIRECTION.DOWN  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.DOWN;
                    }else{
                        this.isneedfire = true
                        return moveDirection      
                    }         
                }              
        }
        
        if(disY < firedis && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1] && this.#DIRECTION.RIGHT != Bullet[2][0]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    if (moveDirection != this.#DIRECTION.LEFT) {
                      moveDirection = this.#DIRECTION.LEFT  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.LEFT;
                    }else{
                        this.isneedfire = true
                        return moveDirection    
                    }            
                }              
        }
        
        if(disY < firedis && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3] && this.#DIRECTION.LEFT != Bullet[2][4]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    if (moveDirection != this.#DIRECTION.RIGHT) {
                      moveDirection = this.#DIRECTION.RIGHT  
                      console.log("炮口调整", moveDirection)
                      return this.#DIRECTION.RIGHT;
                    }else{
                        this.isneedfire = true
                        return moveDirection  
                    }             
                }              

        }        
        
        //计算移动
        //if(enemyTanks.length > 16){
        var chaseUP = false
        var chaseDOWN = false
        var chaseLEFT = false
        var chaseRIGHT = false
        if(this.firstBullet){
            //开局时优先在x方向上移动
            if(currentTankX < canvas.width/2){
                return this.#DIRECTION.LEFT;        
            }else{
                if(currentTankX < canvas.width/2 -200){//这是应为B更危险
                    return this.#DIRECTION.RIGHT;   
                }       
            }
            
            //激进，直接扫射AI出生点，距离左边线200开始向上开炮，最多上移至距上边线200的位置，因为200，200就是出生点了
            /*if(currentTankX < canvas.width/2){
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
            }*/
            
            //保守
            /*if ((nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
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
            }*/
        }else{
            //残局时均衡移动
            //if ((disX >= disY) && (nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {
            if ((nearestEnemy.X >= currentTankX) && this.#DIRECTION.DOWN != Bullet[1][3] && this.#DIRECTION.STOP == Bullet[2][3] && this.#DIRECTION.UP != Bullet[3][3]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.RIGHT){

                }else{
                    if(CollideWallArray[2][3] == this.MustDIRECTION.WallorMetal && enemyTanks.length > 13){
                        
                    }else{
                        chaseRIGHT = true 
                    }                        
                }   
            } 
            //if ((disX >= disY) && (nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {
            if ((nearestEnemy.X < currentTankX) && this.#DIRECTION.DOWN != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[2][1] && this.#DIRECTION.UP != Bullet[3][1]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.LEFT){

                }else{
                    if(CollideWallArray[2][1] == this.MustDIRECTION.WallorMetal && enemyTanks.length > 13){
                        
                    }else{                    
                        chaseLEFT = true
                    }                        
                }    
            }            
        }
              
        //if ((disX < disY) && (nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
        if ((nearestEnemy.Y < currentTankY) && this.#DIRECTION.RIGHT != Bullet[1][1] && this.#DIRECTION.STOP == Bullet[1][2] && this.#DIRECTION.LEFT != Bullet[1][3]) {
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.UP){

                }else{
                    if(CollideWallArray[1][2] == this.MustDIRECTION.WallorMetal && enemyTanks.length > 13){
                        
                    }else{
                        chaseUP = true                      
                    }
                }  
        } 
        
        //if ((disX < disY) && (nearestEnemy.Y >= currentTankY)&& this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {
        if ((nearestEnemy.Y >= currentTankY)&& this.#DIRECTION.RIGHT != Bullet[3][1] && this.#DIRECTION.STOP == Bullet[3][2] && this.#DIRECTION.LEFT != Bullet[3][3]) {    
                if(this.LasttimeDefendAttackState == "defend" && this.priority != this.#DIRECTION.DOWN){

                }else{
                    if(CollideWallArray[3][2] == this.MustDIRECTION.WallorMetal && enemyTanks.length > 13){
                        
                    }else{
                        chaseDOWN = true                          
                    }                 
                }
        } 

        if(chaseRIGHT == true){
            console.log("追击22=============右")
            return this.#DIRECTION.RIGHT
        }

        if(chaseLEFT == true){
            console.log("追击22=============左")
            return this.#DIRECTION.LEFT
        }

        if(chaseUP == true){
            console.log("追击22=============上")
            return this.#DIRECTION.UP
        }
        
        if(chaseDOWN == true){
            console.log("追击22=============下")
            return this.#DIRECTION.DOWN
        } 
        
        console.log("追击============= null")
        return "noattack"
      }
  }

  #avoidBulletWithBulletArrayEasy(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, CollideWallArray) {//周围没必躲子弹时的最优方向
        /*
        //打开这段注释后，变得保守，效果反而不好
        console.log("avoidBulletWithBulletArrayEasy------")
        if(Bullet[1][1] == this.#DIRECTION.DOWN || Bullet[3][1] == this.#DIRECTION.UP){
            if(Bullet[2][3] == this.#DIRECTION.STOP && Bullet[1][3] != this.#DIRECTION.DOWN && Bullet[3][3] != this.#DIRECTION.UP){
                return this.#DIRECTION.RIGHT
            } 
        }
        if(Bullet[1][3] == this.#DIRECTION.DOWN || Bullet[3][3] == this.#DIRECTION.UP){
            if(Bullet[2][1] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.DOWN && Bullet[3][1] != this.#DIRECTION.UP){
                return this.#DIRECTION.LEFT
            }   
        }
        if(Bullet[3][1] == this.#DIRECTION.RIGHT || Bullet[3][3] == this.#DIRECTION.LEFT){
            if(Bullet[1][2] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.RIGHT && Bullet[1][3] != this.#DIRECTION.LEFT){
                return this.#DIRECTION.UP
            }   
        }
        if(Bullet[1][1] == this.#DIRECTION.RIGHT || Bullet[1][3] == this.#DIRECTION.LEFT){
            if(Bullet[3][2] == this.#DIRECTION.STOP && Bullet[3][1] != this.#DIRECTION.RIGHT && Bullet[3][3] != this.#DIRECTION.LEFT){
                return this.#DIRECTION.DOWN
            }  
        }
        */
        
        if(Bullet[0][2] == this.#DIRECTION.DOWN && Bullet[0][3] == this.#DIRECTION.DOWN){
            if(Bullet[2][1] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.DOWN && Bullet[3][1] != this.#DIRECTION.UP && Bullet[2][0] != this.#DIRECTION.RIGHT){
                return this.#DIRECTION.LEFT
            } 
        }
        
        if(Bullet[0][2] == this.#DIRECTION.DOWN && Bullet[0][1] == this.#DIRECTION.DOWN){
            if(Bullet[2][3] == this.#DIRECTION.STOP && Bullet[1][3] != this.#DIRECTION.DOWN && Bullet[3][3] != this.#DIRECTION.UP && Bullet[2][4] != this.#DIRECTION.LEFT){
                return this.#DIRECTION.RIGHT
            } 
        }
        
        if(Bullet[4][1] == this.#DIRECTION.UP && Bullet[4][2] == this.#DIRECTION.UP){
            if(Bullet[2][3] == this.#DIRECTION.STOP && Bullet[1][3] != this.#DIRECTION.DOWN && Bullet[3][3] != this.#DIRECTION.UP && Bullet[2][4] != this.#DIRECTION.LEFT){
                return this.#DIRECTION.RIGHT
            } 
        }
        
        if(Bullet[4][3] == this.#DIRECTION.UP && Bullet[4][2] == this.#DIRECTION.UP){
            if(Bullet[2][1] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.DOWN && Bullet[3][1] != this.#DIRECTION.UP && Bullet[2][0] != this.#DIRECTION.RIGHT){
                return this.#DIRECTION.LEFT
            } 
        }
        
        if(Bullet[3][0] == this.#DIRECTION.RIGHT && Bullet[2][0] == this.#DIRECTION.RIGHT){
            if(Bullet[1][2] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.RIGHT && Bullet[1][3] != this.#DIRECTION.LEFT && Bullet[0][0] != this.#DIRECTION.DOWN){
                return this.#DIRECTION.UP
            } 
        }

        if(Bullet[1][0] == this.#DIRECTION.RIGHT && Bullet[2][0] == this.#DIRECTION.RIGHT){
            if(Bullet[3][2] == this.#DIRECTION.STOP && Bullet[3][1] != this.#DIRECTION.RIGHT && Bullet[3][3] != this.#DIRECTION.LEFT && Bullet[4][2] != this.#DIRECTION.UP){
                return this.#DIRECTION.DOWN
            } 
        }        
        
        if(Bullet[1][4] == this.#DIRECTION.LEFT && Bullet[2][4] == this.#DIRECTION.LEFT){
            if(Bullet[3][2] == this.#DIRECTION.STOP && Bullet[3][1] != this.#DIRECTION.RIGHT && Bullet[3][3] != this.#DIRECTION.LEFT && Bullet[4][2] != this.#DIRECTION.UP){
                return this.#DIRECTION.DOWN
            } 
        }

        if(Bullet[3][4] == this.#DIRECTION.LEFT && Bullet[2][4] == this.#DIRECTION.LEFT){
            if(Bullet[1][2] == this.#DIRECTION.STOP && Bullet[1][1] != this.#DIRECTION.RIGHT && Bullet[1][3] != this.#DIRECTION.LEFT && Bullet[0][2] != this.#DIRECTION.DOWN){
                return this.#DIRECTION.UP
            } 
        }

        return "safe"//都不安全，保持当前方向
  }
  
  #avoidBulletWithBulletArray(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection, CollideWallArray) {
      
      /*
      if(this.LasttimeDefendAttackState == "defend"){//如果上次再躲避致命攻击，就保持方向，但如果是连续的致命攻击，就躲不开了
          return this.priority;
      }
      */
      
      var ismust = this.#checkMustDirection(Bullet)
      if(ismust != "nomust"){
          return ismust;
      }
      
      var moveDirectionleft = undefined
      var moveDirectionright = undefined
      var moveDirectionup = undefined
      var moveDirectiondown = undefined
      //console.log("--Bullet[1][2]--"+Bullet[1][2])
      //console.log("--Bullet[3][2]--"+Bullet[3][2])
      //console.log("--Bullet[2][2]--"+Bullet[2][2])
      //console.log("--Bullet[2][1]--"+Bullet[2][1])
      //console.log("--Bullet[2][3]--"+Bullet[2][3])

      //console.log("isNearBoundary up--",this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH))
      //console.log("isNearBoundary down--",this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH))
      //console.log("isNearBoundary left--",this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH))
      //console.log("isNearBoundary right--",this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH))
        
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
            
            if(this.LasttimeDefendAttackState == "defend" && this.priority == this.#DIRECTION.RIGHT){//之前向右躲避致命攻击，就别再回去了
                return this.priority;
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
            
            if(this.LasttimeDefendAttackState == "defend" && this.priority == this.#DIRECTION.LEFT){//上一步再躲避致命攻击，就别再回去了
                return this.priority;
            }            
            
            if(this.#DIRECTION.DOWN == Bullet[0][3] || this.#DIRECTION.UP == Bullet[4][3] || this.#DIRECTION.DOWN == Bullet[1][4] || this.#DIRECTION.UP == Bullet[3][4]){

            }else{
                //console.log("安全躲避移动右--")
                //return moveDirectionright
            }
        }

        //尽量不抖动
        if(moveDirectionright != undefined && this.priority == this.#DIRECTION.RIGHT){
            console.log("相对安全右1")
            return moveDirectionright;
        }
        if(moveDirectionleft != undefined && this.priority == this.#DIRECTION.LEFT){
            console.log("相对安全左1")
            return moveDirectionleft;
        }
        
        //尽量不撞墙
        if(moveDirectionright != undefined && CollideWallArray[2][1] != this.MustDIRECTION.WallorMetal){
            console.log("相对安全右3")
            return moveDirectionright;
        } 
        if(moveDirectionleft != undefined && CollideWallArray[2][3] != this.MustDIRECTION.WallorMetal){
            console.log("相对安全左3")
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
            if(this.priority == this.#DIRECTION.UP){//防止来回抖动
                console.log("安全躲避移动上1--")
                return moveDirectionup 
            }
            
            if(this.LasttimeDefendAttackState == "defend" && this.priority == this.#DIRECTION.DOWN){//上一步再躲避致命攻击，就别再回去了
                return this.priority;
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
            if(this.priority == this.#DIRECTION.DOWN){//防止来回抖动
                console.log("安全躲避移动下1--")
                return moveDirectiondown 
            }
            
            if(this.LasttimeDefendAttackState == "defend" && this.priority == this.#DIRECTION.UP){//上一步再躲避致命攻击，就别再回去了
                return this.priority;
            }  
            
            if(this.#DIRECTION.RIGHT == Bullet[3][0] || this.#DIRECTION.LEFT == Bullet[3][4] || this.#DIRECTION.RIGHT == Bullet[4][1] || this.#DIRECTION.LEFT == Bullet[4][3]){

            }else{
                //console.log("安全躲避移动下--")
                //return moveDirectiondown
            }
        }
        
        //尽量不抖动
        if(moveDirectiondown != undefined && this.priority == this.#DIRECTION.DOWN){
            console.log("相对安全下1")
            return moveDirectiondown;
        }
        if(moveDirectionup != undefined && this.priority == this.#DIRECTION.UP){
            console.log("相对安全上1")
            return moveDirectionup;
        }
 
        //尽量不撞墙
        if(moveDirectiondown != undefined && CollideWallArray[3][2] != this.MustDIRECTION.WallorMetal){
            console.log("相对安全下3")
            return moveDirectiondown;
        } 
        if(moveDirectionup != undefined && CollideWallArray[1][2] != this.MustDIRECTION.WallorMetal){
            console.log("相对安全上3")
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
})("A");