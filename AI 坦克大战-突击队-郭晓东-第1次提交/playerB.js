
window.playerB = new (class PlayerControl {
  // A 选手   B 选手

  static SV_TANK_WH = 50 //坦克宽高
  static SV_BULLET_WH = 10;//坦克宽高
  static MAX_DISTANCE = 1000000;
  static CHECK_ENLARGE_DISTANCE = 100

  constructor(type) {
    //成员变量的定义
    this.svType = type;
    this.svMoveEv = new CustomEvent("keydown");
    this.svFireEv = new CustomEvent("keydown");
    this.svBulletLimit = 5;
    this.svMyTank;//我的坦克
    this.svOtherPlayerTank;//对手坦克
    this.svEnemyTanks;//所有敌方坦克
    this.svEnemyBullets;// 所有的敌方子弹实例数组
    this.wallArray;
    this.svTankSimulateBulletArray;//模拟子弹.不会推演5步，只会构建危险区
    this.svMyBullets;//所有我方子弹
    this.opponentBullets;//对手的子弹
    this.SV_TANK_SPEED = 7;//坦克速度
    this.SV_BULLET_SPEED = 10;//子弹速度
    this.svFrameTime;//渲染每帧耗时
    this.svTargetTank;
    this.svMatrixWidth = 11;//矩阵宽度,创建矩阵,打印矩阵时候时候使用。寻路算法不要使用，请使用SV_DEPTH
    this.svMatrixGridWidth = 7;//二维数组的格格标示的宽度
    this.svBulletDetectWidth = 50;//子弹五步的范围
    this.svOtherTankDistance = 109;//148和坦克保持最近的距离 50(坦克宽度)+35(探测距离)+7*2(缓存)+10(子弹宽度)
    this.svOtherTankEnoughDistance = 148;//足够安全的举例
    this.svCurrentTankDistance = this.svOtherTankDistance;//选择使用svOtherTankDistance，还是svOtherTankEnoughDistance
    this.svMatrixArray;//矩阵数组
    this.svDangerousBulletsArray;//危险子弹数组
    this.firetimestamp = (new Date()).valueOf()
    this.shouldFire = false;
    this.svDeadAreas; //边界容易引起死锁的区域（UI是绿色）
    this.svDeadAreasOnlyForLog; //边界容易引起死锁的区域（UI是橙色）
    this.svDeadFaceFaceAreas;//相对运行的子弹构成的区域（UI是黄色）。
    this.svAllDirectionBullets;//四个方向的子弹（为了降低计算量，包含了敌方坦克模拟的子弹）
    this.svAllDirectionMyBullets;//我方子弹四个方向。数组长度是4
    this.loopTime = 0;
    this.hasBulletAttck = false;//坦克的状态。是否收到攻击(需要两个轴以上收到攻击)，否则是追击
    this.hasEscapeBullet = false;//坦克的状态。是否收到攻击（(需要两个轴以上收到攻击)）
    this.hasFallInDanger = false;
    this.SV_DEPTH = (this.svMatrixWidth-1)/2;
    this.accurateGap = 10;
    this.attackRect;//坦克预期路径，打日志使用
    this.wallJudgement;
    this.myScore;
    this.otherScore;
    this.otherDie;
    this.tankTotalCount;
    this.gameLevel;
    this.fallBehind = false;//比分领先，即对方已取得绝对领先
    this.ahead = false;//比分领先，比分超过总数1/2
    this.sideAttackForLog = 0;
    this.svMyBulletsRectArray;//我方子弹构成的必死区间。可提早结束目标坦克的锁定。每一个坦克有三个rect。三个子弹也能构成一个大的必死区间
  }

    // 方向的别名
  DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
  };

  // 方向的别名
  HoldReason = {
    NO_Reason: 0,
    BULLET_Reason: 1,
    EDGE_Reason:2,
    TANK_Reason: 3,
    FORBIDDEN_Reason: 9,
    
  };
  DangerousCount={
    DangerousNear:10,//子弹方向垂直方向。当靠近的时候，dangous有值，当足够靠近的时候。将置为9
    DangerousCountDeadAreaImage:10,//自身在危险区，将危险映射到边界。
    DangerousCountDeadAreaLight:10,//比较轻微的影响。比如：当前坦克在危险区，没有在危险区的轴的方向。也有轻微影响
    DangerousCountFace:150,//如果子弹临近，有累加动作。
    DangerousCountDeadArea:100,//普通危险区100；在使用过程中，如果同轴则可乘以2倍
    DangerousCountDeadEdgeArea:150,//边界危险区，必然躲不开。
  }

  land() {
    if (this.shouldFire) {
      this.SVFire();
    }

    this.svFrameTime = new Date().getTime()
    aMyTankCount.forEach(element => {
      var c = element
      if (c['id'] == 100) {
        if (this.svType == 'A') {
          this.svMyTank = c
          this.myScore = player1CollideNum
          this.otherScore = player2CollideNum
          this.otherDie = player2Die
        } else {
          this.svOtherPlayerTank = c
        }
      }
      if (c['id'] == 200) {
        if (this.svType == 'A') {
          this.svOtherPlayerTank = c
        } else {
          this.svMyTank = c
          this.myScore = player2CollideNum
          this.otherScore = player1CollideNum;
          this.otherDie = player1Die
        }
      }
    });
    if (!this.svMyTank) {
      return this.getName();
    };

    if (this.loopTime==0) {
      this.tankTotalCount = aTankCount.length;
    };


    this.svEnemyTanks = [];
    if (this.gameLevel ==3) {
      this.svEnemyTanks = this.svEnemyTanks.concat(aTankCount).concat([this.svOtherPlayerTank]);
    }else{
      this.svEnemyTanks = aTankCount;//所有敌方坦克
    }

    
    this.wallArray = this.SVCreateWallRect(ametal);
    this.gameLevel = this.wallArray.length?3:2;
    this.fallBehind = false;
    this.ahead = false;
    /*
      1. 比分高于总分1/2 
      2. 总分已经落后,无法追评比分。则直接攻击对方坦克
    */
    if ((this.myScore >= this.tankTotalCount/2+1)
      && this.svOtherPlayerTank
      && this.gameLevel == 3
      && !this.otherDie
      ) {
      this.ahead = true;
    }
    if ((this.otherScore >= this.tankTotalCount/2+1 && this.myScore < this.tankTotalCount/2+1)
      && this.svOtherPlayerTank
      && this.gameLevel == 3
      && !this.otherDie
      ) {
      this.fallBehind = true;
    };

    if(this.svEnemyTanks.length == 0){
      return this.getName();
    }

    this.svTankSimulateBulletArray = this.svGetTankSimulateBulletArray();
    this.svEnemyBullets = aBulletCount;// 所有的敌方子弹实例数组
    this.svMyBullets = this.svType == 'A' ? aMyBulletCount1 : aMyBulletCount2;
    this.opponentBullets = this.svType == 'A' ? aMyBulletCount2 : aMyBulletCount1;
    this.svEnemyBullets = [];
    this.svEnemyBullets = this.svEnemyBullets.concat(aBulletCount).concat(this.opponentBullets) ;
    this.sideAttackForLog = 0;   

    this.svMyBulletsRectArray = [];
    this.svDeadAreas = [];
    this.svDeadAreasOnlyForLog = [];
    this.attackRect = [];
    this.svDeadFaceFaceAreas = [];
    this.SV_DEPTH = (this.svMatrixWidth-1)/2;
    this.hasBulletAttck = false;
    this.hasEscapeBullet = false;
    this.hasFallInDanger = false;
    this.accurateGap = tankWidth/5;
    this.wallJudgement = [[-1,0],[0,1],[1,0],[0,-1]];
    /*
      实现躲避逻辑
      1. 构建自己坦克行动矩阵（5步之内）
      2. 更新子弹落点，更新坦克落点
      3. 找到所有路径
      4. 确定坦克的第五步落点：根据到自己坦克的距离排序，找到前几个。顺便是否看一下是否有攻击的方向。
      5. 确定安全落点后：根据安全系数找到最优的路径（一个安全点有多条路径）
      6. 标记死锁的区域
      7. 找不到路径，去掉坦克标记。降低图的级别再找一次
    */ 
    console.log("\n\n\nstart =============================>>>>>>>>>>>>>>>")
    // 得到目标tank，在下一步会用到
    this.svTargetTank = this.SVFindClosestEnemy()
    if (!this.svTargetTank) {
      return this.getName();
    };

    this.SVGreateDirectionMyBulletArray();//归纳我方子弹相同方向的数组
    this.SVBuildMyBulletDeadRect();//找到连续的必死区间
    this.SVCreateMyBulletDeatRectArray();//我方子弹构成的必死区间（单个子弹情况）

    this.SVCurrentDistance();

    this.SVGreateDirectionBulletArray();//获取相同方向的子弹

    //中心点的rect，构建行动矩阵
    var centerRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    this.SVCreateMatrixArray(centerRect);

    //更新子弹落点
    this.SVUpdateMatrixArray();    

    //更新敌方坦克落点
    this.SVUpdateMatrixArrayWithTank();


    //发现死锁，避开
    this.SVFindDeadAreas()

    // this.SVFindFaceFaceBullet();
    
    

    //打印日志，验证正确性
    this.SVLogMatrixHor();//水平打印日志，一行打印五个数组 this.SVLogMatrixVer();//垂直打印日志，一行一个数组，共五行

    if (this.hasBulletAttck ) {
      console.log('');
    };

    
    
    var result = this.SVEscape();
    if (result == 0) {
      //优化点9： 去掉坦克标记，再找一遍路径
      this.SVExclueTankFlag();
      this.SVLogMatrixHor();
      result = this.SVEscape();
      if (result==0) {
        //优化点14：如果第5张图找不到路径。降级为第3张图
        this.SV_DEPTH = Math.ceil(this.SV_DEPTH/2);
        this.SVLogMatrixHor();
        result = this.SVEscape();
        if (result == 0) {
          this.SV_DEPTH = 1;//直接降级到第一张图
          this.SVLogMatrixHor();
          this.SVEscape();
        }  
      };
      
    };
    console.log("loop time" + this.loopTime++)
    console.log("end <<<<<<<<<<<<<<<<<<=============================")
    return this.getName();
    
  }

  SVEscape(){
    var canvas = document.getElementById('canvas');
    // 递归得到所有路径
    let paths = this.SVFindPaths(this.SV_DEPTH)
    
    if(!paths){
      return -1;
    }
    console.log("共" + paths.length + "条路径")

    // 根据paths得到所有安全点及其对应路径
    let array = this.SVGetAllSafePointMapByPath(paths)
    // 所有安全点
    let safePointMap = array[0]
    // 所有安全路径
    let safePathMap = array[1]
    let safePoints = Array.from(safePointMap.values())
    

    //优化点1：只有到达边界的落点才有意义。即距离中心点最远的
    let innerArray = 0;
    if (safePoints.length>1) {
      innerArray = safePoints.slice(0,safePoints.length);
      //距离中心点(即自己坦克的中心)越远越安全
      this.SVSortDistancePoint(innerArray);
    }

    // 找到最安全的落点，初次设置（逃避方向）。后面需要根据攻击方向再设置
    var finalTargetSafePoint = 0;
    if (innerArray) {
      //找到最远的，再筛选最安全的。上下左右4个方向应该是够了
      innerArray = innerArray.slice(0,innerArray.length>8?8:innerArray.length);
      this.SVSortSafePoints(innerArray)
      finalTargetSafePoint = innerArray[0];
    }else{
      // 遍历所有安全点，根据安全系数(子弹的多少)进行排序
      this.SVSortSafePoints(safePoints)
      finalTargetSafePoint = safePoints[0]
    }

    //在前几个安全路径里面，找一个正好是攻击方向的
    let mixArray = innerArray ? innerArray : safePoints;
    let iDirArray = [];
    if (this.ahead) {
      this.accurateGap = PlayerControl.SV_TANK_WH/2+PlayerControl.SV_BULLET_WH/2;
      let farestRect = this.SVAvoidTheOtherTank();
      iDirArray = this.SVAttackTargetTank(farestRect,false,Math.ceil(this.SV_TANK_SPEED/2));
      
    }else{
      iDirArray = this.SVAttackTargetTank(this.svTargetTank,true,this.accurateGap);
    }
    

    for (var i = 0; i < mixArray.length; i++) {
        console.log(i+":"+"("+mixArray[i].X+"行,"+mixArray[i].Y+"列),子弹数量,"+mixArray[i].bulletCount+",其中边界"+mixArray[i].edgeCount+",其中映射到边界的"+mixArray[i].deadAreaCount)
    }
    console.log("attack tank "+this.SVGetDirectionStr(iDirArray[0])+" 次要攻击方向"+this.SVGetDirectionStr(iDirArray[1]))

    //找到合适的方向。
    let attackDirection = -1;
    var directionObject1 = 0;//主要方向对象，短边
    var directionObject2 = 0;//次要方向对象，长边
    //优化点15：如果最后一张图上中心点，或者轴上在危险区，就不寻找坦克了。不然容易引起摆动。
    let indexMatrix = this.SV_DEPTH
    var lastMatrix = this.svMatrixArray[indexMatrix-1];
    var selfInDangerous = this.SVSelfInDangerArea();
    var targetTankDis = PlayerControl.SVGetTankDistance(this.svMyTank, this.svTargetTank);
    if(!selfInDangerous){
       directionObject1 = this.SVFindSafeDirectionWithAttackDir(mixArray,safePathMap,iDirArray[0],true);
       directionObject2 = this.SVFindSafeDirectionWithAttackDir(mixArray,safePathMap,iDirArray[1],false);
      //没有找到短边路径，可以直接去找坦克
      if (!directionObject1.findNearestAttackPath && directionObject2.findNearestAttackPath) {
        console.log("attack tank find 次要方向")//找到了攻击的方向
        finalTargetSafePoint = directionObject2.finalTargetSafePoint;
        attackDirection = iDirArray[1];
      }else if (directionObject1.findNearestAttackPath 
        && directionObject2.findNearestAttackPath 
        && this.loopTime%2==0
        && targetTankDis >= this.svOtherTankEnoughDistance
        && this.SVFindTankOnMoving(directionObject2.attackDirection)//次要攻击方向是否有坦克可攻击
        ) {
        console.log("选取次要方向，实现Z型行动")
        finalTargetSafePoint = directionObject2.finalTargetSafePoint;
        attackDirection = iDirArray[1];
      }else if (directionObject1.findNearestAttackPath) {
        finalTargetSafePoint = directionObject1.finalTargetSafePoint;
        attackDirection = iDirArray[0];
      }else{
        console.log("根据目标rect，无法找到行动方向，默认使用安全系数最高的第一个方向")
      }
    }else{
      console.log("%c"+"我方坦克(或者行动轴)在危险区，不寻找坦克了",'color: #ff0000;font-size: 14px;font-weight: bold;text-decoration: underline;');
    }


    if(!finalTargetSafePoint){
      console.log("找不到路径")
      return 0;
    }
    let logString = "选取了安全点 " +"("+finalTargetSafePoint.X+"行,"+finalTargetSafePoint.Y+"列)"
    console.log("%c"+logString,'color: #43bb88;font-size: 14px;font-weight: bold;text-decoration: underline;');
    // 根据安全点，找到最合适路径
    let safePaths = safePathMap.get(this.SVGetPointKey(finalTargetSafePoint))
    
    console.log("当前安全点共" + safePaths.length + "条安全路径")
    //内部需要判断禁止向子弹方向移动
    let finalDirectionArray = this.SVFindBestPathDirection(safePaths)
    
    let finalDirection = finalDirectionArray[0];
    for (var k = 0; k < finalDirectionArray.length; k++) {
      if(finalDirectionArray[k] == attackDirection){
        finalDirection = finalDirectionArray[k];
        break;
      }
      var inAttackDir = lastMatrix[this.SV_DEPTH][this.SV_DEPTH].direction;
      if (selfInDangerous && inAttackDir != this.DIRECTION.STOP) {
        if(finalDirectionArray[k]%2 != inAttackDir%2){
          finalDirection = finalDirectionArray[k];
          console.log("身在危险区，找到了安全路径")
          break;
        }
      };
    };
    logString = "首选方向 " + this.SVGetDirectionStr(finalDirection)
    console.log("%c"+logString,'color: #FD7b4A;font-size: 14px;font-weight: bold;text-decoration: underline;');

    this.SVMove(finalDirection)
    //如果坦克靠边，向垂直发射子弹情况。就可以宽容一些
    if (this.SVMytankAtEdge((finalDirection+1)%4,this.SV_TANK_SPEED) ||this.SVMytankAtEdge((finalDirection+3)%4,PlayerControl.SV_TANK_WH/2)) {
        this.accurateGap = PlayerControl.SV_TANK_WH/2+PlayerControl.SV_BULLET_WH;
    }

    var target = this.SVFireTarget(finalDirection,this.accurateGap)
    var sideTarget = this.SVSideFire(target.near,this.accurateGap)//只是看一下有没有在射击范围内的坦克。
    if (this.fallBehind) {
      sideTarget = [];//终极模式，不能用鸟枪法
    };
    // sideTarget.length>1配合Z型行动方案
    var dis = PlayerControl.SVGetTankDistance(this.svMyTank, this.svTargetTank);
    let bulletGap = (dis > canvas.width/3 || this.SVAttackingOpponent()) ? tankWidth : PlayerControl.SV_BULLET_WH;
    if ((target.direction != -1 && this.SVShouldFireToDirction(finalDirection,PlayerControl.SV_BULLET_WH)) 
          ||(this.SVShouldFireToDirction(finalDirection,bulletGap) && sideTarget.length > 1)
        ) {
      //如果下一步要行进的方向上有可以击中的目标  就开火
      this.shouldFire = true;
    } else {
      //如果下一步要行进的方向上没有可以开火的目标，但是当前屏幕上还没有这个方向的子弹，依然开火
      if (!this.SVExistBulletInDirection(finalDirection) 
        && finalDirection!=this.DIRECTION.DOWN 
        && !this.SVMytankAtEdge(finalDirection,80)
        && !this.SVSideAttackCollideWall(finalDirection)
        ){
        this.shouldFire = true;
      } else {
        this.shouldFire = false;
      }
      
    }
      //打印日志使用，不要打开
      // this.shouldFire = false;

    return finalTargetSafePoint;
  }

  SVFindSafeDirectionWithAttackDir(mixArray,safePathMap,iDir,isFirstDir){

    var resultObject = {};
    resultObject.findNearestAttackPath = false;
    resultObject.attackDirection = this.DIRECTION.STOP;
    resultObject.finalTargetSafePoint = 0;

    var lastMatrix = this.svMatrixArray[this.SV_DEPTH-1];
    for (var i = 0; i < mixArray.length; i++) {
        let iPaths = safePathMap.get(this.SVGetPointKey(mixArray[i]))
        //如果有子弹攻击危险，不再遍历后面的。只取取第0个
        var maxDeap = this.hasBulletAttck ? 0 : iPaths.length
        for (var j = 0; j < maxDeap; j++) {
          if(iPaths[j].moves[0].direction == iDir && mixArray[i].bulletCount == 0){
            var result = this.SVDirectionSafe(iPaths[j].moves[0].direction,lastMatrix);
            if (result) {
              resultObject.finalTargetSafePoint = mixArray[i];
              resultObject.findNearestAttackPath = true;
              resultObject.attackDirection = iDir;
              if (isFirstDir) {
                console.log("attack tank find 第"+j+"轮")//找到了攻击的方向  
              };
              break;
            };
          }
        };
        if (resultObject.findNearestAttackPath) {
          break;
        };
        
      }
      return resultObject;
  }
  //行动的方向有坦克可精准打击，用于实现z型走位，顺便攻击覆盖范围内的坦克
  SVFindTankOnMoving(direction){
    var canvas = document.getElementById('canvas');
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    var accurateRect = 0;
    let bWidth = PlayerControl.SV_BULLET_WH;
    let tWidth = PlayerControl.SV_TANK_WH
    let tStep = this.SV_TANK_SPEED;
    switch(direction){
      case this.DIRECTION.LEFT:
        accurateRect = this.SVGetStepRect(0,myTankRect.Y+tWidth/2 - bWidth/2,myTankRect.LEFT,bWidth);
      break;
      case this.DIRECTION.UP:
        accurateRect = this.SVGetStepRect(myTankRect.X+tWidth/2 - bWidth/2,0,bWidth,myTankRect.Y);
      break;
      case this.DIRECTION.RIGHT:
        accurateRect = this.SVGetStepRect(myTankRect.RIGHT,myTankRect.Y+tWidth/2 - bWidth/2,canvas.width-myTankRect.RIGHT,bWidth);
      break;
      case this.DIRECTION.DOWN:
        accurateRect = this.SVGetStepRect(myTankRect.X+tWidth/2 - bWidth/2,myTankRect.BOTTOM,bWidth,canvas.height- myTankRect.BOTTOM);
      break;
    }
    for (var i = 0; i < this.svEnemyTanks.length; i++) {
      var tmpTank = this.svEnemyTanks[i];
      //高度是10的一个矩形。不是一个完整坦克的矩形
      var shrinkTankRect = this.SVGetStepRect(tmpTank.X + tWidth/2 -bWidth/2,tmpTank.Y + tWidth/2 -bWidth/2,tStep,tStep);

      let result = PlayerControl.SVCheckCollide(accurateRect,shrinkTankRect);
      if (result && !(tmpTank.X == this.svTargetTank.X && tmpTank.Y == this.svTargetTank.Y && tmpTank.direction == this.svTargetTank.direction )) {
        this.sideAttackForLog = accurateRect;
        return true;
      };
    }
    return false;
  }

  SVCurrentDistance(){
    //如果我方坦克到边界的距离不够一个坦克。就使用大边距
    var canvas = document.getElementById('canvas');
    let myLeft = this.svMyTank.X;
    let myTop = this.svMyTank.Y;
    let myRight = this.svMyTank.X+PlayerControl.SV_TANK_WH;
    let myBottom = this.svMyTank.Y+PlayerControl.SV_TANK_WH;
    let margin = PlayerControl.SV_TANK_WH+PlayerControl.SV_TANK_WH/2;
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);

    let edgeResult = myLeft < margin || myTop<margin || myRight > canvas.width-margin || myBottom>canvas.height-margin;
    let metalResult = false;
    for (var i = 0; i < this.wallArray.length; i++) {
      let rect = this.wallArray[i];
      //计算两个矩形的距离即可
      let twoTanksDistance = PlayerControl.SVGetRectCenterDistance(myTankRect,rect)
      if (twoTanksDistance - rect.WIDTH - PlayerControl.SV_TANK_WH/2 <= margin) {
        metalResult = true;
        break;
      };
    };
    //障碍物模式仍使用短距离 
    this.svCurrentTankDistance = (edgeResult || metalResult || this.ahead)? this.svOtherTankEnoughDistance:this.svOtherTankDistance;
    
    if (this.SVAttackingOpponent()) {
      var steps = this.SVOpponentVoidBullet();
      if (steps>0) {
        this.svCurrentTankDistance -= (steps*this.SV_TANK_SPEED);  
      };
      
    };
    
  }

  SVDirectionSafe(direction,lastMatrix,mixArray){
    switch(direction){
            case this.DIRECTION.UP:
              if(lastMatrix[0][this.SV_DEPTH].value == 0 || lastMatrix[0][this.SV_DEPTH].value == 2){
                return true;
              }
            break;
            case this.DIRECTION.RIGHT:
              if(lastMatrix[this.SV_DEPTH][this.SV_DEPTH*2].value == 0 || lastMatrix[this.SV_DEPTH][this.SV_DEPTH*2].value == 2){
                return true;
              }
            break;
            case this.DIRECTION.DOWN:
              if(lastMatrix[this.SV_DEPTH*2][this.SV_DEPTH].value == 0 || lastMatrix[this.SV_DEPTH*2][this.SV_DEPTH].value == 2){
                return true;
              }
            break;
            case this.DIRECTION.LEFT:
              if(lastMatrix[this.SV_DEPTH][0].value == 0 || lastMatrix[this.SV_DEPTH][0].value == 2){
                return true;
              }
            break;
          }
          return false;
  }

  SVCreateWallRect(metal){
    var wallRectArray = [];
    for (var i = 0; i < metal.length; i++) {
      var rect = this.SVGetStepRect(metal[i][0],metal[i][1],metal[i][2],metal[i][3]);
      wallRectArray.push(rect);
    };
    return wallRectArray;
  }

  /*
    找到矩阵中，轴上子弹方向最多的。
  */
  SVLastMatrixMostDirection(){
    let indexMatrix = this.SV_DEPTH;
    var centerLine = indexMatrix;
    var i = indexMatrix;
    var matrix = this.svMatrixArray[indexMatrix-1];
    var up = 0;
    var right = 0;
    var down = 0;
    var left = 0;

    for (var j = 0; j < this.SV_DEPTH + 1; j++) {
        if(matrix[this.SV_DEPTH][j].bullet && matrix[this.SV_DEPTH][j].bullet.direction == this.DIRECTION.RIGHT){
          right ++;
        }else if(matrix[this.SV_DEPTH][this.SV_DEPTH+j].bullet && matrix[this.SV_DEPTH][this.SV_DEPTH+j].bullet.direction == this.DIRECTION.LEFT){
          left ++;
        }else if(matrix[j][this.SV_DEPTH].bullet && matrix[j][this.SV_DEPTH].bullet.direction == this.DIRECTION.DOWN){
          down ++;
        }else if(matrix[this.SV_DEPTH+j][this.SV_DEPTH].bullet && matrix[this.SV_DEPTH+j][this.SV_DEPTH].bullet.direction == this.DIRECTION.UP){
          up ++;
        }
      }
      var tmpArray = [];
      tmpArray.push(up);
      tmpArray.push(down);
      tmpArray.push(right);
      tmpArray.push(left);
      tmpArray.sort();
      let last = tmpArray[3];
      if (last <= 1) {
        return this.DIRECTION.STOP;
      };
      if (last == up) {
        return this.DIRECTION.DOWN;
      }else if (last == down) {
        return this.DIRECTION.UP;
      }else if (last == right) {
        return this.DIRECTION.LEFT;
      }else if (last == left) {
        return this.DIRECTION.RIGHT;
      }else{
        return this.DIRECTION.STOP;
      }

  }
 setName() {
    document.getElementById(
      `Player${this.svType == 'A' ? 1 : 2}barName`
    ).value = this.getName();
    document.getElementById(
      `Player${this.svType == 'A' ? 1 : 2}Name`
    ).textContent = this.getName();
  } 
  getName(){
    // return this.loopTime;
    return "突击队"
  }

  leave() {
    console.log("渲染耗时:",(new Date().getTime() - this.svFrameTime))
    this.setName();
    document.onkeyup(this.svMoveEv);
    document.onkeyup(this.svFireEv);
  }
  type;
  // private


  SVGetPointKey(point) {
      return point.X + "_" + point.Y
  }

  
  /**
  *
  * 构建5个二维数组，用于探测预期的步数，后续方法根据该数组，获得安全通过路径
  * 参数：centerRect 中心点rect，一般就是我方坦克的rect
  */
   SVCreateMatrixArray(centerRect){
    this.svMatrixArray = [];
    this.svDangerousBulletsArray = [];

    for (var i = 1; i <= this.SV_DEPTH; i++) {
      var centerLine = i;//中心的步数
      var matrix = [];
      var canvas = document.getElementById('canvas');
      //初始化数组的值。四周未使用的值:-1，子弹落点:1，空:0
      for (var j = 0; j < (i*2) + 1; j++) {
          matrix[j] = [];
          for (var k = 0; k < (i*2) + 1; k++) {
            var hor = k - centerLine;//对应X值
            var ver = j - centerLine;
            
            if (Math.abs(ver) + Math.abs(hor) <= (i)) {
              var offsetX = k > centerLine ? (PlayerControl.SV_TANK_WH - this.svMatrixGridWidth):0;
              var offsetY = j > centerLine ? (PlayerControl.SV_TANK_WH - this.svMatrixGridWidth):0;
              var leftX = centerRect.X + hor * this.svMatrixGridWidth + offsetX;
              var topY = centerRect.Y + ver * this.svMatrixGridWidth + offsetY;
              var grideWidth = (k == centerLine)?PlayerControl.SV_TANK_WH:this.svMatrixGridWidth;
              var grideHeight = (j == centerLine)?PlayerControl.SV_TANK_WH:this.svMatrixGridWidth;
              var gridRect = this.SVGetStepRect(leftX,topY,grideWidth,grideHeight);
              matrix[j][k] = gridRect;

              //默认值
              gridRect.value = 0;
              //边界判断
              if (gridRect.LEFT <= -this.SV_TANK_SPEED  && k < centerLine) {
                gridRect.value = 2;
              }
              if (gridRect.TOP <= -this.SV_TANK_SPEED && j < centerLine) {
                gridRect.value = 2;
              }
              if (gridRect.RIGHT >= (canvas.width +this.SV_TANK_SPEED)  && k>centerLine) {
                gridRect.value = 2;
              }
              if (gridRect.BOTTOM >= (canvas.height + this.SV_TANK_SPEED) && j>centerLine) {
                gridRect.value = 2;
              }
              //添加障碍物边界。第三关需求
              for (var z = 0; z < this.wallArray.length; z++) {
                if(PlayerControl.SVCheckCollide(gridRect,this.wallArray[z])){
                  gridRect.value = 2;   

                // let wallRect = this.wallArray[z];

                // if(PlayerControl.SVCheckCollide(gridRect,wallRect)){
                //   //碰撞不一定不能走，下面几种情况就是非常靠近边界，但是仍可以走一步.
                //   //只保证x，y轴上的正确性。
                //   if((gridRect.LEFT < wallRect.LEFT && gridRect.RIGHT > wallRect.LEFT && gridRect.HEIGHT>gridRect.WIDTH)//&& !(gridRect.TOP > wallRect.TOP && gridRect.BOTTOM < wallRect.BOTTOM) 
                //     || (gridRect.TOP < wallRect.TOP && gridRect.BOTTOM > wallRect.TOP && gridRect.HEIGHT<gridRect.WIDTH)//&& !(gridRect.LEFT > wallRect.LEFT && gridRect.RIGHT < wallRect.RIGHT)
                //     || (gridRect.RIGHT > wallRect.RIGHT && gridRect.LEFT < wallRect.RIGHT && gridRect.HEIGHT>gridRect.WIDTH)
                //     || (gridRect.BOTTOM > wallRect.BOTTOM && gridRect.TOP > wallRect.BOTTOM&& gridRect.HEIGHT<gridRect.WIDTH)
                //     ){
                //   }else{
                //     gridRect.value = 2;
                //   }
                }
              };
              
            }
      }
    }
      this.svMatrixArray.push(matrix);
    };
}

  /**
  *
  * 根据当前子弹的位置去
  * 由于子弹会在loop函数最后移动（即，SVUpdateMatrixArray之后移动），所以，坦克要根据当前子弹的位置进行移动
  * 
  */

  SVUpdateMatrixArray(){
    for (var i = 0; i < this.svMatrixArray.length; i++) {
      var matrix = this.svMatrixArray[i];
      this.SVUpdateMatrix(matrix,i+1);
    };

    let lastMatrix = this.svMatrixArray[this.svMatrixArray.length-1];
    let iWidth = this.SV_DEPTH;

    //确定是否收到攻击
    this.SVSetInBulletAttack(lastMatrix,this.SV_DEPTH);

    //优化点5：最后一张图上。如果中心点四周有被子弹侵占，那么子弹相同方向就不能走了  
    var tmpMapWithBullet = new Map();
    var tmpMapWithPoint = new Map();
    for (var j = 0; j < lastMatrix.length; j++) {
      for (var k = 0; k < lastMatrix.length; k++) {

        var distance = Math.abs(j-iWidth)+Math.abs(k-iWidth) <= iWidth;
        if (distance && (lastMatrix[j][k].value == this.HoldReason.BULLET_Reason||lastMatrix[j][k].sideValue == this.HoldReason.BULLET_Reason)) {

          this.svDangerousBulletsArray.push(lastMatrix[j][k].bullet);
          var tmpBulletArray = lastMatrix[j][k].bulletArray;
          for (var z = 0; z < tmpBulletArray.length; z++) {
            var tmpBullet = tmpBulletArray[z];
            let targetPoint = this.SVPoint(j, k);
            let tankPoint = this.SVPoint(j, k);
            let key = this.SVGetPointKey(tmpBullet)
            let onAxis = (j == iWidth || k == iWidth);
            //刨去在坐标轴上的点
            if (!onAxis) {
              if (!tmpMapWithPoint.has(key)) {
                let array = []
                array.push(targetPoint)//把坐标放进去
                tmpMapWithPoint.set(key, array)
              }else{
                let array = tmpMapWithPoint.get(key);
                array.push(targetPoint);
              }
              //子弹也存一下
              if (!tmpMapWithBullet.has(key)) {
                tmpMapWithBullet.set(key, tmpBullet)
              }
            };
            /*
                实现将13对应的边界置位9（镜像一下）,顶点的dangerous为DangerousCountFace
                      0 
                    9 0 13
                  9 9 0 13 13
                9 9 9 0 13 13 13
             0y 0 0 0 0 13 13 13 13
                9 9 9 0 13 13 13
                  9 9 0 13 13
                    9 0 13
                      0

              注意下面的情况,中括号的位置。需要置位0y
                       0 
                    9 13 13
                  9 9 13 13 13
                9 9 9 13 13 13 13
            [0] 0 0 0 13 13 13 13 0
                9 9 9 13 13 13 13
                  9 9 13 13 13
                    9 13 13
                      13
              */  
              var kk = Math.abs(k-iWidth)*2;
              var jj = Math.abs(j-iWidth)*2;
              let dangerous = this.DangerousCount.DangerousCountFace;
              let centerAttack = lastMatrix[iWidth][iWidth].value;
              //优化点20 如果centerAttack已经置位。那么相同方向的边界也需要置位。
              if(tmpBullet.direction == this.DIRECTION.LEFT && k > iWidth){
                if (onAxis) {
                  lastMatrix[j][k-kk].dangerous = dangerous;
                }else if(lastMatrix[j][k-kk].value == 0){
                  lastMatrix[j][k-kk].value = 9;  
                }
                if(centerAttack) {
                  lastMatrix[iWidth][0].value = 9;
                };
              }else if (tmpBullet.direction == this.DIRECTION.RIGHT && k < iWidth) {
                if (onAxis) {
                  lastMatrix[j][k+kk].dangerous = dangerous;
                }else if(lastMatrix[j][k+kk].value == 0){
                  lastMatrix[j][k+kk].value = 9;  
                }
                if (centerAttack) {
                  lastMatrix[iWidth][iWidth*2].value = 9;
                }
                
              }else if (tmpBullet.direction == this.DIRECTION.UP && j > iWidth) {
                if (onAxis) {
                  lastMatrix[j-jj][k].dangerous = dangerous;
                }else if(lastMatrix[j-jj][k].value == 0){
                  lastMatrix[j-jj][k].value = 9;  
                }
                if (centerAttack) {
                  lastMatrix[0][iWidth].value = 9;
                }
              }else if (tmpBullet.direction == this.DIRECTION.DOWN && j < iWidth) {
                if (onAxis) {
                  lastMatrix[j+jj][k].dangerous = dangerous;
                }else if(lastMatrix[j+jj][k].value == 0){
                  lastMatrix[j+jj][k].value = 9;
                }
                if (centerAttack) {
                  lastMatrix[iWidth*2][iWidth].value = 9;
                }
              }
          };
          
        }
      };
    };

    //查看在第几象限
    var result = false;
    for(var mapKey of tmpMapWithPoint){
      let firtstBullet = tmpMapWithBullet.get(mapKey[0]);

      result = this.SVFallinWhichPhenomenon(iWidth,mapKey[1],1);
      if (result) {
        if (firtstBullet.direction == this.DIRECTION.DOWN) {
          lastMatrix[iWidth][0].value = 9; 
        }else if (firtstBullet.direction == this.DIRECTION.RIGHT) {
          lastMatrix[0][iWidth].value = 9; 
        };
      }

      result = this.SVFallinWhichPhenomenon(iWidth,mapKey[1],2);
      if (result) {
        if (firtstBullet.direction == this.DIRECTION.DOWN) {
          lastMatrix[iWidth][iWidth*2].value = 9; 
        }else if (firtstBullet.direction == this.DIRECTION.LEFT) {
          lastMatrix[0][iWidth].value = 9;
        };
      }

      result = this.SVFallinWhichPhenomenon(iWidth,mapKey[1],3);
      if (result) {
        if (firtstBullet.direction == this.DIRECTION.UP) {
          lastMatrix[iWidth][0].value = 9; 
        }else if (firtstBullet.direction == this.DIRECTION.RIGHT) {
          lastMatrix[iWidth*2][iWidth].value = 9;
        };
      }
      result = this.SVFallinWhichPhenomenon(iWidth,mapKey[1],4);
      if (result) {
        if (firtstBullet.direction == this.DIRECTION.UP) {
          lastMatrix[iWidth][iWidth*2].value = 9; 
        }else if (firtstBullet.direction == this.DIRECTION.LEFT) {
          lastMatrix[iWidth*2][iWidth].value = 9;
        };
      }

      }
    
    //将子弹影响临近顶点dangous置位
    for(var bulletKey of tmpMapWithBullet){
      var b = bulletKey[1];
      switch(b.direction){
        case this.DIRECTION.UP:
          if (b.Y > this.svMyTank.Y) {

          };
        break;
        case this.DIRECTION.RIGHT:
        break;
        case this.DIRECTION.DOWN:
        break;
        case this.DIRECTION.LEFT:
        break;
      }
    }
    /*
          9 此处虽然是0但是dangerous将>0
        0 0 13
      0 0 0 13 13
        0 0 0
          0
      */

    //当子弹影响返回够大的时候。将临近的顶点置位9
    if (this.svMatrixArray.length>1) {  
      /*
        实现将13对应的边顶头边界置位9
          9
        0 0 13
      0 0 0 13 13
        0 0 0
          0
      */
      this.SVUpdateForbiddenDir(lastMatrix,iWidth,1);
      this.SVUpdateForbiddenDir(lastMatrix,iWidth,2);//谨慎使用粒度是2的参数
    };
  }
  /*
           |
       1   |    3
  --------------------
       2   |    4
           |
  */
  
  SVFallinWhichPhenomenon(aWidth,array,phenomenon){
    if (array.length==0) {
      return false;
    };
    var count = 0
    for (var i = 0; i < array.length; i++) {
      if(array[i].X < aWidth && array[i].Y < aWidth && phenomenon == 1){
        count ++;
      }else if(array[i].X < aWidth && array[i].Y > aWidth && phenomenon == 2){
        count ++;
      }else if(array[i].X > aWidth && array[i].Y < aWidth && phenomenon == 3){
        count ++;
      }else if(array[i].X > aWidth && array[i].Y > aWidth && phenomenon == 4){
        count ++;
      }
    }
    return (count > array.length/2);
  }


  /*
    将四个顶点置位9,以及邻近的点置位9
  */
  SVUpdateForbiddenDir(lastMatrix,aWidth,gunti){
      let curRect = lastMatrix[aWidth-gunti][aWidth]
      if (curRect.value == this.HoldReason.BULLET_Reason && curRect.bullet.direction == this.DIRECTION.DOWN){
        //水平方向，需要将边界置位9
        if (curRect.bullet.X > this.svMyTank.X+PlayerControl.SV_TANK_WH/2) {
          if(lastMatrix[aWidth][aWidth*2].value == 0){
            lastMatrix[aWidth][aWidth*2].value = 9;  
          }
          if(lastMatrix[aWidth-1][aWidth*2-1].value == 0){
            lastMatrix[aWidth-1][aWidth*2-1].value = 9;  
          }
          if(lastMatrix[aWidth+1][aWidth*2-1].value == 0){
            lastMatrix[aWidth+1][aWidth*2-1].value = 9;  
          }
        }else{
          if (lastMatrix[aWidth][0].value == 0){
            lastMatrix[aWidth][0].value = 9;
          }
          if (lastMatrix[aWidth-1][1].value == 0){
            lastMatrix[aWidth-1][1].value = 9;
          }
          if (lastMatrix[aWidth+1][1].value == 0){
            lastMatrix[aWidth+1][1].value = 9;
          }
        } 
      }

      curRect = lastMatrix[aWidth][aWidth-gunti]
      if (curRect.value == this.HoldReason.BULLET_Reason && curRect.bullet.direction == this.DIRECTION.RIGHT) {
        //垂直方向，需要将边界置位9
        if (curRect.bullet.Y > this.svMyTank.Y + PlayerControl.SV_TANK_WH/2) {
          if(lastMatrix[aWidth*2][aWidth].value == 0){
            lastMatrix[aWidth*2][aWidth].value = 9;  
          }
          if(lastMatrix[aWidth*2-1][aWidth-1].value == 0){
            lastMatrix[aWidth*2-1][aWidth-1].value = 9;  
          }
          if(lastMatrix[aWidth*2-1][aWidth+1].value == 0){
            lastMatrix[aWidth*2-1][aWidth+1].value = 9;  
          }
        }else{
          if (lastMatrix[0][aWidth].value == 0){
            lastMatrix[0][aWidth].value = 9;
          }
          if (lastMatrix[1][aWidth+1].value == 0){
            lastMatrix[1][aWidth+1].value = 9;
          }
          if (lastMatrix[1][aWidth-1].value == 0){
            lastMatrix[1][aWidth-1].value = 9;
          }
        } 
      };

      curRect = lastMatrix[aWidth+gunti][aWidth]
      if (curRect.value == this.HoldReason.BULLET_Reason && curRect.bullet.direction == this.DIRECTION.UP) {
        //水平方向，需要将边界置位9
        if (curRect.bullet.X > this.svMyTank.X+PlayerControl.SV_TANK_WH/2) {
          if (lastMatrix[aWidth][aWidth*2].value == 0) {
            lastMatrix[aWidth][aWidth*2].value = 9;  
          };
          if(lastMatrix[aWidth-1][aWidth*2-1].value == 0){
            lastMatrix[aWidth-1][aWidth*2-1].value = 9;  
          }
          if(lastMatrix[aWidth+1][aWidth*2-1].value == 0){
            lastMatrix[aWidth+1][aWidth*2-1].value = 9;  
          }
        }else{
          if(lastMatrix[aWidth][0].value == 0){
            lastMatrix[aWidth][0].value = 9;
          }
          if (lastMatrix[aWidth-1][1].value == 0){
            lastMatrix[aWidth-1][1].value = 9;
          }
          if (lastMatrix[aWidth+1][1].value == 0){
            lastMatrix[aWidth+1][1].value = 9;
          }
        } 
      };

      curRect = lastMatrix[aWidth][aWidth+gunti]
      if (curRect.value == this.HoldReason.BULLET_Reason && curRect.bullet.direction == this.DIRECTION.LEFT) {
        //垂直方向，需要将边界置位9
        if (curRect.bullet.Y > this.svMyTank.Y + PlayerControl.SV_TANK_WH/2) {
          if (lastMatrix[aWidth*2][aWidth].value == 0) {
            lastMatrix[aWidth*2][aWidth].value = 9;  
          };
          if(lastMatrix[aWidth*2-1][aWidth-1].value == 0){
            lastMatrix[aWidth*2-1][aWidth-1].value = 9;  
          }
          if(lastMatrix[aWidth*2-1][aWidth+1].value == 0){
            lastMatrix[aWidth*2-1][aWidth+1].value = 9;  
          }
        }else{
          if(lastMatrix[0][aWidth].value == 0){
            lastMatrix[0][aWidth].value = 9;
          }
          if (lastMatrix[1][aWidth+1].value == 0){
            lastMatrix[1][aWidth+1].value = 9;
          }
          if (lastMatrix[1][aWidth-1].value == 0){
            lastMatrix[1][aWidth-1].value = 9;
          }
        } 
      }
  }

 
  /**
  *
  * 根据我方坦克坐标，遍历所有子弹，更新矩阵 0，1 值。
  * 参数：steps 第几步
  */
  SVUpdateMatrix(matrix,steps){

    if(this.svEnemyBullets.length == 0){
      return;
    }
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    for (var i = 0; i < this.svEnemyBullets.length; i++) {
        var bullet = this.svEnemyBullets[i];
        //由于子弹会在loop函数最后移动（即，SVUpdateMatrixArray之后移动），所以，坦克要根据当前子弹的位置进行移动
        //但是对手的子弹确实先移动，再判断碰撞
        var actualStep = steps-1
        if (bullet.name == '200' || bullet.name == '100') {
            actualStep = steps
        };
        var bulletRect = this.SVImageBulletMove(bullet,actualStep)

        //首先，检测大范围是否包含子弹。减少计算量
        var topEdge = myTankRect.TOP - (steps * this.svMatrixGridWidth) - this.svBulletDetectWidth;
        var leftEdge = myTankRect.LEFT - (steps * this.svMatrixGridWidth) - this.svBulletDetectWidth;
        var width =  (steps*2) *this.svMatrixGridWidth + PlayerControl.SV_TANK_WH + this.svBulletDetectWidth*2;
        var largeScope = this.SVGetStepRect(leftEdge,topEdge,width,width);

        //获取X轴影响区域，Y轴影响区域。取的交集，即子弹影响区域
        if(PlayerControl.SVCheckCollide(bulletRect,largeScope)){
          //求n的区间 bulleftRect.left - 50 < this.myTankRect.LEFT + 7n <bulleftRect.left +10 
          var xStepLeft = (bulletRect.LEFT - myTankRect.RIGHT)/this.svMyTank.speed;
          var xStepLeftInt = Math.ceil(xStepLeft);
          var xStepRight = (bulletRect.RIGHT - myTankRect.LEFT)/this.svMyTank.speed;
          var xStepRightInt = Math.floor(xStepRight);

          //设置一个区间（表示开闭区间）
          var xRange = this.SVGetIntegerRange(xStepLeftInt,xStepLeft == xStepLeftInt,xStepRightInt,xStepRight == xStepRightInt);

          /*
          * 获取X轴影响区域
          * 求n的区间 bulleftRect.Top  < this.myTankRect.Bottom + 7n <bulleftRect.top + 10 + 50 
          */
          var yStepUP = (bulletRect.TOP - myTankRect.BOTTOM)/this.svMyTank.speed;
          var yStepDown = (bulletRect.BOTTOM - myTankRect.TOP)/this.svMyTank.speed;
          var yStepUPInt = Math.ceil(yStepUP);
          var yStepDownInt = Math.floor(yStepDown);

          var yRange = this.SVGetIntegerRange(yStepUPInt,yStepUP == yStepUPInt,yStepDownInt,yStepDown == yStepDownInt);

          //换算到矩阵中坐标
          xRange.LEFT  += steps;
          xRange.RIGHT += steps;
          yRange.LEFT  += steps;
          yRange.RIGHT += steps;

          //小范围内，填充二维数组
          for (var j = 0; j < this.svMatrixWidth; j++) {
              for (var k = 0; k < this.svMatrixWidth; k++) {
                if (this.SVJudgeIntFallIn(xRange,k) && this.SVJudgeIntFallIn(yRange,j)) {
                  var centerLine = steps;//中心的步数
                  var ver = k - centerLine;//对应Y值
                  var hor = j - centerLine;
                  if (Math.abs(ver) + Math.abs(hor) <= (steps)) {
                    if (matrix[j][k].value == 0) {
                      matrix[j][k].value = this.HoldReason.BULLET_Reason;
                    }
                    matrix[j][k].bullet = bullet;
                    matrix[j][k].bulletArray.push(bullet);//优化点12：同一个点有可能有多个子弹
                    matrix[j][k].sideValue = this.HoldReason.BULLET_Reason;//专属属性要赋值
                  };
                }
            }
          }
        }
    }
    
    
  }
  /*
    超过两个轴上有子弹的话。就是有子弹攻击。
    //优化点17：坦克的状态。是否收到攻击，否则是追击
    */
  SVSetInBulletAttack(matrix,steps){
    if (steps == this.SV_DEPTH) {
      var count = 0
      for (var i = 0; i < this.SV_DEPTH; i++) {
        if(matrix[this.SV_DEPTH][i].value == this.HoldReason.BULLET_Reason){
          count++;
          break;
        }
      };
      for (var j = 0; j < this.SV_DEPTH; j++) {
        if(matrix[j][this.SV_DEPTH].value == this.HoldReason.BULLET_Reason){
          count++;
          break;
        }
      }
      for (var k = this.SV_DEPTH; k < this.SV_DEPTH*2; k++) {
        if(matrix[this.SV_DEPTH][k].value == this.HoldReason.BULLET_Reason){
          count++;
          break;
        }
      }
      for (var z = this.SV_DEPTH; z < this.SV_DEPTH*2; z++) {
        if(matrix[z][this.SV_DEPTH].value == this.HoldReason.BULLET_Reason){
          count++;
          break;
        }
      }
      if (count>=2) {
        this.hasBulletAttck = true;  
      };
      if (count>=1) {
        this.hasEscapeBullet = true;
      };
        
    };
  }

  SVGetBulletsCountAroundTank(imaginaryTank, steps) {
      let bulletCount = 0
      if(this.svEnemyBullets.length == 0){
          return 0;
      }
      var imaginaryTankRect = this.SVExtandTank(imaginaryTank);
      for (var i = 0; i < this.svEnemyBullets.length; i++) {
          var bullet = this.svEnemyBullets[i];
          var needSkip = 0;
          //优化点6. 在计算安全点周边子弹的时候，把已经进入5步之内的子弹刨除。
          for (var n = 0; n < this.svDangerousBulletsArray.length; n++) {
            if (bullet.X == this.svDangerousBulletsArray[n].X && bullet.Y == this.svDangerousBulletsArray[n].Y) {
              needSkip = 1;
              break;
            };
          };
          if (needSkip) {
            continue;
          };
          
          var bulletRect = this.SVImageBulletMove(bullet, steps + 1)

          //大范围是否包含子弹。
          // var topEdge = imaginaryTankRect.TOP - (5 * this.svMatrixGridWidth);
          // var leftEdge = imaginaryTankRect.LEFT - (5 * this.svMatrixGridWidth);
          // var width =  (5*2) *this.svMatrixGridWidth + PlayerControl.SV_TANK_WH;
          // var largeScope = this.SVGetStepRect(leftEdge,topEdge,width,width);
          // var bulletRect = this.SVGetBulletRect(tmpBullet);
          if(PlayerControl.SVCheckCollide(bulletRect,imaginaryTankRect)){
            //不再使用周边子弹判断。
              // bulletCount += 1;//PlayerControl.SVGetRectCenterDistance(imaginaryTankRect,bulletRect)
          }
      }
      return bulletCount;
  }

  SVUpdateMatrixArrayWithTank() {

    var lastMatrix = this.svMatrixArray[this.SV_DEPTH-1];
    //如果最后一张图上，子弹是正面攻击。将所有的图上的坦克标记去掉。
    var needClearTankFlag = this.SVBulletFaceAttack();

    if (!needClearTankFlag) {
      this.SVUpdateMatrixWithTank(lastMatrix,this.SV_DEPTH);  
    };
    
    if (needClearTankFlag) {
      this.SVExclueTankFlag();
    };
  }

  /**
  *
  * 根据我方坦克坐标，遍历所有子弹，更新矩阵 0，1 值。
  * 参数：radius 第几步
  * 如果有正面攻击的坦克。不要标记坦克
  */
SVUpdateMatrixWithTank(matrix,steps){
    

    if(this.svEnemyTanks.length == 0){
      return;
    }
    var myTankRect = PlayerControl.SVGetTankRect(this.svMyTank);

    for (var i = 0; i < this.svEnemyTanks.length; i++) {
      var tmpTank = this.svEnemyTanks[i];
      //扩大坦克的范围
      var w = PlayerControl.CHECK_ENLARGE_DISTANCE*2 + PlayerControl.SV_TANK_WH;
      var offsetX = (myTankRect.X - tmpTank.X)/2.0;
      var offsetY = (myTankRect.Y - tmpTank.Y)/2.0;

      //将坦克靠近一点点
      var tmpTankRect = this.SVGetStepRect(tmpTank.X + offsetX,tmpTank.Y+ offsetY,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
      var tmpTankRectOri = PlayerControl.SVGetTankRect(tmpTank);
      var minDistance = PlayerControl.SVGetRectDistance(tmpTankRectOri,myTankRect);
      if (minDistance > this.svCurrentTankDistance) {
        continue;
      };
      //坦克不用预演，因为坦克是随机的，将坦克移动到我方坦克傍边，然后对矩阵置位。
      var xStepLeft = (tmpTankRect.LEFT - PlayerControl.SV_TANK_WH - myTankRect.LEFT)/this.svMyTank.speed;
          var xStepLeftInt = Math.ceil(xStepLeft);//xStepLeft>=0 ?Math.floor(xStepLeft):
          var xStepRight = ((tmpTankRect.LEFT + PlayerControl.SV_TANK_WH) - myTankRect.LEFT)/this.svMyTank.speed;
          var xStepRightInt = Math.floor(xStepRight);
          //设置一个区间（表示开闭区间）
          var xRange = this.SVGetIntegerRange(xStepLeftInt,xStepLeft == xStepLeftInt,xStepRightInt,xStepRight == xStepRightInt);



          //求n的区间 bulleftRect.Top  < this.myTankRect.Bottom + 7n <bulleftRect.top + 10 + 50 
          var yStepUP = (tmpTankRect.TOP - myTankRect.BOTTOM)/this.svMyTank.speed;
          var yStepUPInt =  Math.ceil(yStepUP);
          var yStepDown = (tmpTankRect.TOP + PlayerControl.SV_TANK_WH + PlayerControl.SV_TANK_WH - myTankRect.BOTTOM)/this.svMyTank.speed;
          var yStepDownInt = Math.floor(yStepDown);
          var yRange = this.SVGetIntegerRange(yStepUPInt,yStepUP == yStepUPInt,yStepDownInt,yStepDown == yStepDownInt);
          


          xRange.LEFT += steps;//真是的数组坐标
          xRange.RIGHT += steps;
          yRange.LEFT += steps;
          yRange.RIGHT += steps;
          
          //目的是让坦克只影响一个现象，并防止穿透坦克
          if (tmpTankRectOri.LEFT <= myTankRect.LEFT && xRange.RIGHT>=steps) {
              xRange.RIGHT = steps  
              xRange.rightOpenInterval = false;
          };
          if (tmpTankRectOri.LEFT > myTankRect.LEFT && xRange.LEFT<=steps) {
              xRange.LEFT = steps  
              xRange.leftOpenInterval = false;
          };
          if (tmpTankRectOri.TOP < myTankRect.TOP && yRange.RIGHT>=steps) {
              yRange.RIGHT = steps  
              yRange.rightOpenInterval = false;
          };
          if (tmpTankRectOri.TOP > myTankRect.TOP && yRange.LEFT<=steps) {
              yRange.LEFT = steps;
              yRange.leftOpenInterval = false;
          };


          //小范围内，填充二维数组
          for (var j = 0; j < this.svMatrixWidth; j++) {
              for (var k = 0; k < this.svMatrixWidth; k++) {
                if (this.SVJudgeIntFallIn(xRange,k) && this.SVJudgeIntFallIn(yRange,j)) {
                  var centerLine = steps;//中心的步数
                  var ver = k - centerLine;//对应Y值
                  var hor = j - centerLine;
                  var w = this.SV_DEPTH
                  if (Math.abs(ver) + Math.abs(hor) <= (steps)) {
                    //优化点2：只影响边界。第5张图
                    if (matrix[j][k].value == 0 
                      && ((Math.abs(ver) + Math.abs(hor) == centerLine) /*|| k==0 || k==w ||j==0||j==w*/)
                      && steps ==w
                      )  {
                      matrix[j][k].value = 3;
                    };
                  };
                }
            }
          }  
    };
      
  }

  /*
    找到哪些两个子弹构成一片死锁的情况
    优化点13. 两个子弹容易构成死锁。在目前技术方案需要避开。
  */
  SVFindDeadAreas(){
    for (var i = 0; i < this.svAllDirectionBullets.length; i++) {
      let tmp = this.svAllDirectionBullets[i];
      this.SVFindDeadAreasSameDirectoin(tmp)
    };
    //优化点16： 左上角，右上角属于危险区
    // if(this.svEnemyTanks.length > 5){ 
    //   var screenX = window.innerWidth  
    //   var heightMargin = PlayerControl.SV_TANK_WH*2;
    //   var widthMargin = PlayerControl.SV_TANK_WH*4;
    //   var leftTop = this.SVGetStepRect(0,0,widthMargin,heightMargin)
    //   var rightTop = this.SVGetStepRect(screenX-widthMargin,0,widthMargin,heightMargin)
    //   this.svDeadAreas.push(leftTop);
    //   this.svDeadAreas.push(rightTop);  
    // }

    if(this.gameLevel < 3 || this.ahead || this.SVAttackingOpponent()){ 
      var screenX = window.innerWidth  
      var heightMargin = PlayerControl.SV_TANK_WH;
      var heightBig = screenY
      var widthMargin = PlayerControl.SV_TANK_WH;
      var widthBig = screenX;
      var leftTop = this.SVGetStepRect(0,0,this.ahead?widthBig:widthMargin,heightMargin)
      var rightTop = this.SVGetStepRect(screenX - widthMargin,0,widthMargin,this.ahead?heightBig:heightMargin)
      var leftBottom = this.SVGetStepRect(0,screenY - (this.ahead?heightBig:heightMargin),widthMargin,this.ahead?heightBig:heightMargin)
      var rightBottom = this.SVGetStepRect(screenX - (this.ahead?widthBig:widthMargin),screenY - heightMargin,this.ahead?widthBig:widthMargin,heightMargin)
      leftTop.dangerous = this.DangerousCount.DangerousCountDeadEdgeArea;
      rightTop.dangerous = this.DangerousCount.DangerousCountDeadEdgeArea;
      leftBottom.dangerous = this.DangerousCount.DangerousCountDeadEdgeArea;
      rightBottom.dangerous = this.DangerousCount.DangerousCountDeadEdgeArea;

      this.svDeadAreas.push(leftTop);
      this.svDeadAreas.push(rightTop);  
      this.svDeadAreas.push(leftBottom);
      this.svDeadAreas.push(rightBottom);
    }
    


    this.flagEdgeWithDeadArea(this.svDeadAreas);
  }

  /*
    已知模型：


    处理相同方向的子弹数组
  */
  SVFindDeadAreasSameDirectoin(array){
    var screenX = window.innerWidth  
    screenY = window.innerHeight-100
    let margin = 55//经过计算≥62是可以的
    let bigGap = 134//
    let littleGap = 0;//贴边情况：如果两个相同方向的子弹。垂直间距大于0就容易引起死锁
    let passThroughGap = PlayerControl.SV_TANK_WH+PlayerControl.SV_BULLET_WH+this.SV_TANK_SPEED;//67
    for (var j = 0; j < array.length; j++) {
      let b = array[j];
      //是否靠近边界
      var edge = ((b.X < margin || b.X > screenX-margin)&&(b.direction==this.DIRECTION.UP||b.direction==this.DIRECTION.DOWN))
        || ((b.Y < margin || b.Y > screenY-margin)&&(b.direction==this.DIRECTION.LEFT||b.direction==this.DIRECTION.RIGHT))
      for (var k = j+1; k < array.length; k++) {
        let allB = array[k]
        if (b.speed ==0 && allB.speed == 0) {//都是坦克模拟的子弹
          continue;
        };
        var width = Math.abs(b.X - allB.X);
        var height = Math.abs(b.Y - allB.Y);
        var minHeight = b.direction%2==1? 0:0;//经过计算。大于0就会影响。
        var maxHeight = b.direction%2==1? passThroughGap:bigGap;
        var miniWidth = b.direction%2==1? 0:0;
        var maxWidth = b.direction%2==1? bigGap:passThroughGap;
        var  edgeB = ((allB.X < margin || allB.X > screenX-margin )&&(allB.direction==this.DIRECTION.UP||allB.direction==this.DIRECTION.DOWN))
          || ((allB.Y < margin || allB.Y > screenY-margin)&&(allB.direction==this.DIRECTION.LEFT||allB.direction==this.DIRECTION.RIGHT))

        if (width >= miniWidth && width <= maxWidth && height >= minHeight && height <= maxHeight) {
          let leftX = b.X < allB.X ?b.X :allB.X
          let topY = b.Y < allB.Y ? b.Y :allB.Y
          var rect = 0;
          var rectLog = 0;
          let steps = 70*this.SV_BULLET_SPEED;
          let bulletWidth = this.SV_BULLET_SPEED;



          let littleX = b.X < allB.X ? b : allB;
          let bigX = b.X > allB.X ? b : allB;
          let littleY = b.Y < allB.Y ? b : allB;
          let bigY = b.Y > allB.Y ? b : allB;

          var judgement = (edge|| edgeB)//其中一个挨着边界
          //像前进方向移动20步
          switch(b.direction){
            case this.DIRECTION.UP:
              
              topY += bulletWidth/2;
              if (judgement) {
                 if(leftX > screenX/2){
                  leftX -= bulletWidth/2;
                  rect = this.SVGetStepRect(leftX,topY-steps,margin,steps)
                  rectLog = this.SVGetStepRect(leftX,topY,width+margin,height)
                }else{
                  leftX += bulletWidth/2;
                  rect = this.SVGetStepRect(leftX-margin,topY-steps,width+margin,steps)
                  rectLog = this.SVGetStepRect(leftX-margin,topY,width+margin,height)
                }
              }
            break;
            case this.DIRECTION.RIGHT:
                leftX -= bulletWidth/2;
                
                if (judgement) {
                  if(topY > screenY/2){
                    topY -= bulletWidth/2;
                    rect = this.SVGetStepRect(leftX+width,topY,steps,height +margin)
                    rectLog = this.SVGetStepRect(leftX,topY,width,height +margin)
                  }else{
                    topY += bulletWidth/2;
                    rect = this.SVGetStepRect(leftX+width,topY-margin,steps,height+margin)
                    rectLog = this.SVGetStepRect(leftX,topY-margin,width,height+margin)
                }
              }

            break;
            case this.DIRECTION.DOWN:
                topY -= bulletWidth/2;

                if (judgement) {
                  if(leftX > screenX/2){
                    leftX -= bulletWidth/2;
                    rect = this.SVGetStepRect(leftX,topY+height,width+margin,steps)
                    rectLog = this.SVGetStepRect(leftX,topY,width+margin,height)
                  }else{
                    leftX += bulletWidth/2;
                    rect = this.SVGetStepRect(leftX-margin,topY+height,width+margin,steps)
                    rectLog = this.SVGetStepRect(leftX-margin,topY,width+margin,height)
                  }
              }
                
            break;
            case this.DIRECTION.LEFT:
                leftX += bulletWidth/2;
                if (judgement) {
                  if(topY > screenY/2){
                    topY -= bulletWidth/2;
                    rect = this.SVGetStepRect(leftX-steps,topY,steps,height+margin)
                    rectLog = this.SVGetStepRect(leftX,topY,width,height+margin)
                  }else{
                    topY += bulletWidth/2;
                    rect = this.SVGetStepRect(leftX-steps,topY - margin,steps,height + margin)
                    rectLog = this.SVGetStepRect(leftX,topY - margin,width,height + margin)
                  }
              }
              
            break;
          }
          if (rect) {
            rect.direction = b.direction;
            rect.dangerous = (judgement)?this.DangerousCount.DangerousCountDeadEdgeArea:this.DangerousCount.DangerousCountDeadArea;
            this.svDeadAreas.push(rect);
            this.svDeadAreasOnlyForLog.push(rectLog)
          }
        }

        /*
          主要解决两个同向子弹，x轴或者y轴相近。跟推土机一样过来。
        */
        rect = 0;
        rectLog = 0;
        width = Math.abs(b.X - allB.X);
        height = Math.abs(b.Y - allB.Y);
        minHeight = b.direction%2==1? 18:0;//经过计算。大于0就会影响。
        maxHeight = b.direction%2==1? passThroughGap:bigGap;
        miniWidth = b.direction%2==1? 0:18;
        maxWidth = b.direction%2==1? bigGap:passThroughGap;
        if (width >= miniWidth && width <= maxWidth && height >= minHeight && height <= maxHeight){
          let leftX = (b.X < allB.X ?b.X :allB.X)
          let topY = (b.Y < allB.Y ? b.Y :allB.Y)
          var rect = 0;
          let steps = 20*this.SV_BULLET_SPEED;
          let bulletWidth = this.SV_BULLET_SPEED;
          
          

          let littleX = b.X < allB.X ? b : allB;
          let bigX = b.X > allB.X ? b : allB;
          let littleY = b.Y < allB.Y ? b : allB;
          let bigY = b.Y > allB.Y ? b : allB;
          switch(b.direction){
            case this.DIRECTION.UP:
                leftX -= bulletWidth/2
                topY += bulletWidth/2
                width +=  bulletWidth
                rect = this.SVGetStepRect(leftX,topY-steps,width,steps)
                rectLog = this.SVGetStepRect(leftX,topY,width,height)
            break;

            case this.DIRECTION.RIGHT:
                leftX -= bulletWidth/2
                topY -= bulletWidth/2
                height += bulletWidth;
                rect = this.SVGetStepRect(leftX+width,topY,steps,height)
                rectLog = this.SVGetStepRect(leftX,topY,width,height)
            break;

            case this.DIRECTION.DOWN:
                leftX -= bulletWidth/2
                topY -= bulletWidth/2
                width +=  bulletWidth
                rect = this.SVGetStepRect(leftX,topY+height,width,steps)
                rectLog = this.SVGetStepRect(leftX,topY,width,height)
            break;

            case this.DIRECTION.LEFT:
                leftX += bulletWidth/2
                topY -= bulletWidth/2
                height += bulletWidth;
                rect = this.SVGetStepRect(leftX-steps,topY,steps,height)  
                rectLog = this.SVGetStepRect(leftX,topY,width,height)  
              
            break;
          }
          if (rect) {
            rect.direction = b.direction;
            rect.dangerous = this.DangerousCount.DangerousCountDeadArea;
            this.svDeadAreas.push(rect);
            this.svDeadAreasOnlyForLog.push(rectLog)
          }
        };
      }
      //优化点18:单个子弹和边距小于一个坦克的也算是危险区
      if (b.speed > 0) {
        rect = 0
        var edgeStep = 20*this.SV_BULLET_SPEED;//不可设置过长，影响路径判断
        var halfBulletWidth = PlayerControl.SV_BULLET_WH/2
        var maxEdgeGap = PlayerControl.SV_TANK_WH + halfBulletWidth;
        var minEdgeGap = 33//实际上40~55才会影响危险区。这里多画一点
        if ((b.Y < maxEdgeGap && b.Y > minEdgeGap) || (b.Y > screenY - maxEdgeGap)&&(b.Y < screenY - minEdgeGap)) {
          var topY = b.Y < maxEdgeGap?0:(b.Y - halfBulletWidth);
          var height = b.Y < screenY/2?b.Y:screenY-b.Y;
          height += halfBulletWidth;
          if(b.direction == this.DIRECTION.RIGHT ){
            rect = this.SVGetStepRect(b.X - halfBulletWidth,topY,edgeStep,height)
          }else if (b.direction == this.DIRECTION.LEFT) {
            rect = this.SVGetStepRect(b.X-edgeStep + halfBulletWidth,topY,edgeStep,height)
          };
        }else if ((b.X < maxEdgeGap && b.X > minEdgeGap) || (b.X > screenX - maxEdgeGap && b.X < screenX - minEdgeGap)) {
          var leftX = b.X < maxEdgeGap?0:(b.X - halfBulletWidth);
          var w = b.X < screenX/2?b.X:screenX-b.X ;
          w += halfBulletWidth;
          if(b.direction == this.DIRECTION.UP ){
            rect = this.SVGetStepRect(leftX,b.Y - edgeStep + halfBulletWidth,w,edgeStep)
          }else if (b.direction == this.DIRECTION.DOWN) {
            rect = this.SVGetStepRect(leftX,b.Y - halfBulletWidth,w,edgeStep)
          };
        }
        if (rect) {
          rect.direction = b.direction;
          this.DangerousCount.DangerousCountDeadEdgeArea;
          this.svDeadAreas.push(rect);
          this.svDeadAreasOnlyForLog.push(rect)
        }
        //添加障碍物的判断(需要提前判断危险矩形)
        for (var i = 0; i < this.wallArray.length; i++) {
          var wall = this.wallArray[i];
          var bLeft = b.X - halfBulletWidth;
          var bRight = b.X + halfBulletWidth;
          var bTop = b.Y - halfBulletWidth;
          var bBottom = b.Y + halfBulletWidth;
          var extandWidth = 200;
          var otherExtandWidth = PlayerControl.SV_TANK_WH;
          minEdgeGap = 0;//障碍物的时候设置为0
          maxEdgeGap = PlayerControl.SV_TANK_WH + halfBulletWidth + this.SV_TANK_SPEED;
          rect = 0
          //先判断方向
          if(b.direction % 2 == 1 && ((b.Y < wall.BOTTOM + maxEdgeGap && b.Y > wall.BOTTOM + minEdgeGap) || (b.Y > wall.TOP - maxEdgeGap && b.Y < wall.TOP - minEdgeGap))){
            if(b.direction == this.DIRECTION.RIGHT && bLeft >= (wall.LEFT-extandWidth) && bLeft < wall.RIGHT){
              var topY = b.Y < wall.TOP ?(b.Y - halfBulletWidth):wall.BOTTOM;
              var height = b.Y < wall.TOP ? (wall.TOP-b.Y) : (b.Y-wall.BOTTOM);
              height += halfBulletWidth;
              rect = this.SVGetStepRect(bLeft,topY,wall.RIGHT - bLeft + otherExtandWidth,height);            
            }else if (b.direction == this.DIRECTION.LEFT && bRight <= (wall.RIGHT + extandWidth) && bRight >= wall.LEFT) {
              var topY = b.Y < wall.TOP ?(b.Y - halfBulletWidth):wall.BOTTOM;
              var height = b.Y < wall.TOP ? (wall.TOP-b.Y) : (b.Y-wall.BOTTOM);
              height += halfBulletWidth;
              rect = this.SVGetStepRect(wall.LEFT-otherExtandWidth,topY,bRight - wall.LEFT + otherExtandWidth,height);
            };
          }else if ((b.X < wall.RIGHT + maxEdgeGap && b.X > wall.RIGHT + minEdgeGap) || (b.X > wall.LEFT - maxEdgeGap && b.X < wall.LEFT - minEdgeGap)) {
            if(b.direction == this.DIRECTION.UP && bTop <= (wall.BOTTOM+extandWidth) && bTop > wall.TOP){
              var leftX = b.X < wall.LEFT ?(b.X - halfBulletWidth):wall.RIGHT;
              var width = b.X < wall.LEFT ? (wall.LEFT-b.X) : (b.X-wall.RIGHT);
              width += halfBulletWidth;
              rect = this.SVGetStepRect(leftX,wall.TOP - otherExtandWidth,width,bBottom - wall.TOP + otherExtandWidth);
            }else if (b.direction == this.DIRECTION.DOWN && bBottom >= (wall.TOP-extandWidth)&&bBottom<wall.BOTTOM) {
              var leftX = b.X < wall.LEFT ?(b.X - halfBulletWidth):wall.RIGHT;
              var width = b.X < wall.LEFT ? (wall.LEFT-b.X) : (b.X-wall.RIGHT);
              width += halfBulletWidth;
              rect = this.SVGetStepRect(leftX,bTop,width,wall.BOTTOM - bTop + otherExtandWidth);
            }
         }

        if (rect) {
          rect.direction = b.direction;
          rect.dangerous = this.DangerousCount.DangerousCountDeadArea;
          this.svDeadAreas.push(rect);
          this.svDeadAreasOnlyForLog.push(rect)
        }
    }
  }
  }
  }
  SVFindFaceFaceBullet(){
    this._SVFindFaceFaceBullet(this.svAllDirectionBullets[0],this.svAllDirectionBullets[2])
    this._SVFindFaceFaceBullet(this.svAllDirectionBullets[1],this.svAllDirectionBullets[3])
    this.flagEdgeWithDeadArea(this.svDeadFaceFaceAreas);
    
  }
  /*
    查看相对行驶的子弹。夹击坦克的场景
  */
  _SVFindFaceFaceBullet(array1,array2){
    if (array1.length && array2.length) {
      for (var i = 0; i < array1.length; i++) {
        let baseBullet = array1[i];
        for (var j = 0; j < array2.length; j++) {
          let targetBullet = array2[j];
          let width = Math.abs(baseBullet.X - targetBullet.X);
          let height = Math.abs(baseBullet.Y - targetBullet.Y);
          let leftX = baseBullet.X < targetBullet.X ?baseBullet.X :targetBullet.X
          let topY = baseBullet.Y < targetBullet.Y ? baseBullet.Y :targetBullet.Y
          let bulletWidth = this.SV_BULLET_SPEED;


          if (width > height && baseBullet.direction%2==1 && 
            ((baseBullet.X<targetBullet.X && baseBullet.direction == 1))
            ) {
            if (width < 200 && height < PlayerControl.SV_TANK_WH + this.SV_TANK_SPEED) {
              leftX -= bulletWidth/2
              topY -= bulletWidth/2
              width +=  bulletWidth
              height += bulletWidth
              let rect = this.SVGetStepRect(leftX,topY,width,height)
              this.svDeadFaceFaceAreas.push(rect);  
            };
          }else if(baseBullet.direction%2 == 0 && (baseBullet.Y < targetBullet.Y && baseBullet.direction == 2)){
            if (height < 200 && width < PlayerControl.SV_TANK_WH + this.SV_TANK_SPEED) {
              leftX -= bulletWidth/2
              topY -= bulletWidth/2
              width +=  bulletWidth
              height += bulletWidth
              let rect = this.SVGetStepRect(leftX,topY,width,height)
              this.svDeadFaceFaceAreas.push(rect);  
            };
          }
        };
      };
    };
  }

  flagEdgeWithDeadArea(array){
    let indexMatrix = this.SV_DEPTH
    var matrix = this.svMatrixArray[indexMatrix-1];
    for (var j = 0; j < 2*indexMatrix+1; j++) {
      for (var k = 0; k < 2*indexMatrix+1; k++) {

        let dis = Math.abs(j - indexMatrix) + Math.abs(k - indexMatrix);
        //周边
        if (dis == indexMatrix || (j == indexMatrix && k == indexMatrix)) {
          for (var z = 0; z < array.length; z++) {

            let deadRect = array[z]
            let centerCollide = PlayerControl.SVCheckCollide(matrix[indexMatrix][indexMatrix], deadRect);
            let collide = PlayerControl.SVCheckCollide(matrix[j][k], deadRect)
            if (!collide) {
              //优化点8：把其他未在危险区，但是方向和危险区一致的轴，轴上的置位为轻微影响。防止跟着危险区走
              if (centerCollide) {
                switch(deadRect.direction){
                case this.DIRECTION.UP:
                  matrix[0][indexMatrix].dangerous += this.DangerousCount.DangerousCountDeadAreaLight
                break;
                case this.DIRECTION.DOWN:
                  matrix[indexMatrix*2][indexMatrix].dangerous += this.DangerousCount.DangerousCountDeadAreaLight
                break;
                case this.DIRECTION.RIGHT:
                  matrix[indexMatrix][indexMatrix*2].dangerous += this.DangerousCount.DangerousCountDeadAreaLight
                break;
                case this.DIRECTION.LEFT:
                  matrix[indexMatrix][0].dangerous += this.DangerousCount.DangerousCountDeadAreaLight
                break;
                }  
              };
              
              continue;
            };
             
            if(matrix[j][k].value != this.HoldReason.BULLET_Reason){
              var sameDirtion = this.SVFallInDeadAreasWithDirection(j,k,deadRect);
              matrix[j][k].dangerous += (sameDirtion ? deadRect.dangerous*2 : deadRect.dangerous);
            }
            //子弹方向和轴的方向垂直才算。
            var fall = false;
            switch(deadRect.direction){
              case this.DIRECTION.UP:
              case this.DIRECTION.DOWN:
                if (k==indexMatrix && j%indexMatrix == 0) {
                  fall = true;
                };
              break;

              case this.DIRECTION.RIGHT:
              case this.DIRECTION.LEFT:
                if (j==indexMatrix && k%indexMatrix == 0) {
                  fall = true;
                };
              break;
            }
            // j%indexMatrix == 0 || k%indexMatrix == 0
            if (fall) {
                matrix[j][k].fallInDanger = true;
                matrix[j][k].direction = deadRect.direction; 
                this.hasFallInDanger = true;
            }
          }
        };
      };
    };
  }
  SVBuildMyBulletDeadRect(){
    for (var i = 0; i < this.svAllDirectionMyBullets.length; i++) {
      this._SVBuildMyBulletDeadRect(this.svAllDirectionMyBullets[i])
    };
  }
  
  _SVBuildMyBulletDeadRect(allDirectionMyBullets){
    let tWidth = PlayerControl.SV_TANK_WH;
    let bWidth = PlayerControl.SV_BULLET_WH;
    var tmpMapWithBullet = new Map();
    var gossArray = [];

    //两两比较一下，找到两两符合条件的
    for (var i = 0; i < allDirectionMyBullets.length; i++) {
      let iBullet = allDirectionMyBullets[i]
      let iBulletRect = this.SVGetStepRect(iBullet.X,iBullet.Y,bWidth)
      //找到
      for (var j = i+1; j < allDirectionMyBullets.length; j++) {
         let jBullet = allDirectionMyBullets[j]
         // let dis = this.SVGetRectDistance(iBullet,jBullet);
         let wDis = Math.abs(iBullet.X - jBullet.X);
         let hDis = Math.abs(iBullet.Y - jBullet.Y);
         let minX = Math.min(iBullet.X,jBullet.X)
         let minY = Math.min(iBullet.Y,jBullet.Y)
         if ((iBullet.direction%2==1 && (wDis < tWidth*2 && hDis < (tWidth+bWidth)) && hDis > bWidth)||
          iBullet.direction%2==0 && (hDis < tWidth*2 && wDis < (tWidth+bWidth)) && wDis > bWidth) {
          //采用模糊计算方法，不那么精确。错过一次也没事儿
          let ikey = this.SVGetPointKey(iBullet);
          let jkey = this.SVGetPointKey(jBullet);
          if (!tmpMapWithBullet.has(ikey)) {
              tmpMapWithBullet.set(ikey, iBullet)
              gossArray.push(iBullet);
            }
          if (!tmpMapWithBullet.has(jkey)) {
              tmpMapWithBullet.set(jkey, jBullet)
              gossArray.push(jBullet);
            }
         }
         
      }
    }
    if (gossArray.length) {
      //找到连续的。
      var firstObject = 0;
      for (var k = 0; k < gossArray.length-1; k++) {
        let index1 = this.SVFallInArray(allDirectionMyBullets,gossArray[k]);
        let index2 = this.SVFallInArray(allDirectionMyBullets,gossArray[k+1]);
        if (firstObject==0) {
          firstObject = gossArray[k];
        } 
          let wDis = Math.abs(gossArray[k].X - gossArray[k+1].X);
          let hDis = Math.abs(gossArray[k].Y - gossArray[k+1].Y);
          
        if ((index2-index1 != 1 || (k+1) == gossArray.length-1 ) || !((firstObject.direction%2==1 && (wDis < tWidth*2 && hDis < (tWidth+bWidth)) && hDis > bWidth)||
          firstObject.direction%2==0 && (hDis < tWidth*2 && wDis < (tWidth+bWidth)) && wDis > bWidth)) {
          //构建一个矩形
          var secondObject = ((k+1) == gossArray.length-1) ? gossArray[k+1] : gossArray[k];
          let wDis = Math.abs(firstObject.X - secondObject.X);
          let hDis = Math.abs(firstObject.Y - secondObject.Y);
          let minX = Math.min(firstObject.X,secondObject.X)
           let minY = Math.min(firstObject.Y,secondObject.Y)
          
          if (gossArray[0].direction%2==1 ) {
            let offset = wDis/this.SV_TANK_SPEED*this.SV_BULLET_SPEED;
            let bigRect = this.SVGetStepRect(minX,minY,wDis+offset,hDis);
            this.svMyBulletsRectArray.push(bigRect);      
          }else if(gossArray[0].direction%2==0){
            let offset = hDis/this.SV_TANK_SPEED*this.SV_BULLET_SPEED;
            let bigRect = this.SVGetStepRect(minX,minY-offset,wDis,hDis+offset);
            this.svMyBulletsRectArray.push(bigRect);
          }
          firstObject = 0;
        };
      };  
    };
    

  }
  SVFallInArray(array,bullet){
    for (var i = 0; i < array.length; i++) {
      if(array[i].X == bullet.X && array[i].Y == bullet.Y){
        return i;

      }
    }
    return -1;
  }

  SVFallInDeadAreasWithDirection(j,k,deadRect){
    let indexMatrix = this.SV_DEPTH
    var matrix = this.svMatrixArray[indexMatrix-1];
    if(matrix[j][k].value != this.HoldReason.BULLET_Reason){
      switch(deadRect.direction){
        case this.DIRECTION.UP:
          if (j > indexMatrix) {
            return true;
          }else if (j <= 1 && Math.abs(k-indexMatrix) <= 1) {//顶尖3个给置位
            return true;
          };
        break;
        case this.DIRECTION.DOWN:
          if (j < indexMatrix) {
            return true;
          }else if (j >= indexMatrix*2-1 && Math.abs(k-indexMatrix) <= 1) {//顶尖3个给置位
            return true;
          };
        break;
        case this.DIRECTION.RIGHT:
          if (k < indexMatrix) {
            return true;
          }else if (k >= indexMatrix*2-1 && Math.abs(j-indexMatrix) <= 1) {//顶尖3个给置位
            return true;
          };
        break;
        case this.DIRECTION.LEFT:
          if (k > indexMatrix) {
            return true;
          }else if (k <= 1 && Math.abs(j-indexMatrix) <= 1) {//顶尖3个给置位
            return true;
          };
        break;
      }
    }
    return false;
  }

  svGetTankSimulateBulletArray() {
    var tankBulletArray = [];//存储坦克模拟子弹们
    //坦克模拟为子弹，啊哈哈
    for(var i = 0; i < aTankCount.length; i++){
      //tankSend.color = "yellow"
      var tankTmp = aTankCount[i];
      var bulletTmp = aBulletCount[0]
      if (!bulletTmp) {
        continue;
      };
      var tankBullet = new Bullet(tankTmp.id, 0, bulletTmp.rank, tankTmp.direction, 0, 0); //var bullet = new Bullet(myTank['id'], speed, rank, direction, X, Y);
      
      var x = tankTmp.X
      var y = tankTmp.Y
      if(tankTmp.direction == 0) { //up

        x = tankTmp.X + (tankWidth / 2)
        y = tankTmp.Y 
      }else if (tankTmp.direction == 2) { //down

        x = tankTmp.X + (tankWidth / 2)
        y = tankTmp.Y + tankWidth
      }else if (tankTmp.direction == 3) { //left
        
        x = tankTmp.X 
        y = tankTmp.Y + (tankWidth / 2)
      }else if (tankTmp.direction == 1) { //right
        
        x = tankTmp.X + tankWidth
        y = tankTmp.Y + (tankWidth / 2)
      }

      tankBullet.X = x
      tankBullet.Y = y
      tankBulletArray.push(tankBullet)
    }
    return tankBulletArray
  }


  //#===============================================================
  //#=======================发现所有路径==============================

  SVImageBulletMove(bullet, steps) {
      var bulletRect = this.SVGetStepRect(bullet.X - PlayerControl.SV_BULLET_WH/2,bullet.Y - PlayerControl.SV_BULLET_WH/2,PlayerControl.SV_BULLET_WH,PlayerControl.SV_BULLET_WH);


      var distance = bullet.speed*steps;
      //通过步数和方向，预演子弹的落点
      switch(bullet.direction){
          case this.DIRECTION.UP:
              bulletRect.Y -= distance;
              bulletRect.BOTTOM -= distance;
              break;

          case this.DIRECTION.RIGHT:
              bulletRect.X += distance;
              bulletRect.RIGHT += distance;
              break;

          case this.DIRECTION.DOWN:
              bulletRect.Y += distance;
              bulletRect.BOTTOM += distance;
              break;

          case this.DIRECTION.LEFT:
              bulletRect.X -= distance;
              bulletRect.RIGHT -= distance;
              break;
      }
      bulletRect.LEFT = bulletRect.X;
      bulletRect.TOP = bulletRect.Y
      return bulletRect
  }
  /*
  * 可表示开闭区间
  */
  SVGetIntegerRange(left,leftOpenInterval,right,rightOpenInterval){
    var range = {};
    range.LEFT = left;
    range.leftOpenInterval = leftOpenInterval;
    range.RIGHT = right;
    range.rightOpenInterval = rightOpenInterval;
    return range;
  }

  SVJudgeIntFallIn(range,i){
    var leftJudge = range.leftOpenInterval ? (i > range.LEFT):(i>=range.LEFT);
    var rightJudge = range.rightOpenInterval? (i < range.RIGHT):(i<=range.RIGHT);
    return leftJudge & rightJudge;
  }

  /**
   * 获取坦克Rect
   * @param {*} object 
   */
  SVGetStepRect(x,y,width,height) {
    var rect = {};
    rect.X = x;
    rect.Y = y;
    rect.TOP = y;
    rect.BOTTOM = y + height;
    rect.LEFT = x;
    rect.RIGHT = x + width;
    rect.WIDTH = width;
    rect.HEIGHT = height;
    rect.value = -1;
    rect.sideValue = -1;//有时候边界会覆盖子弹。此处再设置一个属性
    rect.dangerous = 0;//危险区的危险权重
    rect.fallInDanger = false;//在危险区，或者进攻方向收到障碍物阻挡
    rect.bullet;
    rect.bulletArray=[];
    rect.direction = this.DIRECTION.STOP
    return rect;
  }

  SVMoveStepRectX(rect,x) {
    this.SVMoveStepRect(rect,x,0)
  }
  SVMoveStepRectY(rect,y) {
    this.SVMoveStepRect(rect,0,y)
  }
  SVMoveStepRect(rect,x,y) {
    rect.X += x;
    rect.Y += y;
    rect.TOP = rect.Y;
    rect.LEFT = rect.X;
    rect.BOTTOM = rect.Y + rect.HEIGHT;
    rect.RIGHT = rect.X + rect.WIDTH;
  }

  /**
   * 获取坦克Rect
   * @param {*} object 
   */
  static SVGetTankRect(tank) {
    var rect = {};
    rect.X= tank.X ;
    rect.Y = tank.Y;
    rect.TOP = tank.Y;
    rect.BOTTOM = tank.Y + PlayerControl.SV_TANK_WH;
    rect.LEFT = tank.X;
    rect.RIGHT = tank.X + PlayerControl.SV_TANK_WH;
    rect.WIDTH = PlayerControl.SV_TANK_WH;
    rect.HEIGHT = PlayerControl.SV_TANK_WH;
    return rect;
  }
  /**
   * 获取子弹rect
   * @param {*} bullet 
   */
  SVGetBulletRect(bullet) {
    var rect = {};
    rect.X = bullet.X + PlayerControl.SV_BULLET_WH / 2;
    rect.Y = bullet.Y + PlayerControl.SV_BULLET_WH / 2;
    rect.TOP = bullet.Y;
    rect.BOTTOM = bullet.Y + PlayerControl.SV_BULLET_WH;
    rect.LEFT = bullet.X;
    rect.RIGHT = bullet.X + PlayerControl.SV_BULLET_WH;
    rect.WIDTH = PlayerControl.SV_BULLET_WH;
    rect.HEIGHT = PlayerControl.SV_BULLET_WH;
    return rect;
  }

  /**
   * 获取两个矩形水平与垂直的距离
   * @param {*} rectA 
   * @param {*} rectB 
   */
  static SVGetRectHorAndVerDistance(rectA, rectB) {
    var distance = {};
    if (PlayerControl.SVCheckCollide(rectA, rectB)) {
      distance.HOR = -1;
      distance.VER = -1;
    } else {
      distance.HOR = Math.abs(rectA.X - rectB.X) < rectA.WIDTH ? Math.abs(rectA.X - rectB.X): Math.abs(rectA.X - rectB.X) - rectA.WIDTH / 2 - rectB.WIDTH / 2;
      distance.VER = Math.abs(rectA.Y - rectB.Y) < rectA.HEIGHT? Math.abs(rectA.Y - rectB.Y): Math.abs(rectA.Y - rectB.Y) - rectA.HEIGHT / 2 - rectB.HEIGHT / 2;
    }
    return distance;
  }

  //检测两个矩形相交
  static SVCheckCollide(rectA, rectB) {
    if (rectA.RIGHT <= rectB.LEFT || rectB.RIGHT <= rectA.LEFT || rectA.BOTTOM <= rectB.TOP || rectB.BOTTOM <= rectA.TOP) {//两个图形没有相交
      return false
    }
    return true
  }

  /**
   * 获取两个rect的距离
   * @param {} ax 
   * @param {*} ay 
   * @param {*} bx 
   * @param {*} by 
   */
  static SVGetRectDistance(rectA, rectB) {
    return Math.sqrt(Math.pow(rectA.X - rectB.X, 2) + Math.pow(rectA.Y - rectB.Y, 2));
  }
    /**
   * 获取两个rect的距离
   * @param {} ax 
   * @param {*} ay 
   * @param {*} bx 
   * @param {*} by 
   */
  static SVGetRectCenterDistance(rectA, rectB) {
    return Math.sqrt(Math.pow(rectA.X + rectA.WIDTH/2 - (rectB.X + rectB.WIDTH/2), 2) + Math.pow(rectA.Y + rectA.HEIGHT/2 - (rectB.Y + rectB.HEIGHT/2), 2));
  }
  /**
   * 获取两个坦克的距离
   * @param {*} tankA 
   * @param {*} tankB 
   */
  static SVGetTankDistance(tankA, tankB) {
    return PlayerControl.SVGetRectDistance(this.SVGetTankRect(tankA), this.SVGetTankRect(tankB));
  }

    /**
   * 获取两个坦克的距离，水平与垂直距离最短
   * @param {*} tankA 
   * @param {*} tankB 
   */
  static SVGetTankDistanceVerOrHorMin(tankA, tankB) {

    var mini = PlayerControl.SVGetRectHorAndVerDistance(this.SVGetTankRect(tankA), this.SVGetTankRect(tankB));

    if(mini.HOR < 3){
      return mini.VER
    }else if(mini.VER < 3){
      return mini.HOR
    }else {
      return mini.HOR < mini.VER ? mini.HOR : mini.VER;
    }
  }

  // 根据玩家返回正确的方向keyCode
  SVGetDirectionKeyCode(direction) {
    switch (direction) {
      case this.DIRECTION.UP:
        return this.svType === "A" ? 87 : 38;
      case this.DIRECTION.DOWN:
        return this.svType === "A" ? 83 : 40;
      case this.DIRECTION.LEFT:
        return this.svType === "A" ? 65 : 37;
      case this.DIRECTION.RIGHT:
        return this.svType === "A" ? 68 : 39;
    }
  }
  // 控制移动   举例子：  向左移动： this.SVMove(this.DIRECTION.LEFT)
  SVMove(direction) {
    if (typeof direction === undefined) return;
    this.svMoveEv.keyCode = this.SVGetDirectionKeyCode(direction);
    document.onkeydown(this.svMoveEv);
  }
  // 开火
  SVFire(direction) {
    this.svFireEv.keyCode = this.svType === "A" ? 32 : 8;
    document.onkeydown(this.svFireEv);
  }

  // 从paths中选择出运行方向上有目标的方向
  SVFindBestPathDirection(paths) {
    let directionSet = new Set

    for(let i=0;i<paths.length;i++) {
      let path = paths[i]
        let directions = ""
        let moves = path.moves
        for(let j=0;j<moves.length;j++) {
            directions += this.SVGetDirectionStr(moves[j].direction) + " "
        }
        console.log(directions)
      //首个方向记录一下
      let direction = path.moves[0].direction
      directionSet.add(direction)
    }
    //当前第五张图上，子弹的方向是哪个。（可以做成数组）
    let forbiddenDir = this.SVLastMatrixMostDirection();
    // 默认赋值为第一个path的第一个方向
    let finalDirection = []

    let distance = PlayerControl.MAX_DISTANCE
    directionSet.forEach(direction => {
      var hasTank = this.SVDirectionHasTank(direction)
      if((forbiddenDir == this.DIRECTION.STOP || direction%2 != forbiddenDir%2) && !hasTank){
        finalDirection.push(direction);
      }else{
        console.log("禁止向"+this.SVGetDirectionStr(direction)+"方向前进，该方向子弹即将过来.或者有坦克")
      }
    })
    if (finalDirection.length) {
      return finalDirection
    }else{
      return [paths[0].moves[0].direction]
    }
    
  }

  // 根据所有路径得到所有安全落点
  SVGetAllSafePointMapByPath(paths) {
    let safePointMap = new Map()
    let safePointPathMap = new Map()
    //优化点7：第五张图上，子弹最多的方向。子弹移动时候不能朝着子弹相对方向移动
    let forbiddenDir = this.SVLastMatrixMostDirection();
    for(let i = 0; i < paths.length; i++) {
      let path = paths[i]
      let lastMove = path.moves[path.moves.length-1]
      let key = this.SVGetPointKey(lastMove.targetPoint)
      if (!safePointPathMap.has(key)) {
        let array = []
        array.push(path)
        safePointPathMap.set(key, array)
      } else {
          let pathValue = safePointPathMap.get(key)
          pathValue.push(path)
      }

      if (!safePointMap.has(key)) {
          safePointMap.set(key, lastMove.targetPoint)
      }
    }
    return [safePointMap, safePointPathMap]
  }

    SVDirectionHasTank(dir){
    var lastMatrix = this.svMatrixArray[this.SV_DEPTH-1];
    switch(dir){
      case this.DIRECTION.UP:
        return lastMatrix[0][this.SV_DEPTH].value == this.HoldReason.TANK_Reason;
      break;
      case this.DIRECTION.RIGHT:
        return lastMatrix[this.SV_DEPTH][this.SV_DEPTH*2].value == this.HoldReason.TANK_Reason;
      break;
      case this.DIRECTION.DOWN:
        return lastMatrix[this.SV_DEPTH*2][this.SV_DEPTH].value == this.HoldReason.TANK_Reason;
      break;
      case this.DIRECTION.LEFT:
        return lastMatrix[this.SV_DEPTH][0].value == this.HoldReason.TANK_Reason;
      break;
    }
    return false;
  }
  /*
  中心坐标(1,1)
  |------------>y轴
  |    0
  |  0 0 0
  |    0
  ↓x
  */
  
  // 递归找出所有路径
  SVFindPaths(n) {
    if (n === 1) {
      // originPoint与centerPoint重合
      let originPoint = this.SVGetCenterPointOf(1)
      // basePath传递一个空的Path
      return this.SVBuildPaths(n, originPoint, this.SVPath(originPoint))
    } else {
      let paths = []
      let lowLevelPaths = this.SVFindPaths(n-1)
      // 遍历上一级递归得到的所有路径，在路径的终点去检测周围，在此基础上生成新的Path
      for(let k=0; k<lowLevelPaths.length; k++) {
        let lowLevelPath = lowLevelPaths[k]
        let moves = lowLevelPath.moves
        for(let l=0;l<moves.length;l++) {
          let move = moves[l]
          // 如果点的坐标系级别小于n,则升级
          if (move.targetPoint.coordLevel < n) {
            this.SVUpgradePointLevel(move.targetPoint)
          }
        }
        let lastMove = moves[moves.length-1]
        // 上一次的目标点作为这一次的原始点
        // 作一次坐标转换，从低一级图表转到高一级图表
        let originPoint = lastMove.targetPoint
        let tempPaths = this.SVBuildPaths(n, originPoint, lowLevelPath)
        if (tempPaths.length) {
          paths.push.apply(paths, tempPaths)  
        };
        
      }
      return paths
    }
  }

  // 根据上一次算好的path和原始点位计算第n步图中可能的路径
  SVBuildPaths(n, originPoint, basePath) {
    let graph = this.SVGetGraphOf(n)
    let paths = []

    // 遍历上下左右四个点的情况，对于值为0的点添加Movement
    // 向外走，不要向内走
    if (graph[originPoint.X - 1][originPoint.Y].value === 0 &&
        Math.abs(originPoint.X - 1-n)>Math.abs(originPoint.X-n)
      ) {
        let path = this.SVBuildPath(graph, originPoint.X - 1, originPoint.Y, n, basePath, this.DIRECTION.UP)
        paths.push(path)  
      
    }

    if (graph[originPoint.X + 1][originPoint.Y].value === 0 && 
        Math.abs(originPoint.X + 1 -n)>Math.abs(originPoint.X-n)
        ) {
        let path = this.SVBuildPath(graph, originPoint.X + 1, originPoint.Y, n, basePath, this.DIRECTION.DOWN)
        paths.push(path)  
    }

    if (graph[originPoint.X][originPoint.Y + 1].value === 0 && 
      Math.abs(originPoint.Y + 1-n)>Math.abs(originPoint.Y-n)
      ) {
      let path = this.SVBuildPath(graph, originPoint.X, originPoint.Y + 1, n, basePath, this.DIRECTION.RIGHT)
      paths.push(path)

    }

    if (graph[originPoint.X][originPoint.Y - 1].value === 0 && 
      Math.abs(originPoint.Y - 1-n)>Math.abs(originPoint.Y-n)
      ) {
      let path = this.SVBuildPath(graph, originPoint.X, originPoint.Y - 1, n, basePath, this.DIRECTION.LEFT)
      paths.push(path)  

    }

    return paths
  }

  SVBuildPath(originPoint, row, col, n, basePath, direction) {
    let targetPoint = this.SVPoint(row, col)
    let move = this.SVMovement(targetPoint)
    let path = this.SVPath(this.SVGetCenterPointOf(n))
    path.moves.push.apply(path.moves, basePath.moves)
    move.direction =  direction
    path.moves.push(move)
    return path
  }

  // 把低一级的坐标系内的点升级到高一级，以便在新的坐标系内找对位置
  SVUpgradePointLevel(point) {
    point.X += 1
    point.Y += 1
    point.coordLevel += 1
    return point
  }

  SVSortSafePoints(safePoints) {
    let imageArray = this.SVOnlySelfInDangerAreaPriority();
    for(let i=0;i<safePoints.length;i++) {
      let point = safePoints[i]
      point.bulletCount = this.SVCalculateBulletsCount(point)

      //如果坦克自身在危险区，需要将四边的危险系数，映射到四周
      if (point.X == 0 && point.Y == this.SV_DEPTH) {
        point.deadAreaCount = imageArray.topPriority
      }else if (point.X == this.SV_DEPTH && point.Y == 0) {
        point.deadAreaCount = imageArray.leftPriority
      }else if (point.X == this.SV_DEPTH && point.Y == this.SV_DEPTH*2) {
        point.deadAreaCount = imageArray.rightPriority;
      }else if (point.X == this.SV_DEPTH*2 && point.Y == this.SV_DEPTH) {
        point.deadAreaCount = imageArray.bottomPriority;
      }else if (point.X < this.SV_DEPTH && point.Y < this.SV_DEPTH) {
        point.deadAreaCount = imageArray.leftTopPriority;
      }else if (point.X > this.SV_DEPTH && point.Y < this.SV_DEPTH) {
        point.deadAreaCount = imageArray.leftBottomPriority;
      }else if (point.X < this.SV_DEPTH && point.Y > this.SV_DEPTH) {
        point.deadAreaCount = imageArray.rightTopPriority;
      }else if (point.X > this.SV_DEPTH && point.Y > this.SV_DEPTH) {
        point.deadAreaCount = imageArray.rightBottomPriority;
      }
      point.bulletCount += point.deadAreaCount;
    }

    // 根据子弹数多少进行排序，子弹数少的安全，排在前面
    safePoints.sort(this.SVSortPoint(this))
  }

  // 针对当前点计算周围子弹多少
  SVCalculateBulletsCount(point) {
    // 根据点位计算出坦克位置
    let realPoint = this.SVConvert2RealCoordFullScreen(point)
    let imaginaryTank = this.SVBuildImaginaryTank(realPoint.X, realPoint.Y)
    // 计算坦克周围5步内像素内子弹的个数
    let bulletCount = 0;
    let w = this.SV_DEPTH
    var lastMatrix = this.svMatrixArray[this.SV_DEPTH-1];
    //落入危险区间，不单纯计算子弹的多少(9月28号，仍然计算子弹数量)
      for(var i = 0;i<5;i++){
        bulletCount += this.SVGetBulletsCountAroundTank(imaginaryTank, w+i)
      }
    
      //优化点3：安全点，受到攻击时候，周边如果是边界也算子弹
      var screenX = window.innerWidth
      screenY = window.innerHeight-100
      if (this.hasBulletAttck || this.SVSelfInDangerArea() || this.SVAttackingOpponent()) {
        var imaginaryTankRect = this.SVExtandTank(imaginaryTank);
        var minDistance = Math.min(Math.min(Math.min(imaginaryTankRect.TOP,imaginaryTankRect.LEFT),screenX - imaginaryTankRect.RIGHT ),screenY - imaginaryTankRect.BOTTOM);
        minDistance += PlayerControl.SV_TANK_WH*4;//有时候模拟的坦克，会突破边界变为负数。但是不会超过2个坦克的举例.避免除数为零
        var val = (this.SV_BULLET_SPEED /minDistance)*1000;//达到边界的步数
        bulletCount += val;
        point.edgeCount = val;
      };

    //优化点4：安全点，周边有坦克的话。也转化为子弹.(方圆5步之内)
    {
      var left = point.Y-2;//安全点坐标系是反的
      var top = point.X-2;//安全点坐标系是反的
      var centerLine = this.SV_DEPTH;//中心的步数
      for (; top < point.X+2; top++) {
        for (; left < point.Y+2; left++) {
          var ver = left - centerLine;//对应Y值
          var hor = top - centerLine;
          if (Math.abs(ver) + Math.abs(hor) <= (centerLine)) {
            var matrix = this.svMatrixArray[centerLine-1];
            if (matrix[top][left].value == this.HoldReason.TANK_Reason) {
              bulletCount+=1;        
            };
          }
        };
      }
      /*
        优化点19：摇摆问题。需要更精细的计算(范围更大一点)
        解决坦克已经在一个危险区了。逃离一步后，发现仍有一个临近的危险区，就又退回去了，导致摇摆。最后死亡
      */
      var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
      var realRect = this.SVExtandTank(realPoint);
      for (var i = 0; i < this.svDeadAreas.length; i++) {  
        let collide = PlayerControl.SVCheckCollide(this.svDeadAreas[i], realRect)
        let collideSelf = PlayerControl.SVCheckCollide(this.svDeadAreas[i], myTankRect)
        if (collide&&!collideSelf) {
          //坦克移动后，是否不影响危险区间顺利通过。
          // var rectMove = this.svDeadAreas[i].RIGHT-myTankRect.LEFT;
          // var tankMove = (myTankRect.TOP - this.svDeadAreas[i].BOTTOM)
          // if(rectMove/this.SV_BULLET_SPEED < tankMove/this.SV_TANK_SPEED){
          //   //可以顺利通过
          //   console.log("可以顺利通过临近危险rect");
          // }else{
            //无法通过
            bulletCount ++;  
          // }
          
        };
        
      };
      {
        //如果dangerous 有值。累加到bulletCount上
        var matrix = this.svMatrixArray[centerLine-1];
        bulletCount += matrix[point.X][point.Y].dangerous;
      }
      
    }
    return bulletCount
  }

  // 把分布图中坐标转换成真正坐标
  SVConvert2RealCoordFullScreen(point) {
    let realPoint = {}
    let centerPoint = this.SVGetCenterPointOf(this.SV_DEPTH)
    realPoint.Y = this.svMyTank.Y + ((point.X - centerPoint.X) * this.SV_TANK_SPEED)
    realPoint.X = this.svMyTank.X + ((point.Y - centerPoint.Y) * this.SV_TANK_SPEED)
    return realPoint
  }

  SVGetGraphOf(n) {
    return this.svMatrixArray[n-1]
  }

  SVGetFirstStepArray(tankPoint, stepFromNow) {
    let array = this.SVInitArray(1)
    array[0][1] = 0
    return array
  }



  SVInitArray(n) {
    let array = []; //先声明一维
    let length = 2*n + 1
    for (let i = 0; i < length; i++) { //一维长度为11
      array[i] = []; //再声明二维
      for (let j = 0; j < length; j++) { //二维长度为11
        array[i][j] = 1; // 赋值，每个数组元素的值为1
      }
    }
    return array
  }

  SVGetDirectionStr(direction) {
    switch (direction) {
      case this.DIRECTION.UP:
        return "UP"
      case this.DIRECTION.DOWN:
        return "DOWN"
      case this.DIRECTION.LEFT:
        return "LEFT"
      case this.DIRECTION.RIGHT:
        return "RIGHT"
      default:
        return "STOP"
    }
  }

  SVGetCenterPointOf(n) {
    return this.SVPoint(n, n)
  }

  SVSortPoint(playerControl) {
      return function (point1, point2) {
          // 优先按子弹数量排序，子弹数量相同再按距离目标远近排序
          let result = point1.bulletCount - point2.bulletCount
          return result
      }
  }

  SVSortDistancePoint(safePoints) {
    safePoints.sort(this.SVSortDistancePoint_method(this))
  }


  SVSortDistancePoint_method(playerControl) {
      return function (point1, point2) {
          // 经过子弹数量，坦克距离。再根据落点本身预计核心点。越远越安全
          let enumNum = playerControl.SV_DEPTH;
          
          //必须是中心点的距离
          let distance1 = Math.sqrt(Math.pow(point1.X - enumNum, 2) + Math.pow(point1.Y - enumNum, 2));
          let distance2 = Math.sqrt(Math.pow(point2.X - enumNum, 2) + Math.pow(point2.Y - enumNum, 2));
          return distance2 - distance1;
      }
  }
  /*
    不考虑子弹情况，这里只考虑向哪个方向寻找坦克。后续逻辑根据自身位置判断是否使用该方法返回的方向。
    返回三个方向。
    此处：参数可能是一个目标坦克或者是墙的一边的中心点。
    既可以攻击坦克，也能发现躲避时候的落脚点
  */
  SVAttackTargetTank(targetObject,isTank,customGap){
    let myX = this.svMyTank.X;
    let myY = this.svMyTank.Y;
    let targetX = targetObject.X;
    let targetY = targetObject.Y;
    
    /*
      已经进入精准攻击范围，直接移动。
    */
    if (Math.abs(myX - targetX) <= customGap) {
      var dir = myY > targetY ?this.DIRECTION.UP:this.DIRECTION.DOWN
      var rect = this.SVBulletMoveRect(dir,targetObject,isTank);
      this.attackRect.push(rect);
      var wallCollide = this.SVCollideMetal(rect)
      if (wallCollide) {
        if (rect.X+rect.WIDTH/2 > myX+PlayerControl.SV_TANK_WH/2) {
          return [this.DIRECTION.LEFT,this.DIRECTION.RIGHT];
        }else{
          return [this.DIRECTION.RIGHT,this.DIRECTION.LEFT];
        }
      }else {
        var dir = (myY > targetY) ? this.DIRECTION.UP:this.DIRECTION.DOWN;
        var dis = PlayerControl.SVGetTankDistance(this.svMyTank, targetObject);
        if (dis<=this.svCurrentTankDistance && isTank) {
            dir = (dir+2)%4;
        }
        return [dir,dir];
      }
    }
    else if(Math.abs(myY - targetY) <= customGap){
      var dir = myX > targetX?this.DIRECTION.LEFT:this.DIRECTION.RIGHT;
      var rect = this.SVBulletMoveRect(dir,targetObject,isTank);
      this.attackRect.push(rect);
      var wallCollide =  this.SVCollideMetal(rect)
      if (wallCollide) {
          if (rect.Y+rect.HEIGHT/2 > myY+PlayerControl.SV_TANK_WH/2) {
           return [this.DIRECTION.UP,this.DIRECTION.DOWN];
        }else{
          return [this.DIRECTION.DOWN,this.DIRECTION.UP];
        }
      }else{
          var dir = (myX > targetX) ? this.DIRECTION.LEFT:this.DIRECTION.RIGHT;
          var dis = PlayerControl.SVGetTankDistance(this.svMyTank, targetObject);
          if (dis<=this.svCurrentTankDistance && isTank) {
            dir = (dir+2)%4;
          }
          return [dir,dir];
      }
    }else{
      /*
        移动到精准攻击范围内，或者绕开障碍物.
      */
      var dir =[]
      // var g = isTank?0:PlayerControl.SV_TANK_WH/2;
      if(Math.abs(myX - targetX) > Math.abs(myY - targetY)){
        var firstDir = (myY < targetY) ? this.DIRECTION.DOWN : this.DIRECTION.UP;
        var secondDir = (myX > targetX) ? this.DIRECTION.LEFT : this.DIRECTION.RIGHT;
        dir = this.SVFillAttackDir(firstDir,secondDir,0,targetObject.Y - this.svMyTank.Y,targetObject,isTank);
      }else{
        var firstDir = (myX < targetX)?this.DIRECTION.RIGHT:this.DIRECTION.LEFT;
        var secondDir = (myY > targetY)?this.DIRECTION.UP:this.DIRECTION.DOWN;
        
        dir = this.SVFillAttackDir(firstDir,secondDir,targetObject.X - this.svMyTank.X,0,targetObject,isTank);
      }
      return dir
    }
  }
  //当净胜分足够，即可躲避起来。
  SVAvoidTheOtherTank(){
    let nearestWallRect = 0;
    var nearDis = 0;
    var tWidth = this.SV_TANK_SPEED;
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,tWidth,tWidth);

    var safeWall = [];
    for (var i = 0; i < this.wallArray.length; i++) {
      let tmpRect = this.wallArray[i];
      let minX = Math.min(myTankRect.X + tWidth/2,tmpRect.X + tmpRect.WIDTH/2)
      let maxX = Math.max(myTankRect.X + tWidth/2,tmpRect.X + tmpRect.WIDTH/2)
      let minY = Math.min(myTankRect.Y + tWidth/2,tmpRect.Y + tmpRect.WIDTH/2)
      let maxY = Math.max(myTankRect.Y + tWidth/2,tmpRect.Y + tmpRect.WIDTH/2)
      let otherX = this.svOtherPlayerTank.X + tWidth/2;
      let otherY = this.svOtherPlayerTank.Y + tWidth/2;
      let maxDis = Math.max(Math.abs(maxX - minX),Math.abs(maxY - minY));
      //如果maxdix比较小。说明正在绕柱子行走。
      if((otherX > minX && otherX < maxX || otherY > minY && otherY < maxY) && maxDis > (tmpRect.WIDTH+tWidth)/2+ tWidth){
        // console.log('');
      }else{
        safeWall.push(tmpRect);
      }
    }
    if (safeWall.length == 0) {
      safeWall = this.wallArray;
    };
    //获得最近的墙，且不能和敌方坦克相交.
    for (var i = 0; i < safeWall.length; i++) {
      let tmpRect = safeWall[i];
      let dis = PlayerControl.SVGetRectCenterDistance(myTankRect,tmpRect);
      if (nearDis == 0 ) {
        nearDis = dis;
        nearestWallRect = tmpRect;
      }else if (dis<nearDis) {
        nearDis = dis;
        nearestWallRect = tmpRect;
      }
    }
    let tankW = PlayerControl.SV_TANK_WH+this.SV_TANK_SPEED;
    let littleGap = this.SV_TANK_SPEED;

    //边的中心点原始值
    let leftCenterOri = this.SVGetStepRect(nearestWallRect.X,nearestWallRect.Y + nearestWallRect.HEIGHT/2,1,1);
    let topCenterOri = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH/2,nearestWallRect.Y,1,1);
    let rightCenterOri = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH,nearestWallRect.Y + nearestWallRect.HEIGHT/2,1,1);
    let bottomCenterOri = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH/2,nearestWallRect.Y + nearestWallRect.HEIGHT,1,1);
    //经过计算后，我方坦克需要落位的点
    let otherTankRect = this.SVGetStepRect(this.svOtherPlayerTank.X,this.svOtherPlayerTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    let leftCenter = this.SVGetStepRect(nearestWallRect.X-tankW,nearestWallRect.Y + nearestWallRect.HEIGHT/2,1,1);
    let topCenter = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH/2,nearestWallRect.Y-tankW,1,1);
    let rightCenter = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH + littleGap ,nearestWallRect.Y + nearestWallRect.HEIGHT/2,1,1);
    let bottomCenter = this.SVGetStepRect(nearestWallRect.X + nearestWallRect.WIDTH/2,nearestWallRect.Y + nearestWallRect.HEIGHT + littleGap,1,1);



    //障碍物四个边距离对手坦克的距离。
    leftCenter.value = PlayerControl.SVGetRectCenterDistance(leftCenterOri,otherTankRect);
    topCenter.value = PlayerControl.SVGetRectCenterDistance(topCenterOri,otherTankRect);
    rightCenter.value = PlayerControl.SVGetRectCenterDistance(rightCenterOri,otherTankRect);
    bottomCenter.value = PlayerControl.SVGetRectCenterDistance(bottomCenterOri,otherTankRect);

    leftCenter.direction = this.DIRECTION.LEFT;
    rightCenter.direction = this.DIRECTION.RIGHT;
    topCenter.direction = this.DIRECTION.UP;
    bottomCenter.direction = this.DIRECTION.DOWN;

    var tmpArray = [leftCenter,topCenter,rightCenter,bottomCenter]
    var farest = 0;
    for (var i = 0; i < tmpArray.length; i++) {
       var t = tmpArray[i];
       if (farest ==0) {
        farest = t;
       }else if (t.value > farest.value) {
        farest = t;
       };
    };
    return farest;
  }
  
  //优化点21：攻击方向的优化。如果离坦克太近。则会向反方向移动。直至安全再攻击坦克（避免死锁）
  SVFillAttackDir(firstDir,secondDir,marginx,marginy,targetObject,isTank){
    var dir =[]
    var rect1 = this.SVBulletMoveRect(firstDir,targetObject,isTank);
    var rect2 = this.SVBulletMoveRect(secondDir,targetObject,isTank);

    //原始逻辑位置是否阻挡。
    var wallCollide2Original = this.SVCollideMetal(rect2);
    this.SVMoveStepRect(rect2,marginx,marginy);//需要位移一下，移动到实际走的位置
    this.attackRect.push(rect1);
    this.attackRect.push(rect2);

    var wallCollide1 = this.SVCollideMetal(rect1)
    var wallCollide2 = this.SVCollideMetal(rect2)
    //如果原始逻辑位置和实际走位都阻挡。说明完全被障碍物挡住
    var wallWidth = this.wallArray.length? this.wallArray[0].WIDTH:0;
    var gap = Math.max(Math.abs(marginy),Math.abs(marginx));
    if (wallCollide2Original && wallCollide2 && gap<wallWidth) {
      firstDir = (firstDir+2)%4;//反方向走  
      dir.push(firstDir);
      dir.push(firstDir);
    }else if (wallCollide1 && wallCollide2) {
        this.SVMoveStepRect(rect2,-marginx,-marginy)//用于打印日志
        dir.push(secondDir);
        dir.push(secondDir);
    }else if (wallCollide1 || wallCollide2) {
      //如果有墙，不能移动。仍按照原有顺序进行
      var lastMatrix = this.svMatrixArray[this.SV_DEPTH-1];
      var row = this.wallJudgement[secondDir][0]
      var colum = this.wallJudgement[secondDir][1]
      if (lastMatrix[this.SV_DEPTH + row][this.SV_DEPTH + colum].value == this.HoldReason.EDGE_Reason) {
        firstDir = (firstDir+2)%4;//反方向走
        dir.push(firstDir);
        dir.push(secondDir);
      }else{
        dir.push(secondDir);
        dir.push(firstDir);
      }
    }else{
      dir.push(firstDir);
      dir.push(secondDir);
    }
    return dir;
  }

  SVCollideMetal(rect){
    for (var i = 0; i < this.wallArray.length; i++) {
        if(PlayerControl.SVCheckCollide(this.wallArray[i],rect)){
          rect.fallInDanger = true;
          return true;
        }
      };  
    return false;
  }

  SVBuildImaginaryTank(x, y) {
    let imaginaryTank = {}
    imaginaryTank.X = x
    imaginaryTank.Y = y
    return imaginaryTank
  }

  // 类型定义
  SVPoint(x, y) {
    let point = {}
    point.X = x
    point.Y = y
    // 所在坐标第级别 从1到5
    point.coordLevel = 1
    // 周围子弹数多少
    point.bulletCount = 0
    point.edgeCount = 0;
    point.deadAreaCount = 0;//中心在危险区，映射到边界
    return point
  }

  SVPath(originPoint) {
    let path = {}
    path.originPoint = originPoint
    path.moves = []
    return path
  }

  SVMovement(targetPoint) {
    let move = {}
    move.direction = this.DIRECTION.STOP
    move.targetPoint = targetPoint
    return move
  }
  /*
  1. 纯粹的方法，找到最近的坦克（包含第三关的对手坦克）
  2. 优化点：如果这个坦克已经在我方子弹的必死区间，则忽略这个坦克。转而找下一个坦克
  */
  SVFindClosestEnemy() {
    var distance = PlayerControl.MAX_DISTANCE;
    var closestEnemy;
    let tWidth = PlayerControl.SV_TANK_WH;
    this.svEnemyTanks.forEach(enemy => {
      //如果落入我方必死区间，那么不用计算这个坦克了。半径是2.
      let radius = PlayerControl.SV_BULLET_WH;
      let enemyRect = this.SVGetStepRect(enemy.X+tWidth/2 - radius/2,enemy.Y+tWidth/2- radius/2,radius,radius);
      let willDead = false;
      for (var i = 0; i < this.svMyBulletsRectArray.length; i++) {
        let myBulletDeadRect = this.svMyBulletsRectArray[i];
        if (PlayerControl.SVCheckCollide(myBulletDeadRect,enemyRect)) {
          willDead = (true && this.svEnemyTanks.length > 1);//最后一个，始终使用它
        };
      };

      var dis = PlayerControl.SVGetTankDistance(this.svMyTank, enemy);
      if (dis < distance && !willDead) {
        closestEnemy = enemy;
        distance = dis;
      }
    });
    return closestEnemy;
  }

  SVAttackingOpponent(){
    //获取到的就是对手(临时攻击一下对手，因为它太近了.)
    if (this.svOtherPlayerTank
      && this.svTargetTank.X == this.svOtherPlayerTank.X 
      && this.svTargetTank.Y == this.svOtherPlayerTank.Y 
      && (this.svTargetTank['id'] == 100 || this.svTargetTank['id'] == 200)
      && !this.ahead
      && this.gameLevel == 3
      ) {
      return true;
    };
    return false;
  }

  //根据接下来要移动的方向 判断是否应该开火
  // 返回一个target对象  包含direction和distance两个属性
  SVFireTarget(direction,gap) {
    console.log("input direction:", direction)
    //找到所有同轴坦克
    var tanksInRange = [];
    this.svEnemyTanks.forEach(enemy => {
      if (Math.abs(this.svMyTank['X'] - enemy['X']) <= gap || Math.abs(this.svMyTank['Y'] - enemy['Y']) <= gap) {
        tanksInRange.push(enemy);
      }
    });

    var target = {};
    var nearestTargetTank;
    tanksInRange.forEach(enemy => {
      var rightDir = false;
      //优化点10：当地方坦克的重叠区域小于一个坦克的宽度。即可发射炮弹。
      switch (direction) {
        case this.DIRECTION.UP:
          rightDir = (Math.abs(this.svMyTank['X'] - enemy['X']) <= gap) && enemy.Y < this.svMyTank.Y;
          break;
        case this.DIRECTION.RIGHT:
          rightDir = Math.abs(this.svMyTank['Y'] - enemy['Y']) <= gap && enemy.X > this.svMyTank.X;
          break;
        case this.DIRECTION.DOWN:
          rightDir = (Math.abs(this.svMyTank['X'] - enemy['X']) <= gap) && enemy.Y > this.svMyTank.Y;
          break;
        case this.DIRECTION.LEFT:
          rightDir = Math.abs(this.svMyTank['Y'] - enemy['Y']) <= gap && enemy.X < this.svMyTank.X;
          break;
      }
      if (rightDir == true) {
        if ($.isEmptyObject(nearestTargetTank)) {
          nearestTargetTank = enemy;
          target.near = nearestTargetTank;
        } else {
          if (PlayerControl.SVGetTankDistance(this.svMyTank, enemy) < PlayerControl.SVGetTankDistance(this.svMyTank, nearestTargetTank)) {
            nearestTargetTank = enemy;
          }
        }

      }
    });

    if ($.isEmptyObject(nearestTargetTank)) {
      target.direction = -1;
      target.distance = 0;
    } else {
      target.distance = PlayerControl.SVGetTankDistance(this.svMyTank, nearestTargetTank);
      target.direction = direction;
    }
    console.log("target:", target.direction, target.distance)
    target.near = nearestTargetTank;
    return target;
  }
  //找到最近的坦克后，看一下，有没有临近的可命中的坦克。gap 是标准的2倍。
  SVSideFire(targetTank,gap){
    if (!targetTank) {
      return 0;
    };
    let xGap = targetTank.X - this.svMyTank.X
    let yGap = targetTank.Y - this.svMyTank.Y
    var axis = (Math.abs(xGap) > gap)?'Y':'X';
    var theotherAxis = (Math.abs(xGap) > gap)?'X':'Y';
    var centerLine = (Math.abs(xGap) > gap)?this.svMyTank.Y + yGap/2:this.svMyTank.X + xGap/2;
    var sideArray = [];
    this.svEnemyTanks.forEach(enemy => {
      if (Math.abs(centerLine - enemy[axis]) <= gap && (this.svMyTank[theotherAxis]-enemy[theotherAxis])*(this.svMyTank[theotherAxis]-targetTank[theotherAxis]) > 0) {
        sideArray.push(enemy);
      }
    });
    return sideArray;
  }

  //保证同方向相隔半个坦克之内 不会重复发射子弹
  SVShouldFireToDirction(direction,gap) {
    var shouldFire = true;
    this.svMyBullets.forEach(bullet => {
      var bulletDir = bullet['direction'];
      if (bulletDir == direction) {

        if (bullet.direction == this.DIRECTION.LEFT || bullet.direction == this.DIRECTION.RIGHT) {
          if (bullet.Y > this.svMyTank.Y && bullet.Y < this.svMyTank.Y + gap) {
            shouldFire = false;
            return shouldFire;
          }
        } else {
          if (bullet.X > this.svMyTank.X && bullet.X < this.svMyTank.X + gap) {
            shouldFire = false;
            return shouldFire;
          }
        }
      }
    });
    return shouldFire;
  }

  SVExistBulletInDirection(direction) {
    var existBullet = false;
    this.svMyBullets.forEach(bullet => {
      var bulletDir = bullet['direction'];
      if (bulletDir == direction) {
        existBullet = true;
        return existBullet;
      }
    });
    return existBullet;
  }

  SVBulletFaceAttack(){
    return false;
  }

  // SVCreateCoverArea(){
  //   var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
  //   var centerX = myTankRect.X + PlayerControl.SV_TANK_WH/2;
  //   var centerY = myTankRect.Y + PlayerControl.SV_TANK_WH/2;
  //   var targetTankRect = this.SVGetStepRect(this.svTargetTank.X,this.svTargetTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
  //   var centerX_t = targetTankRect.X + PlayerControl.SV_TANK_WH/2;
  //   var centerY_t = targetTankRect.Y + PlayerControl.SV_TANK_WH/2;
  //   if (centerX_t < centerX) {
  //     let topY = Math.min(centerY,centerY_t);
  //     let height = Math.abs(centerY-centerY_t);
  //     let width = Math.abs(centerX-centerX_t);
  //     self.coverArea = this.SVGetStepRect(0,topY,width,height);
  //   };
  // }
  /*
    在极限情况下。坦克影响到了唯一的路径。需要将坦克移除再走一遍路径
  */
  SVExclueTankFlag(){
    for (var i = 0; i < this.svMatrixArray.length; i++) {
      var matrix = this.svMatrixArray[i];
      var centerLine = i+1
        for (var j = 0; j < matrix.length; j++) {
          for (var k = 0; k < matrix.length; k++){
            if (Math.abs(j-centerLine)+Math.abs(k-centerLine) <= centerLine ) {
              if(matrix[j][k].value == this.HoldReason.TANK_Reason){
                matrix[j][k].value = 0;
              }
            }
          }
        }
    }
  }
  //自身或者行动轴上在危险区
  SVSelfInDangerArea(){
    let indexMatrix = this.SV_DEPTH
    var lastMatrix = this.svMatrixArray[indexMatrix-1];
    if(lastMatrix[indexMatrix][indexMatrix].fallInDanger
      ||lastMatrix[indexMatrix][0].fallInDanger
      ||lastMatrix[0][indexMatrix].fallInDanger
      ||lastMatrix[indexMatrix*2][indexMatrix].fallInDanger
      ||lastMatrix[indexMatrix][indexMatrix].fallInDanger){
      return true;
    }
    return false;
  }
  //仅仅，自身在危险区
  SVOnlySelfInDangerArea(){
    let indexMatrix = this.SV_DEPTH
    var lastMatrix = this.svMatrixArray[indexMatrix-1];
    if(lastMatrix[indexMatrix][indexMatrix].fallInDanger){
      return true;
    }
    return false;
  }

  //自身在危险区，那么计算自身四周和四个角所在的权重给边界。优化点22：
  SVOnlySelfInDangerAreaPriority(){
    let fallIn = this.SVOnlySelfInDangerArea();
    var imageArray={};
    imageArray.topPriority = 0;
    imageArray.bottomPriority = 0;
    imageArray.leftPriority = 0;
    imageArray.leftTopPriority = 0;
    imageArray.leftBottomPriority = 0;
    imageArray.rightPriority = 0;
    imageArray.rightTopPriority = 0;
    imageArray.rightBottomPriority = 0;
    
    if (fallIn) {
      //四个边的中心点和四个顶点，是否在危险区
      let topCenter = this.SVGetStepRect(this.svMyTank.X+PlayerControl.SV_TANK_WH/2,this.svMyTank.Y,1,1);
      let bottomCenter = this.SVGetStepRect(this.svMyTank.X+PlayerControl.SV_TANK_WH/2,this.svMyTank.Y+PlayerControl.SV_TANK_WH,1,1);
      let leftCenter = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y+PlayerControl.SV_TANK_WH/2,1,1);
      let leftTop = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,1,1);
      let leftBottom = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y+PlayerControl.SV_TANK_WH,1,1);
      let rightCenter = this.SVGetStepRect(this.svMyTank.X+PlayerControl.SV_TANK_WH,this.svMyTank.Y+PlayerControl.SV_TANK_WH/2,1,1);
      let rightTop = this.SVGetStepRect(this.svMyTank.X+PlayerControl.SV_TANK_WH,this.svMyTank.Y,1,1);
      let rightBottom = this.SVGetStepRect(this.svMyTank.X+PlayerControl.SV_TANK_WH,this.svMyTank.Y+PlayerControl.SV_TANK_WH,1,1);
      

      for (var i = 0; i < this.svDeadAreas.length; i++) {  
        let tmp = this.svDeadAreas[i];
        let bottomCollide = PlayerControl.SVCheckCollide(bottomCenter,tmp);
        let topCollide = PlayerControl.SVCheckCollide(topCenter,tmp);
        let leftCollide = PlayerControl.SVCheckCollide(leftCenter,tmp);
        let leftTopCollide = PlayerControl.SVCheckCollide(leftTop,tmp);
        let leftBottomCollide = PlayerControl.SVCheckCollide(leftBottom,tmp);
        let rightCollide = PlayerControl.SVCheckCollide(rightCenter,tmp);
        let rightTopCollide = PlayerControl.SVCheckCollide(rightTop,tmp);
        let rightBottomCollide = PlayerControl.SVCheckCollide(rightBottom,tmp);
        

        imageArray.topPriority += topCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.bottomPriority += bottomCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.leftPriority += leftCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.leftTopPriority += leftTopCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.leftBottomPriority += leftBottomCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.rightPriority += rightCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.rightTopPriority += rightTopCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        imageArray.rightBottomPriority += rightBottomCollide? this.DangerousCount.DangerousCountDeadAreaImage:0;
        

      }
    };
    return imageArray;
  }

  SVExtandTank(realPoint){
      var xMargin = 0
      var yMargin = 0
      if (realPoint.Y < this.svMyTank.Y) {
        yMargin= -PlayerControl.SV_TANK_WH
      }
      if (realPoint.Y > this.svMyTank.Y) {
        yMargin= PlayerControl.SV_TANK_WH 
      }
      if (realPoint.X < this.svMyTank.X) {
        xMargin= -PlayerControl.SV_TANK_WH
      }
      if (realPoint.X > this.svMyTank.X) {
        xMargin= PlayerControl.SV_TANK_WH 
      }
      var realRect = this.SVGetStepRect(realPoint.X + xMargin,realPoint.Y + yMargin,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
      return realRect;
  }
  //根据我方坦克的位置，算出子弹到达敌方坦克的矩形。用于判断是否会和障碍物碰撞。
  SVBulletMoveRect(dir,targetObject,isTank){
    var rect = 0;
    var centerX = this.svMyTank.X + (isTank?PlayerControl.SV_TANK_WH/2:0);//坦克才使用中心点。
    var centerY = this.svMyTank.Y + (isTank?PlayerControl.SV_TANK_WH/2:0);
    var targetCenterX = targetObject.X + (isTank? PlayerControl.SV_TANK_WH/2:0);
    var targetCenterY = targetObject.Y + (isTank? PlayerControl.SV_TANK_WH/2:0);

    var bulletWidth = isTank ? PlayerControl.SV_BULLET_WH:0;
    var rectThick = isTank ? PlayerControl.SV_BULLET_WH:PlayerControl.SV_TANK_WH;
    var targetRect = this.SVGetStepRect(targetObject.X,targetObject.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH)
    var myRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH)
    switch(dir){
      case this.DIRECTION.UP:
        rect = this.SVGetStepRect(centerX-bulletWidth/2,targetCenterY,rectThick,Math.abs(centerY-targetCenterY))
        break;
      case this.DIRECTION.RIGHT:
        rect = this.SVGetStepRect(centerX,centerY-bulletWidth/2,Math.abs(targetCenterX- centerX) ,rectThick)
        break;
      case this.DIRECTION.DOWN:
        rect = this.SVGetStepRect(centerX-bulletWidth/2,centerY,rectThick,Math.abs(targetCenterY - centerY))
        break;
      case this.DIRECTION.LEFT:
        rect = this.SVGetStepRect(targetCenterX,centerY-bulletWidth/2,Math.abs(centerX-targetCenterX),rectThick)
        break;
    }
    rect.direction = dir
    return rect;
  }
  //优化点23：
  //几种情况，1.正常命中。2.边界的话，必死区间更大一些。3.如果是子弹墙，则更大的必死面积。
  SVCreateMyBulletDeatRectArray(){
    var canvas = document.getElementById('canvas');
    let minStep = Math.ceil((PlayerControl.SV_TANK_WH/2+PlayerControl.SV_BULLET_WH/2)/this.SV_TANK_SPEED);
    let bWidth = PlayerControl.SV_BULLET_WH;
    let tWidth = PlayerControl.SV_TANK_WH;
    let WH = minStep * this.SV_BULLET_SPEED + PlayerControl.SV_BULLET_WH/2 + (PlayerControl.SV_TANK_WH/2);
    let edgeWH = WH*2;
    var rect;
    for (var i = 0; i < this.svMyBullets.length; i++) {
      let b = this.svMyBullets[i];
      let leftEdge = b.X < (tWidth+bWidth/2);
      let topEdge = b.Y < (tWidth+bWidth/2)
      let rightEdge = b.X > (canvas.width - bWidth/2);
      let bottomEdge = b.Y > (canvas.height-bWidth/2);
      let isEdge = leftEdge|| topEdge || rightEdge || bottomEdge;

      switch(b.direction){
        case this.DIRECTION.UP:
        case this.DIRECTION.DOWN:
          let topY_offset =  b.direction == this.DIRECTION.UP?(-WH):0;
          let topY_Edge =  b.direction == this.DIRECTION.UP?(-edgeWH):0;
          if (leftEdge) {
            rect = this.SVGetStepRect(0,b.Y + topY_Edge,b.X,edgeWH);
          }else if (rightEdge) {
            rect = this.SVGetStepRect(b.X-bWidth/2,b.Y + topY_Edge,(canvas.width-b.X),edgeWH);
          }else{
            rect = this.SVGetStepRect(b.X-bWidth/2,b.Y + topY_offset,bWidth,WH);  
          }
        break;

        case this.DIRECTION.RIGHT:
        case this.DIRECTION.LEFT:
          let leftX_offset = b.direction == this.DIRECTION.LEFT?(-WH):0;
          let leftX_Edge =  b.direction == this.DIRECTION.LEFT?(-edgeWH):0;
          if (topEdge) {
            rect = this.SVGetStepRect(b.X+leftX_Edge,0,edgeWH,b.Y);
          }else if (bottomEdge) {
            rect = this.SVGetStepRect(b.X+leftX_Edge,b.Y-bWidth/2,edgeWH,canvas.height-b.Y);
          }else{
            rect = this.SVGetStepRect(b.X+leftX_offset,b.Y-bWidth/2,WH,bWidth);
          }
            
    
        break;
      }
      this.svMyBulletsRectArray.push(rect);
    };
  }


//===========================================
//==================log =====================
//===========================================
  drawDearArea(){
    var c=document.getElementById('canvas');
    var ctx=c.getContext("2d");
    //绘制边界死锁
    for (var z = 0; z < this.svDeadAreas.length; z++) {
      let rect = this.svDeadAreas[z]
      ctx.beginPath();
      ctx.lineWidth="2";
      ctx.strokeStyle="green";
      ctx.rect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT);
      ctx.stroke();
    };
    //绘制边界死锁
    for (var z = 0; z < this.svDeadAreasOnlyForLog.length; z++) {
      let rect = this.svDeadAreasOnlyForLog[z]
      ctx.beginPath();
      ctx.lineWidth="2";
      ctx.strokeStyle="orange";
      ctx.rect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT);
      ctx.stroke();
    };
    //绘制相对方向死锁
    for (var i = 0; i < this.svDeadFaceFaceAreas.length; i++) {
      let rect = this.svDeadFaceFaceAreas[i]
      ctx.beginPath();
      ctx.lineWidth="2";
      ctx.strokeStyle="orange";
      ctx.rect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT);
      ctx.stroke();
    };
  }

  drawAttackRect(){
    if (this.attackRect.length) {
      var c=document.getElementById('canvas');
      var ctx=c.getContext("2d");
    
      for (var i = 0; i < this.attackRect.length; i++) {
        let rect = this.attackRect[i];
        if (rect.fallInDanger) {
          ctx.fillStyle = '#e0f'
          ctx.fillRect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT)
        }else{
          ctx.beginPath();
          ctx.lineWidth="2";
          ctx.strokeStyle = rect.fallInDanger?"white":"red";
          ctx.rect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT);
          ctx.stroke();
        }
      };
    };
  }
  drawSideAttackRect(){
    if (this.sideAttackForLog) {
      var c=document.getElementById('canvas');
      var ctx=c.getContext("2d");
      ctx.beginPath();
      ctx.lineWidth="2";
      ctx.strokeStyle="blue";
      ctx.rect(this.sideAttackForLog.X,this.sideAttackForLog.Y,this.sideAttackForLog.WIDTH,this.sideAttackForLog.HEIGHT);
      ctx.stroke();  
    };
  }

  drawMyBulletsRect(){
    var c=document.getElementById('canvas');
    var ctx=c.getContext("2d");
    for (var i = 0; i < this.svMyBulletsRectArray.length; i++) {
      let rect = this.svMyBulletsRectArray[i];
      ctx.beginPath();
      ctx.lineWidth="2";
      ctx.strokeStyle = '#e0f';
      ctx.rect(rect.X,rect.Y,rect.WIDTH,rect.HEIGHT);
      ctx.stroke();  
    };
    
    
  }

  drawMatrix(){
  // return;

  this.drawSideAttackRect();

  this.drawDearArea();

  this.drawAttackRect();

  this.drawMyBulletsRect();
  var c=document.getElementById('canvas');
  var ctx=c.getContext("2d");

  //绘制矩阵
  var logTank = aMyTankCount[0];
  var indexMatrix = Math.min(5,this.SV_DEPTH);//第几个矩阵，取值1~2~3~4~5
    var centerLine = indexMatrix;
    var i = indexMatrix;
    var matrix = this.svMatrixArray[indexMatrix-1];
    for (var j = 0; j < (i*2) + 1; j++) {
          for (var k = 0; k < (i*2) + 1; k++) {
            var hor = k - centerLine;//对应X值
            var ver = j - centerLine;
            if (Math.abs(ver) + Math.abs(hor) <= (i)) {
              var gridRect = matrix[j][k];
              ctx.beginPath();
              ctx.lineWidth="1";
              ctx.strokeStyle= this.svCurrentTankDistance == this.svOtherTankEnoughDistance?"pink": (this.hasEscapeBullet? "red":(this.hasFallInDanger?"yellow":"blue"));
              ctx.rect(gridRect.X,gridRect.Y,gridRect.WIDTH,gridRect.HEIGHT);
              ctx.stroke();          
              //
              if (gridRect.value>0) {
                //绘制防护区域,便于观察
                ctx.font="10px Georgia";
                var offsetX = (k == centerLine)?PlayerControl.SV_TANK_WH/2.0:0;
                var offsetY = (j == centerLine)?PlayerControl.SV_TANK_WH/2.0:this.svMatrixGridWidth/2.0;
                ctx.fillText(gridRect.value,gridRect.X+offsetX,gridRect.Y+offsetY);

                //打印临近子弹的坐标
                if(gridRect.bullet){
                  var string = "(";
                  string = string + gridRect.bullet.X +","+gridRect.bullet.Y+")";
                  ctx.fillText(string,gridRect.bullet.X+PlayerControl.SV_BULLET_WH,gridRect.bullet.Y-5);
                }
              };
            }
      }

  } 
    //打印坦克坐标
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    var string = "";
    string = string + myTankRect.X +","+myTankRect.Y;
    // ctx.fillStyle = 'orange';
    ctx.font="12px Georgia";
    ctx.fillText(string,myTankRect.X,myTankRect.Y+20);
}

 SVLogMatrixHor(){
  //共有五行数组，所以使用this.svMatrixArray.length
  for (var i = 0; i < this.svMatrixWidth; i++) {
    var logString = "";
    // 五个数组的第n行，都打出来。
    for (var p = 0; p < Math.abs(this.svMatrixArray.length,this.SV_DEPTH); p++) {
      var matrix = this.svMatrixArray[p];
      for (var j = 0; j < this.svMatrixWidth; j++) {
          //经过：靠前的数组，宽度不够svMatrixWidth
          var maxWidth = ((p+1)*2+1);

          var vutrual_i = (i - this.SV_DEPTH)+1+p;
          var vutrual_j = (j - this.SV_DEPTH)+1+p;
          if (vutrual_j<0||vutrual_j>maxWidth) {
            continue;
          };
          if(vutrual_i >= 0 && vutrual_j >=0 && vutrual_i < maxWidth && vutrual_j < maxWidth && matrix[vutrual_i][vutrual_j]) {
            logString += matrix[vutrual_i][vutrual_j].value;  
            if (matrix[vutrual_i][vutrual_j].value == 1) {
              logString += matrix[vutrual_i][vutrual_j].bullet.direction
              logString += " ";
            }else{
              if (matrix[vutrual_i][vutrual_j].dangerous==this.DangerousCount.DangerousCountFace) {
                logString += "x ";//matrix[vutrual_i][vutrual_j].dangerous
              }else if (matrix[vutrual_i][vutrual_j].dangerous==this.DangerousCount.DangerousCountDeadArea){
                logString += "y ";
              }else if(matrix[vutrual_i][vutrual_j].dangerous>0){
                logString += "z ";
              }else{
                logString += "  ";    
              }
              
            }
          }else{
            logString += "   ";  
          }
        }
    };  
    console.log(logString);
  };
  
 } 
  /**
  *
  * 打印日志，验证正确性
  * 从1 开始[1~5]
  */
  SVLogMatrixVer(logArray,steps){

    console.log("矩阵输出：");
    for (var p = 0; p < Math.min(this.svMatrixArray.length,this.SV_DEPTH) ; p++) {
      var matrix = this.svMatrixArray[p];
      var steps = p+1;
      for (var i = 0; i < (steps*2) + 1; i++) {
        var logString = "";
        for (var j = 0; j < (steps*2) + 1; j++) {
            if (matrix[i][j]) {
              logString += matrix[i][j].value;  
              logString += " ";
            }else{
              logString += "  ";  
            }
        }
        
        console.log(logString);
    };
    };

    
  }

    SVPrintLastFourPath(paths){

    var upCount = 0,downCount = 0,leftCount = 0,rightCount = 0;
    var resutlPathUP = [];
    var resutlPathDown = [];
    var resutlPathLeft = [];
    var resutlPathRight = [];
    for(var i = 0;i<paths.length;i++){
      if(paths[i].moves[0].direction == this.DIRECTION.UP){
        upCount++;
        resutlPathUP.push(paths[i]);
      }
      else if(paths[i].moves[0].direction == this.DIRECTION.DOWN){
        downCount++;
        resutlPathDown.push(paths[i]);
      }
      else if(paths[i].moves[0].direction == this.DIRECTION.LEFT){
        leftCount++;
        resutlPathLeft.push(paths[i]);
      }
      else if(paths[i].moves[0].direction == this.DIRECTION.RIGHT){
        rightCount++;
        resutlPathRight.push(paths[i]);
      } 
    }
    var tempCount = 0;
    var direction;
    var resultPath;
    if(upCount > tempCount){
      tempCount = upCount;
      direction = this.DIRECTION.UP;
      resultPath = resutlPathUP;
    }

    if(downCount > tempCount){
      tempCount = downCount;
      direction = this.DIRECTION.DOWN;
      resultPath = resutlPathDown;
    }

    if(leftCount > tempCount){
      tempCount = leftCount;
      direction = this.DIRECTION.LEFT;
      resultPath = resutlPathLeft;
    }

    if(rightCount > tempCount){
      tempCount = rightCount;
      direction = this.DIRECTION.RIGHT;
      resultPath = resutlPathRight;
    }
    console.log("upCount :" + upCount + " downCount :" + downCount+" leftCount :" + leftCount + " rightCount :"+rightCount)
  
    return resultPath;
  }

  SVGreateDirectionBulletArray(){
    this.svAllDirectionBullets = [[],[],[],[]];
    var tmpArray =[]
    tmpArray = tmpArray.concat(this.svEnemyBullets).concat(this.svTankSimulateBulletArray);

    for (var i = 0; i < tmpArray.length; i++) {
      let bullet = tmpArray[i]
      this.svAllDirectionBullets[bullet.direction].push(bullet);
    };
    
  }
  //创建我方子弹各个方向的数组
  SVGreateDirectionMyBulletArray(){
    this.svAllDirectionMyBullets = [[],[],[],[]];
    for (var i = 0; i < this.svMyBullets.length; i++) {
      let bullet = this.svMyBullets[i];
      this.svAllDirectionMyBullets[bullet.direction].push(bullet);
    };
    
  }

  //暂时，不考虑障碍物的情况
  SVMytankAtEdge(finalDirection,edgeGap){
    var canvas = document.getElementById('canvas');
    var myTankRect = this.SVGetStepRect(this.svMyTank.X,this.svMyTank.Y,PlayerControl.SV_TANK_WH,PlayerControl.SV_TANK_WH);
    var myTankRectLarge = this.SVGetStepRect(this.svMyTank.X - edgeGap,this.svMyTank.Y-edgeGap,PlayerControl.SV_TANK_WH+edgeGap*2,PlayerControl.SV_TANK_WH+edgeGap*2);
    switch(finalDirection){
      case this.DIRECTION.UP:
        if(myTankRect.Y < edgeGap){
          return true;
        }
      break;
      case this.DIRECTION.RIGHT:
      if (myTankRect.RIGHT > canvas.width-edgeGap) {
        return true;
      };
      break;
      case this.DIRECTION.DOWN:
        if (myTankRect.BOTTOM > canvas.height-edgeGap) {
          return true;
        };
      break;
      case this.DIRECTION.LEFT:
        if (myTankRect.X < edgeGap) {
          return true;
        };
      break;
    }
    return false;
  }

  SVSideAttackCollideWall(direction){
    if (this.gameLevel == 3) {
      let bWidth = PlayerControl.SV_BULLET_WH;
      let tWidth = PlayerControl.SV_TANK_WH;
      var myTankFireBulletRect = 0;
      switch(direction){
        case this.DIRECTION.UP:
          myTankFireBulletRect = this.SVGetStepRect(this.svMyTank.X+tWidth/2 - bWidth/2,0,bWidth,this.svMyTank.Y+tWidth/2);
        break;

        case this.DIRECTION.DOWN:
          myTankFireBulletRect = this.SVGetStepRect(this.svMyTank.X+tWidth/2 - bWidth/2,this.svMyTank.Y+tWidth/2,bWidth,screenY - this.svMyTank.Y);
        break;

        case this.DIRECTION.RIGHT:
          myTankFireBulletRect = this.SVGetStepRect(this.svMyTank.X+tWidth/2,this.svMyTank.Y+tWidth/2 - bWidth/2,screenX-(this.svMyTank.X+tWidth/2),bWidth);
        break;
        
        case this.DIRECTION.LEFT:
          myTankFireBulletRect = this.SVGetStepRect(0,this.svMyTank.Y+tWidth/2 - bWidth/2,this.svMyTank.X,bWidth);
        break;
      }
      if (myTankFireBulletRect == 0) {
        return false;
      };
            

      for (var i = 0; i < this.wallArray.length; i++) {
        let rect = this.wallArray[i];
        var result = PlayerControl.SVCheckCollide(rect,myTankFireBulletRect);
        if (result) {
          return true;
        };
      };
    }
    return false;
    
  }
  //对手发射了5没子弹。已经没有子弹可用了。返回剩余的步数。
  //优化点24. 对手已经发了5个子弹。剩下的时间可以无线靠近坦克了。并发射炮弹。
  SVOpponentVoidBullet(){
    if (this.opponentBullets.length!=5) {
      return 0;
    };
    var minDis = 0;
    for (var i = 0; i < this.opponentBullets.length; i++) {
      var b = this.opponentBullets[i];
      switch(b.direction){
        case this.DIRECTION.UP:
          if (b.Y < minDis || minDis == 0) {
            minDis = b.Y;
          };
        break;
        case this.DIRECTION.RIGHT:
          if (Math.abs(screenX - b.X) < minDis || minDis == 0) {
            minDis = Math.abs(screenX - b.X);
          };
        break;
        case this.DIRECTION.DOWN:
          if (Math.abs(screenY - b.Y) < minDis || minDis == 0) {
            minDis = Math.abs(screenY - b.Y);
          };
        break;
        case this.DIRECTION.LEFT:
          if (b.X < minDis || minDis == 0) {
            minDis = b.X;
          };
        break;
      }
    };
    return Math.floor(minDis/this.SV_BULLET_SPEED);
  }




})("B");