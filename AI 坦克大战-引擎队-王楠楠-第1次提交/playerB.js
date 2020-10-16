function Behaviac (object, context) {
  this.object = object;
  this.context = context;

  this.confirm_array = function (obj) {
    if (obj) {
      return obj;
    } else {
      return [];
    }
  }

  //bt:行为树描述
  this.run = function (bt) {
    var first_children = bt.children[0];
    //console.log("first::", first_children.type)
    this[first_children.type](first_children);
  };

  //Composite Node组

  //实现子节点或关系，按定义顺序遍历子节点，直到有一个子节点返回true时停止，并返回true。如果子节点全部返回false，则返回false。
  this.Selector = function (node) {
    var return_value = false;
    let childArray = this.confirm_array(node.children);
    for (var child in childArray) {
      var childValue = node.children[child];
      //console.log("Selecter  type:", childValue.type, childValue.func);
      //调用子节点
      if (this[childValue.type](childValue) == true) {
        //console.log("Selecter  type: true:", childValue.type, childValue.func);
        return_value = true;
        break;
      } else {
        //console.log("Selecter  type: false:", childValue.type, childValue.func);
      }
    }
    return return_value;
  }

  //类似Selector，不同之处在于，按照随机顺序遍历子节点。
  this.RandomSelector = function (node) {
    var return_value = false;
    let childArray = this.confirm_array(node.children);
    let recycle = [];
    while (childArray.length != recycle.length) {
      let value = Math.floor(Math.random() * childArray.length);
      if (recycle.indexOf(value) == -1) {
        recycle.push(value);
        var childValue = node.children[value];
        //console.log("RandomSelector  type:", childValue.type, childValue.func);
        //调用子节点
        if (this[childValue.type](childValue) == true) {
          //console.log("RandomSelector  type: true:", childValue.type, childValue.func);
          return_value = true;
          break;
        } else {
          //console.log("RandomSelector  type: false:", childValue.type, childValue.func);
        }
      }
    }
    return return_value;
  }

  //实现子节点与关系，按定义顺序遍历子节点，直到有一个节点返回false时停止，并返回false。如果子节点全部返回true，则返回true。
  this.Sequence = function (node) {
    var return_value = true;
    let childArray = this.confirm_array(node.children);
    for (var child in childArray) {
      var childValue = childArray[child];
      //console.log("Sequence type:", childValue.type, childValue.func);
      //调用子节点
      if (this[childValue.type](childValue) == false) {
        //console.log("Sequence type: false:", childValue.type, childValue.func);
        return_value = false;
        break;
      } else {
        //console.log("Sequence type: true:", childValue.type, childValue.func);
      }
    }
    return return_value;
  }

  this.RandomSequence = function (node) {
    var return_value = true;
    let childArray = this.confirm_array(node.children);
    let recycle = [];
    while (childArray.length != recycle.length) {
      let value = Math.floor(Math.random() * childArray.length);
      if (recycle.indexOf(value) == -1) {
        recycle.push(value);
        var childValue = node.children[value];
        //console.log("RandomSequence  type:", childValue.type, childValue.func);
        //调用子节点
        if (this[childValue.type](childValue) == false) {
          //console.log("RandomSequence type: false:", childValue.type, childValue.func);
          return_value = false;
          break;
        } else {
          //console.log("RandomSequence type: true:", childValue.type, childValue.func);
        }
      }
    }
    return return_value;
  }

  //Behaviour Node组

  //执行其中定义的行为，并返回true。
  this.Action = function (node) {
    var ret = this.object[node.func](this.context);
    if (typeof (ret) == "undefined") {
      return true;
    }
    return ret;
  }

  //返回条件判断。
  this.Condition = function (node) {
    if (this.object[node.func](this.context)) {
      return true;
    } else {
      return false;
    }
  }

  //Condition Node组

  //如果Filter为真，则执行子节点，并返回true；否则，不执行子节点，返回false。
  this.Filter = function (node) {
    //console.log("Filter:", node.func);
    if (this.object[node.func](this.context)) {
      var first_children = node.children[0];
      return this[first_children.type](first_children);//执行指定【类型】函数
    } else {
      return false;
    }
  }

  //Decorator Nodes组

  //将子节点的返回结果取反
  this.Inverter = function (node) {
    var first_children = node.children[0];
    if (this[first_children.type](first_children) == true) {
      //console.log("Inverter type: true[->false] ", first_children.type, first_children.func);
      return false;
    } else {
      //console.log("Inverter type: false[->true] ", first_children.type, first_children.func);
      return true;
    }
  }

  //忽视子节点的返回，强制返回true
  this.Succeeder = function (node) {
    var first_children = node.children[0];
    //console.log("Succeeder type:", first_children.type, first_children.func);
    this[first_children.type](first_children);
    return true;
  }

  //执行子节点知道返回失败为止
  this.RepeatUntilFail = function (node) {
    var first_children = node.children[0];
    while (true) {
      //console.log("RepeatUntilFail type:", first_children.type, first_children.func);
      if (this[first_children.type](first_children) == false) {
        break;
      }
    }
    return false;
  }
}

window.playerB = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type
    this.#moveEv = new CustomEvent('keydown')
    this.#fireEv = new CustomEvent('keydown')
    this.firetimestamp = new Date().valueOf()
    this.priority = this.#DIRECTION.STOP
  }
  land () {
    if (ametal.length == 0) {
      this.land_2()
    } else this.land_3()
  }
  land_3 () {
    // 当前的坦克实例
    var cur = undefined
    var enr = undefined
    aMyTankCount.forEach((element) => {
      var c = element
      if (c['id'] == 200) {
        cur = c
      }
      if (c['id'] == 100) {
        enr = c
      }
    })
    const currentTank = cur
    const enemyTank = enr
    if (!currentTank) return

    //下面是方便读取的全局数据的别名
    // 所有的地方坦克实例数组
    const enemyTanks = aTankCount
    // 所有的敌方子弹实例数组
    const enemyBullets = aBulletCount
    // 坦克的宽高
    const currentTankWH = 50
    // 子弹的宽高
    const bulletWH = 10
    // 坦克的x,y  ===> 坦克中心点
    const currentTankX = currentTank.X
    const currentTankY = currentTank.Y
    const currentTankDirect = currentTank.direction
    //我方子弹
    const myBullets = this.type === 'A' ? aMyBulletCount1 : aMyBulletCount2

    const eBullets = this.type === 'A' ? aMyBulletCount2 : aMyBulletCount1
    // 游戏限制的子弹数为5 = aMyBulletCount2
    const myBulletLimit = 5

    // 当前策略移动方向
    let moveDirection = undefined

    // 中央逃逸点
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const limitDis = 75 //极限距离，小于该距离必须朝最近方向躲避
    const SafeDis = 125 //在极限距离和安全距离间可以综合考虑后躲避

    var lateEnemy = undefined //距离最近的敌人
    var misDistanceOfEnemy = currentTankWH * 100
    var secruitydistance = currentTankWH * 6
    var secruitylevel = enemyTanks.length
    var firedirectdis = 4
    var escapedir = 4
    var fight = 6
    var escapenum = 0
    var TankCanAttack = {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
    }

    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemy.X,
        enemy.Y
      )
      if (misDistanceOfEnemy > dis) {
        misDistanceOfEnemy = dis
        lateEnemy = enemy
      }
    }
    if (undefined != enemyTank) {
      const enemydis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemyTank.X,
        enemyTank.Y
      )
      if (enemydis < misDistanceOfEnemy) {
        lateEnemy = enemyTank
        firedirectdis = 1
        escapedir = 1
        fight = 3
      }
    }
    // 躲AI子弹
    let arrayBullets = aBulletCount.concat(eBullets)
    arrayBullets = arrayBullets.concat(aTankCount)
    var Bullets_is_close = new Array() //子弹是否远离坦克
    var Bullets_col_dis = new Array() //碰撞距离（用来判断子弹是否会碰上坦克）
    var Bullets_dis = new Array() //子弹运动方向和坦克的距离（判断威胁程度）
    this.#calcBulletDistance(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis
    )

    moveDirection = this.#avoidBullet_3(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      limitDis,
      SafeDis,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis,
      lateEnemy,
      currentTankDirect
    )

    /*moveDirection = this.#avoidBulletBt(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      limitDis,
      SafeDis,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis,
      lateEnemy,
      currentTankDirect
    )*/

    var c = new Date().valueOf()
    if (c - this.firetimestamp > 250) {
      this.firetimestamp = c
      this.#fire()
      document.onkeyup(this.#fireEv)
    }
    this.#move(moveDirection)
    if (undefined != moveDirection) {
      console.log(moveDirection)
    }
    this.#setName()
  }

  leave () {
    this.#setName()
    document.onkeyup(this.#moveEv)
    document.onkeyup(this.#fireEv)
  }
  type
  // private
  // 方向的别名
  #DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    STOP: 4,
    UP_OR_DOWN: 5,
    RIGHT_OR_LEFT: 6,
  }
  // 开火事件
  #fireEv
  // 移动事件
  #moveEv

  #calcTwoPointDistance (ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2))
  }
  #collision (
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
    )
  }
  #PlayercheckCollide (A, B, C, D, E, F, G, H) {
    C += A //算出矩形1右下角横坐标
    D += B //算出矩形1右下角纵坐标
    G += E //算出矩形2右下角横纵标
    H += F //算出矩形2右下角纵坐标
    if (C <= E || G <= A || D <= F || H <= B) {
      //两个图形没有相交
      return false
    }
    return true
  }
  //初始化子弹信息数组
  #calcBulletDistance (
    arrayBullets,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    Bullets_is_close,
    Bullets_col_dis,
    Bullets_dis
  ) {
    const centerTankX = currentTankX + currentTankWH / 2
    const centerTankY = currentTankY + currentTankWH / 2
    for (var i = 0; i < arrayBullets.length; i++) {
      var Bullet = arrayBullets[i]
      switch (Bullet.direction) {
        case this.#DIRECTION.UP:
          Bullets_col_dis[i] = Bullet.X - centerTankX
          Bullets_dis[i] = Bullet.Y - centerTankY
          Bullets_is_close[i] = Bullets_dis[i] > 0 ? true : false
          break
        case this.#DIRECTION.DOWN:
          Bullets_col_dis[i] = Bullet.X - centerTankX
          Bullets_dis[i] = Bullet.Y - centerTankY
          Bullets_is_close[i] = Bullets_dis[i] > 0 ? false : true
          break
        case this.#DIRECTION.RIGHT:
          Bullets_col_dis[i] = Bullet.Y - centerTankY
          Bullets_dis[i] = Bullet.X - centerTankX
          Bullets_is_close[i] = Bullets_dis[i] > 0 ? false : true
          break
        case this.#DIRECTION.LEFT:
          Bullets_col_dis[i] = Bullet.Y - centerTankY
          Bullets_dis[i] = Bullet.X - centerTankX
          Bullets_is_close[i] = Bullets_dis[i] > 0 ? true : false
          break
      }
    }
  }

  #avoidBulletBt (
    arrayBullets,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    limitDis,
    SafeDis,
    Bullets_is_close,
    Bullets_col_dis,
    Bullets_dis,
    lateEnemy,
    currentTankDirect
  ) {
    const centerTankX = currentTankX + currentTankWH / 2
    const centerTankY = currentTankY + currentTankWH / 2
    const col_dis = currentTankWH / 2 + bulletWH / 2
    //var bt_desc = { "autolayout": true, "title": "avoidBullet", "fileversioncreate": "01.04", "nodes": [{ "sleep": false, "indexchild": 1, "func": "", "textwidth": 28, "levelindex": 1, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 96, "levelindex": 2, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 76, "levelindex": 3, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 75, "levelindex": 4, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CanLoopBullet", "textwidth": 84, "levelindex": 5, "selected": false, "valid": true, "type": "Condition", "id": "node3", "width": 152, "y": 384, "x": -497.54084045493, "name": "CheckBulletLoop", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 100, "levelindex": 6, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletFaraway", "textwidth": 80, "levelindex": 7, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "DoEmpty", "textwidth": 50, "levelindex": 8, "selected": false, "valid": true, "type": "Action", "id": "node7", "width": 78, "y": 576, "x": -174.54084045494, "name": "Empty", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node6", "width": 108, "y": 480, "x": -189.54084045494, "name": "Faraway", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "IsBulletInLimitDistance", "textwidth": 113, "levelindex": 9, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 51, "levelindex": 10, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CalculatorShortestDirection", "textwidth": 137, "levelindex": 11, "selected": false, "valid": true, "type": "Action", "id": "node9", "width": 165, "y": 672, "x": -87.790840454937, "name": "LimitDistanceCalculator", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SettingLimitDirection", "textwidth": 105, "levelindex": 12, "selected": false, "valid": true, "type": "Action", "id": "node11", "width": 133, "y": 672, "x": 138.70915954507, "name": "SettingLimitDirection", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Sequence", "id": "node10", "width": 79, "y": 576, "x": 52.459159545066, "name": "LimitSeq", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node8", "width": 141, "y": 480, "x": 21.459159545066, "name": "InLimitDisatance", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "IsBulletInSafeDistance", "textwidth": 112, "levelindex": 13, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CalculatorCloset", "textwidth": 83, "levelindex": 14, "selected": false, "valid": true, "type": "Action", "id": "node13", "width": 111, "y": 576, "x": 213.95915954507, "name": "CalcultaorCloset", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node12", "width": 140, "y": 480, "x": 199.45915954507, "name": "InSafeDistance", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 4, "sim": "", "func": "", "textwidth": 88, "levelindex": 15, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 112, "levelindex": 16, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletDamaged", "textwidth": 108, "levelindex": 17, "selected": false, "valid": true, "type": "Condition", "id": "node16", "width": 176, "y": 672, "x": 367.45915954507, "name": "CheckBulletDamaged", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "CalculatorShortestDirection", "textwidth": 137, "levelindex": 18, "selected": false, "valid": true, "type": "Action", "id": "node17", "width": 165, "y": 672, "x": 596.45915954507, "name": "CalcultaorDirection", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "CalculatorDanByDirection", "textwidth": 128, "levelindex": 19, "selected": false, "valid": true, "type": "Action", "id": "node18", "width": 156, "y": 672, "x": 814.76377738922, "name": "CalculatorDan", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Sequence", "id": "node14", "width": 140, "y": 576, "x": 599.11146846714, "name": "OtherBullectCheckSeq", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Succeeder", "id": "node15", "width": 116, "y": 480, "x": 611.11146846714, "name": "OtherBulletCheck", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Selector", "id": "node4", "width": 128, "y": 384, "x": 204.7853140061, "name": "BulletCheckSelector", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "NextLoopBullet", "textwidth": 78, "levelindex": 20, "level": 5, "valid": true, "type": "Action", "id": "node40", "width": 106, "y": 384, "x": 371.0353140061, "name": "NextLoopBullet", "height": 50, "textlines": 3, "selected": true }], "valid": true, "type": "Sequence", "id": "node5", "width": 103, "y": 288, "x": -75.752763224413, "name": "BuilletLoopSeq", "textlines": 3, "height": 50, "level": 4 }], "valid": true, "type": "RepeatUntilFail", "id": "node2", "width": 104, "y": 192, "x": -76.252763224413, "name": "BulletLoop", "textlines": 3, "height": 50, "level": 3 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 75, "levelindex": 21, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletLimitDirect", "textwidth": 91, "levelindex": 22, "selected": false, "valid": true, "type": "Condition", "id": "node20", "width": 159, "y": 288, "x": 752.79770121173, "name": "IsLimitDirect", "textlines": 3, "height": 50, "level": 4 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 96, "levelindex": 23, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 122, "levelindex": 24, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 25, "selected": false, "valid": true, "type": "Condition", "id": "node23", "width": 172, "y": 480, "x": 879.59573584326, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 54, "levelindex": 26, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 136, "levelindex": 27, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 96, "levelindex": 28, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsSetColDis", "textwidth": 59, "levelindex": 29, "selected": false, "valid": true, "type": "Condition", "id": "node29", "width": 127, "y": 768, "x": 890.11591158102, "name": "IsSetColDis", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SetMoveDirectionByColDis", "textwidth": 134, "levelindex": 30, "selected": false, "valid": true, "type": "Action", "id": "node35", "width": 162, "y": 768, "x": 1059.3451957201, "name": "SetMoveDirectionByColDis", "textlines": 3, "height": 50, "level": 9 }], "valid": true, "type": "Sequence", "id": "node31", "width": 124, "y": 672, "x": 993.73055365056, "name": "CloseSetCheckSeq", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 83, "levelindex": 31, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 42, "levelindex": 32, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsSetColDis", "textwidth": 59, "levelindex": 33, "selected": false, "valid": true, "type": "Condition", "id": "node34", "width": 127, "y": 864, "x": 1216.4916602095, "name": "IsSetColDis", "textlines": 3, "height": 50, "level": 10 }], "valid": true, "type": "Inverter", "id": "node33", "width": 70, "y": 768, "x": 1244.9916602095, "name": "Inverter", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "CalculatorBoundaryDan", "textwidth": 119, "levelindex": 34, "selected": false, "valid": true, "type": "Action", "id": "node36", "width": 147, "y": 768, "x": 1335.1415761358, "name": "CalculatorBoundaryDan", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "SetMoveDirectionByMaxDan", "textwidth": 144, "levelindex": 35, "selected": false, "valid": true, "type": "Action", "id": "node37", "width": 172, "y": 768, "x": 1500.8615929505, "name": "SetMoveDirectionByMaxDan", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 4, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 36, "selected": false, "valid": true, "type": "Condition", "id": "node38", "width": 172, "y": 768, "x": 1722.1115929505, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 5, "sim": "", "func": "DoGogogo", "textwidth": 55, "levelindex": 37, "selected": false, "valid": true, "type": "Action", "id": "node39", "width": 83, "y": 768, "x": 1987.6115929505, "name": "DoGogogo", "textlines": 3, "height": 50, "level": 9 }], "valid": true, "type": "Sequence", "id": "node32", "width": 111, "y": 672, "x": 1602.30162658, "name": "ClosetCheckSeq", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Selector", "id": "node27", "width": 164, "y": 576, "x": 1271.5160901153, "name": "MoveDirectionStopSelector", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Succeeder", "id": "node30", "width": 82, "y": 480, "x": 1312.5160901153, "name": "Succeeder", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Sequence", "id": "node21", "width": 150, "y": 384, "x": 1062.0559129793, "name": "MoveDirectionCheckSeq", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 122, "levelindex": 38, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 42, "levelindex": 39, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 40, "selected": false, "valid": true, "type": "Condition", "id": "node26", "width": 172, "y": 576, "x": 1483.9632791816, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Inverter", "id": "node25", "width": 70, "y": 480, "x": 1534.9632791816, "name": "Inverter", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SetMoveDirectionByDan", "textwidth": 123, "levelindex": 41, "selected": false, "valid": true, "type": "Action", "id": "node28", "width": 151, "y": 480, "x": 1620.0061958082, "name": "SetMoveDirectionByDan", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Sequence", "id": "node24", "width": 150, "y": 384, "x": 1577.9847374949, "name": "MoveDirectionCheckSeq", "textlines": 3, "height": 50, "level": 5 }], "valid": true, "type": "Selector", "id": "node22", "width": 124, "y": 288, "x": 1333.0203252371, "name": "LimitDirectSelector", "textlines": 3, "height": 50, "level": 4 }], "valid": true, "type": "Sequence", "id": "node19", "width": 103, "y": 192, "x": 1053.2527632244, "name": "LimitDirectSeq", "textlines": 3, "height": 50, "level": 3 }], "valid": true, "type": "Selector", "id": "node1", "width": 124, "y": 96, "x": 478, "name": "avoidBulletSelector", "textlines": 3, "height": 50, "level": 2 }], "valid": true, "type": "Start", "id": "__start__", "width": 56, "y": 0, "x": 512, "name": "", "textlines": 3, "height": 50, "level": 1 }], "fileversionsave": "01.04", "notes": "" }
    var bt_desc = { "autolayout": true, "title": "avoidBullet", "fileversioncreate": "01.04", "nodes": [{ "sleep": false, "indexchild": 1, "func": "", "textwidth": 28, "levelindex": 1, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 96, "levelindex": 2, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 76, "levelindex": 3, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 75, "levelindex": 4, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CanLoopBullet", "textwidth": 84, "levelindex": 5, "selected": false, "valid": true, "type": "Condition", "id": "node3", "width": 152, "y": 384, "x": -501.27959612014, "name": "CheckBulletLoop", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 100, "levelindex": 6, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletFaraway", "textwidth": 80, "levelindex": 7, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "DoEmpty", "textwidth": 50, "levelindex": 8, "selected": false, "valid": true, "type": "Action", "id": "node7", "width": 78, "y": 576, "x": -178.27959612015, "name": "Empty", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node6", "width": 108, "y": 480, "x": -193.27959612015, "name": "Faraway", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "IsBulletInLimitDistance", "textwidth": 113, "levelindex": 9, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 51, "levelindex": 10, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CalculatorShortestDirection", "textwidth": 137, "levelindex": 11, "selected": false, "valid": true, "type": "Action", "id": "node9", "width": 165, "y": 672, "x": -91.529596120145, "name": "LimitDistanceCalculator", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SettingLimitDirection", "textwidth": 105, "levelindex": 12, "selected": false, "valid": true, "type": "Action", "id": "node11", "width": 133, "y": 672, "x": 134.97040387986, "name": "SettingLimitDirection", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Sequence", "id": "node10", "width": 79, "y": 576, "x": 48.720403879859, "name": "LimitSeq", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node8", "width": 141, "y": 480, "x": 17.720403879859, "name": "InLimitDisatance", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "IsBulletInSafeDistance", "textwidth": 112, "levelindex": 13, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "CalculatorCloset", "textwidth": 83, "levelindex": 14, "selected": false, "valid": true, "type": "Action", "id": "node13", "width": 111, "y": 576, "x": 210.22040387986, "name": "CalcultaorCloset", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Filter", "id": "node12", "width": 140, "y": 480, "x": 195.72040387986, "name": "InSafeDistance", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 4, "sim": "", "func": "", "textwidth": 88, "levelindex": 15, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 112, "levelindex": 16, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletDamaged", "textwidth": 108, "levelindex": 17, "selected": false, "valid": true, "type": "Condition", "id": "node16", "width": 176, "y": 672, "x": 280.25392876291, "name": "CheckBulletDamaged", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "CalculatorShortestDirection", "textwidth": 137, "levelindex": 18, "selected": false, "valid": true, "type": "Action", "id": "node17", "width": 165, "y": 672, "x": 557.91504549617, "name": "CalcultaorDirection", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "CalculatorDanByDirection", "textwidth": 128, "levelindex": 19, "selected": false, "valid": true, "type": "Action", "id": "node18", "width": 156, "y": 672, "x": 739.820129585, "name": "CalculatorDan", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Sequence", "id": "node14", "width": 140, "y": 576, "x": 518.03702917396, "name": "OtherBullectCheckSeq", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Succeeder", "id": "node15", "width": 116, "y": 480, "x": 530.03702917396, "name": "OtherBulletCheck", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Selector", "id": "node4", "width": 128, "y": 384, "x": 162.3787165269, "name": "BulletCheckSelector", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "NextLoopBullet", "textwidth": 78, "levelindex": 20, "selected": false, "valid": true, "type": "Action", "id": "node40", "width": 106, "y": 384, "x": 367.29655834089, "name": "NextLoopBullet", "textlines": 3, "height": 50, "level": 5 }], "valid": true, "type": "Sequence", "id": "node5", "width": 103, "y": 288, "x": -65.491518889623, "name": "BuilletLoopSeq", "textlines": 3, "height": 50, "level": 4 }], "valid": true, "type": "RepeatUntilFail", "id": "node2", "width": 104, "y": 192, "x": -65.991518889623, "name": "BulletLoop", "textlines": 3, "height": 50, "level": 3 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 75, "levelindex": 21, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsBulletLimitDirect", "textwidth": 91, "levelindex": 22, "selected": false, "valid": true, "type": "Condition", "id": "node20", "width": 159, "y": 288, "x": 749.05894554652, "name": "IsLimitDirect", "textlines": 3, "height": 50, "level": 4 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 75, "levelindex": 23, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 54, "levelindex": 24, "selected": true, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 122, "levelindex": 25, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 26, "selected": false, "valid": true, "type": "Condition", "id": "node23", "width": 172, "y": 576, "x": 931.34221313104, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 7 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 136, "levelindex": 27, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 96, "levelindex": 28, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsSetColDis", "textwidth": 59, "levelindex": 29, "selected": false, "valid": true, "type": "Condition", "id": "node29", "width": 127, "y": 768, "x": 913.73290428127, "name": "IsSetColDis", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SetMoveDirectionByColDis", "textwidth": 134, "levelindex": 30, "selected": false, "valid": true, "type": "Action", "id": "node35", "width": 162, "y": 768, "x": 1061.4267761776, "name": "SetMoveDirectionByColDis", "textlines": 3, "height": 50, "level": 9 }], "valid": true, "type": "Sequence", "id": "node31", "width": 124, "y": 672, "x": 1006.5798402294, "name": "CloseSetCheckSeq", "textlines": 3, "height": 50, "level": 8 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 83, "levelindex": 31, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 42, "levelindex": 32, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsSetColDis", "textwidth": 59, "levelindex": 33, "selected": false, "valid": true, "type": "Condition", "id": "node34", "width": 127, "y": 864, "x": 1212.7529045443, "name": "IsSetColDis", "textlines": 3, "height": 50, "level": 10 }], "valid": true, "type": "Inverter", "id": "node33", "width": 70, "y": 768, "x": 1241.2529045443, "name": "Inverter", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "CalculatorBoundaryDan", "textwidth": 119, "levelindex": 34, "selected": false, "valid": true, "type": "Action", "id": "node36", "width": 147, "y": 768, "x": 1367.9840111708, "name": "CalculatorBoundaryDan", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 3, "sim": "", "func": "SetMoveDirectionByMaxDan", "textwidth": 144, "levelindex": 35, "selected": false, "valid": true, "type": "Action", "id": "node37", "width": 172, "y": 768, "x": 1535.465880483, "name": "SetMoveDirectionByMaxDan", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 4, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 36, "selected": false, "valid": true, "type": "Condition", "id": "node38", "width": 172, "y": 768, "x": 1718.3728372853, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 9 }, { "sleep": false, "indexchild": 5, "sim": "", "func": "DoGogogo", "textwidth": 55, "levelindex": 37, "selected": false, "valid": true, "type": "Action", "id": "node39", "width": 83, "y": 768, "x": 1983.8728372853, "name": "DoGogogo", "textlines": 3, "height": 50, "level": 9 }], "valid": true, "type": "Sequence", "id": "node32", "width": 111, "y": 672, "x": 1598.5628709148, "name": "ClosetCheckSeq", "textlines": 3, "height": 50, "level": 8 }], "valid": true, "type": "Selector", "id": "node27", "width": 164, "y": 576, "x": 1276.0713555721, "name": "MoveDirectionStopSelector", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Sequence", "id": "node21", "width": 150, "y": 480, "x": 1110.7067843516, "name": "MoveDirectionCheckSeq", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Succeeder", "id": "node30", "width": 82, "y": 384, "x": 1144.7067843516, "name": "Succeeder", "textlines": 3, "height": 50, "level": 5 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "", "textwidth": 122, "levelindex": 38, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "", "textwidth": 42, "levelindex": 39, "selected": false, "children": [{ "sleep": false, "indexchild": 1, "sim": "", "func": "IsMoveDirectionStop", "textwidth": 104, "levelindex": 40, "selected": false, "valid": true, "type": "Condition", "id": "node26", "width": 172, "y": 576, "x": 1488.0606256386, "name": "IsMoveDirectionStop", "textlines": 3, "height": 50, "level": 7 }], "valid": true, "type": "Inverter", "id": "node25", "width": 70, "y": 480, "x": 1539.0606256386, "name": "Inverter", "textlines": 3, "height": 50, "level": 6 }, { "sleep": false, "indexchild": 2, "sim": "", "func": "SetMoveDirectionByDan", "textwidth": 123, "levelindex": 41, "selected": false, "valid": true, "type": "Action", "id": "node28", "width": 151, "y": 480, "x": 1628.415285441, "name": "SetMoveDirectionByDan", "textlines": 3, "height": 50, "level": 6 }], "valid": true, "type": "Sequence", "id": "node24", "width": 150, "y": 384, "x": 1584.2379555398, "name": "MoveDirectionCheckSeq", "textlines": 3, "height": 50, "level": 5 }], "valid": true, "type": "Sequence", "id": "node22", "width": 103, "y": 288, "x": 1383.5046369556, "name": "LimitDirectSeq", "textlines": 3, "height": 50, "level": 4 }], "valid": true, "type": "Sequence", "id": "node19", "width": 103, "y": 192, "x": 1062.8450735663, "name": "LimitDirectSeq", "textlines": 3, "height": 50, "level": 3 }], "valid": true, "type": "Selector", "id": "node1", "width": 124, "y": 96, "x": 478, "name": "avoidBulletSelector", "textlines": 3, "height": 50, "level": 2 }], "valid": true, "type": "Start", "id": "__start__", "width": 56, "y": 0, "x": 512, "name": "", "textlines": 3, "height": 50, "level": 1 }], "fileversionsave": "01.04", "notes": "" }
    var bt_realize = {
      limitDirect: 0,//是否按最短路径躲避
      moveDirection: this.#DIRECTION.STOP, // 躲避方向
      closetColUDDis: 10000,
      closetColRLDis: 10000,
      Dan: {
        UP: 0,
        RIGHT: 0,
        DOWN: 0,
        LEFT: 0,
      },
      bulletPos: 0,
      //BT里注册的函数列表
      DoEmpty: function (context) { },
      CanLoopBullet: function (context) { return this.bulletPos < arrayBullets.length },
      NextLoopBullet: function (context) { this.bulletPos++; },
      IsBulletFaraway: function (context) {
        return (
          !Bullets_is_close[this.bulletPos] &&
          (Math.abs(Bullets_col_dis[this.bulletPos]) > col_dis + 7 ||
            Math.abs(Bullets_dis[this.bulletPos]) > col_dis)
        )
      },
      IsBulletInLimitDistance: function (context) {
        return (
          Bullets_is_close[this.bulletPos] &&
          Math.abs(Bullets_col_dis[this.bulletPos]) <= col_dis &&
          Math.abs(Bullets_dis[this.bulletPos]) <= limitDis
        )
      },
      IsBulletInSafeDistance: function (context) {
        return (
          Bullets_is_close[this.bulletPos] &&
          Math.abs(Bullets_col_dis[this.bulletPos]) <= col_dis &&
          Math.abs(Bullets_dis[this.bulletPos]) > limitDis &&
          Math.abs(Bullets_dis[this.bulletPos]) <= SafeDis
        )
      },
      IsBulletDamaged: function (context) {
        var dis = Math.sqrt(
          Math.pow(Bullets_dis[this.bulletPos], 2) + Math.pow(Bullets_col_dis[this.bulletPos], 2)
        )
        if (dis < 177) {
          return true
        }
        return false
      },
      IsBulletLimitDirect: function (context) {
        return (this.limitDirect != 1)
      },
      IsMoveDirectionStop: function (context) {
        return (this.moveDirection == context.#DIRECTION.STOP)
      },
      IsSetColDis: function (context) {
        return (!(this.closetColRLDis == 10000 && this.closetColUDDis == 10000))
      },
      CalculatorShortestDirection: function (context) {
        this.moveDirection = context.#getShortestDirecton_3(
          arrayBullets[this.bulletPos].direction,
          Bullets_is_close[this.bulletPos],
          Bullets_col_dis[this.bulletPos],
          Bullets_dis[this.bulletPos]
        )
      },
      SettingLimitDirection: function (context) {
        console.log('buxingle')
        if (this.moveDirection <= 4) this.limitDirect = 1
      },
      CalculatorCloset: function (context) {
        switch (arrayBullets[this.bulletPos].direction) {
          case context.#DIRECTION.UP:
          case context.#DIRECTION.DOWN:
            this.closetColUDDis =
              Math.abs(Bullets_dis[this.bulletPos]) < this.closetColUDDis
                ? Math.abs(Bullets_dis[this.bulletPos])
                : this.closetColUDDis
            break
          case context.#DIRECTION.LEFT:
          case context.#DIRECTION.RIGHT:
            this.closetColRLDis =
              Math.abs(Bullets_dis[this.bulletPos]) < this.closetColRLDis
                ? Math.abs(Bullets_dis[this.bulletPos])
                : this.closetColRLDis
            break
        }
      },
      CalculatorDanByDirection: function (context) {
        var dis = Math.sqrt(
          Math.pow(Bullets_dis[this.bulletPos], 2) + Math.pow(Bullets_col_dis[this.bulletPos], 2)
        )
        var weight = Math.cos(((dis / 177) * Math.PI) / 2)
        switch (this.moveDirection) {
          case context.#DIRECTION.UP:
            this.Dan.UP += weight
            break
          case context.#DIRECTION.DOWN:
            this.Dan.DOWN += weight
            break
          case context.#DIRECTION.LEFT:
            this.Dan.LEFT += weight
            break
          case context.#DIRECTION.RIGHT:
            this.Dan.RIGHT += weight
            break
        }
        this.moveDirection = context.#DIRECTION.STOP;
      },
      CalculatorBoundaryDan: function (context) {
        context.#isNearBoundaryDan_3(
          centerTankX,
          centerTankY,
          currentTankWH,
          this.Dan,
          10
        )
      },
      SetMoveDirectionByDan: function (context) {
        if (this.moveDirection == context.#DIRECTION.UP_OR_DOWN) {
          this.moveDirection =
            this.Dan.UP >= this.Dan.DOWN ? context.#DIRECTION.UP : context.#DIRECTION.DOWN
        } else if (this.moveDirection == context.#DIRECTION.RIGHT_OR_LEFT) {
          this.moveDirection =
            this.Dan.RIGHT >= this.Dan.LEFT ? context.#DIRECTION.RIGHT : context.#DIRECTION.LEFT
        }
      },
      SetMoveDirectionByColDis: function (context) {
        if (this.closetColRLDis <= this.closetColUDDis) {
          this.moveDirection = context.#DIRECTION.UP_OR_DOWN
        } else this.moveDirection = context.#DIRECTION.RIGHT_OR_LEFT
      },
      SetMoveDirectionByMaxDan: function (context) {
        this.moveDirection = context.#getMaxDan_3(this.Dan)
      },
      DoGogogo: function (context) {
        this.moveDirection = context.#gogogo_3(
          lateEnemy,
          currentTankX,
          currentTankY,
          currentTankWH,
          bulletWH,
          currentTankDirect
        )
        console.log('进攻')
      }
    }
    var BT = new Behaviac(bt_realize, this)
    BT.run(bt_desc.nodes[0])
    return bt_realize.moveDirection
  }

  //计算躲避子弹要移动的方向
  #avoidBullet_3 (
    arrayBullets,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    limitDis,
    SafeDis,
    Bullets_is_close,
    Bullets_col_dis,
    Bullets_dis,
    lateEnemy,
    currentTankDirect
  ) {
    const centerTankX = currentTankX + currentTankWH / 2
    const centerTankY = currentTankY + currentTankWH / 2
    const col_dis = currentTankWH / 2 + bulletWH / 2
    var limitDirect = 0 //是否按最短路径躲避
    var moveDirection = this.#DIRECTION.STOP // 躲避方向
    var closetColUDDis = 10000
    var closetColRLDis = 10000
    //往各个方向躲避的系数
    var Dan = {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
    }
    for (var i = 0; i < arrayBullets.length; i++) {
      const Bullet = arrayBullets[i]
      if (
        !Bullets_is_close[i] &&
        (Math.abs(Bullets_col_dis[i]) > col_dis + 7 ||
          Math.abs(Bullets_dis[i]) > col_dis)
      )
        //如果子弹是远离的并且在下一个阶段不可能产生碰撞则不考虑
        continue
      else if (
        Bullets_is_close[i] &&
        Math.abs(Bullets_col_dis[i]) <= col_dis &&
        Math.abs(Bullets_dis[i]) <= limitDis
      ) {
        //如果即将碰撞的子弹直线距离在极限距离以内，则按照最短路径方向躲避
        moveDirection = this.#getShortestDirecton_3(
          Bullet.direction,
          Bullets_is_close[i],
          Bullets_col_dis[i],
          Bullets_dis[i]
        )
        console.log('buxingle')
        if (moveDirection <= 4) limitDirect = 1
      } else if (
        Bullets_is_close[i] &&
        Math.abs(Bullets_col_dis[i]) <= col_dis &&
        Math.abs(Bullets_dis[i]) > limitDis &&
        Math.abs(Bullets_dis[i]) <= SafeDis
      ) {
        //计算在安全距离内会发生碰撞的最近的子弹
        switch (Bullet.direction) {
          case this.#DIRECTION.UP:
          case this.#DIRECTION.DOWN:
            closetColUDDis =
              Math.abs(Bullets_dis[i]) < closetColUDDis
                ? Math.abs(Bullets_dis[i])
                : closetColUDDis
            break
          case this.#DIRECTION.LEFT:
          case this.#DIRECTION.RIGHT:
            closetColRLDis =
              Math.abs(Bullets_dis[i]) < closetColRLDis
                ? Math.abs(Bullets_dis[i])
                : closetColRLDis
            break
        }
      } else {
        //计算不会碰上但是有威胁的
        var dis = Math.sqrt(
          Math.pow(Bullets_dis[i], 2) + Math.pow(Bullets_col_dis[i], 2)
        )
        if (dis < 177) {
          const direction = this.#getShortestDirecton_3(
            Bullet.direction,
            Bullets_is_close[i],
            Bullets_col_dis[i],
            Bullets_dis[i]
          )
          var weight = Math.cos(((dis / 177) * Math.PI) / 2)
          switch (direction) {
            case this.#DIRECTION.UP:
              Dan.UP += weight
              break
            case this.#DIRECTION.DOWN:
              Dan.DOWN += weight
              break
            case this.#DIRECTION.LEFT:
              Dan.LEFT += weight
              break
            case this.#DIRECTION.RIGHT:
              Dan.RIGHT += weight
              break
          }
        }
      }
    }
    if (limitDirect != 1) {
      if (moveDirection == this.#DIRECTION.STOP) {
        if (!(closetColRLDis == 10000 && closetColUDDis == 10000)) {
          if (closetColRLDis <= closetColUDDis) {
            moveDirection = this.#DIRECTION.UP_OR_DOWN
          } else moveDirection = this.#DIRECTION.RIGHT_OR_LEFT
        } else {
          //如果没有碰撞的可能则按照威胁程度进行躲避
          this.#isNearBoundaryDan_3(
            centerTankX,
            centerTankY,
            currentTankWH,
            Dan,
            10
          )
          moveDirection = this.#getMaxDan_3(Dan)
          if (moveDirection == this.#DIRECTION.STOP) {
            //如果没有威胁则进攻
            moveDirection = this.#gogogo_3(
              lateEnemy,
              currentTankX,
              currentTankY,
              currentTankWH,
              bulletWH,
              currentTankDirect,
              177
            )
            if (moveDirection == this.#DIRECTION.STOP) {
              var TempDirection = this.#sacnTank_3(lateEnemy,
                currentTankX,
                currentTankY,
                currentTankWH,
                bulletWH)
              if (currentTankDirect != TempDirection) {
                moveDirection = TempDirection
              }
            }
            console.log('进攻')
          }
        }
      }
      if (moveDirection != this.#DIRECTION.STOP) {
        if (moveDirection == this.#DIRECTION.UP_OR_DOWN) {
          moveDirection =
            Dan.UP >= Dan.DOWN ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
        } else if (moveDirection == this.#DIRECTION.RIGHT_OR_LEFT) {
          moveDirection =
            Dan.RIGHT >= Dan.LEFT ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
        }
      }
    }
    return moveDirection
  }
  // 根据玩家返回正确的方向keyCode
  #helpDirectionKeyCode (direction) {
    switch (direction) {
      case this.#DIRECTION.UP:
        return this.type === 'A' ? 87 : 38
      case this.#DIRECTION.DOWN:
        return this.type === 'A' ? 83 : 40
      case this.#DIRECTION.LEFT:
        return this.type === 'A' ? 65 : 37
      case this.#DIRECTION.RIGHT:
        return this.type === 'A' ? 68 : 39
    }
  }
  // 设置队伍
  #setName () {
    document.getElementById(
      `Player${this.type === 'A' ? 1 : 2}barName`
    ).value = `引擎队`
    document.getElementById(
      `Player${this.type === 'A' ? 1 : 2}Name`
    ).textContent = `引擎队`
  }
  // 控制移动   举例子：  向左移动： this.#move(this.#DIRECTION.LEFT)
  #move (direction) {
    if (typeof direction === undefined) return
    this.#moveEv.keyCode = this.#helpDirectionKeyCode(direction)
    document.onkeydown(this.#moveEv)
  }
  // 开火
  #fire (direction) {
    this.#fireEv.keyCode = this.type === 'A' ? 32 : 8
    document.onkeydown(this.#fireEv)
  }
  // TODO： 扫描轨道   预判走位  并给出开火和移动方向
  // 判断是否快到边界了
  #isNearBoundary (X = 0, Y = 0, currentDirection = undefined, currentTankWH) {
    if (currentDirection !== undefined) {
      if (
        currentDirection === this.#DIRECTION.DOWN &&
        Y + currentTankWH > screenY
      ) {
        return true
      } else if (currentDirection === this.#DIRECTION.UP && Y < currentTankWH) {
        return true
      } else if (
        currentDirection === this.#DIRECTION.LEFT &&
        X < currentTankWH
      ) {
        return true
      } else
        return (
          currentDirection === this.#DIRECTION.RIGHT &&
          X + currentTankWH > screenX
        )
    }

    return (
      this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
      this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
    )
  }
  #isNearBoundaryDan_3 (X, Y, currentTankWH, Dan, n) {
    const DisUP = screenY - Y
    const DisDOWN = Y
    const DisLEFT = screenX - X
    const DisRIGHT = X
    Dan.UP +=
      DisUP < screenY / n ? Math.cos(((DisUP / screenY) * n * Math.PI) / 2) : 0
    Dan.DOWN +=
      DisDOWN < screenY / n
        ? Math.cos(((DisDOWN / screenY) * n * Math.PI) / 2)
        : 0
    Dan.LEFT +=
      DisLEFT < screenX / n
        ? Math.cos(((DisLEFT / screenX) * n * Math.PI) / 2)
        : 0
    Dan.RIGHT +=
      DisRIGHT < screenX / n
        ? Math.cos(((DisRIGHT / screenX) * n * Math.PI) / 2)
        : 0
  }
  #collisionMetal_3 (x, y, r, direction) {
    //障碍阻挡
    switch (direction) {
      case this.#DIRECTION.UP:
        y -= 7
        break
      case this.#DIRECTION.DOWN:
        y += 7
        break
      case this.#DIRECTION.LEFT:
        x += 7
        break
      case this.#DIRECTION.RIGHT:
        x -= 7
        break
    }
    const metal = ametal
    if (undefined != metal) {
      for (var i = 0; i < metal.length; i++) {
        if (
          x > metal[i][0] - r &&
          x < metal[i][0] + metal[i][2] &&
          y > metal[i][1] - r &&
          y < metal[i][1] + metal[i][3]
        ) {
          return true
        }
      }
    }
    return false
  }
  #fan (direction) {
    switch (direction) {
      case this.#DIRECTION.UP:
        return this.#DIRECTION.DOWN

      case this.#DIRECTION.DOWN:
        return this.#DIRECTION.UP

      case this.#DIRECTION.LEFT:
        return this.#DIRECTION.RIGHT

      case this.#DIRECTION.RIGHT:
        return this.#DIRECTION.LEFT

    }
  }
  #getShortestDirecton_3 (
    direction,
    is_close,
    col_dis,
    dis
  ) {
    //获取要躲避子弹i的最短路径方向    
    switch (direction) {
      case this.#DIRECTION.UP:
      case this.#DIRECTION.DOWN:
        if (col_dis < 0) return this.#DIRECTION.RIGHT
        else if (col_dis > 0) return this.#DIRECTION.LEFT
        else return this.#DIRECTION.RIGHT_OR_LEFT
        break
      case this.#DIRECTION.LEFT:
      case this.#DIRECTION.RIGHT:
        if (col_dis > 0) return this.#DIRECTION.UP
        else if (col_dis < 0) return this.#DIRECTION.DOWN
        else return this.#DIRECTION.UP_OR_DOWN
        break
    }
  }
  #getMaxDan_3 (Dan) {
    var temp = Dan.UP
    var num = this.#DIRECTION.UP
    if (Dan.RIGHT > temp) {
      temp = Dan.RIGHT
      num = this.#DIRECTION.RIGHT
    }
    if (Dan.DOWN > temp) {
      temp = Dan.DOWN
      num = this.#DIRECTION.DOWN
    }
    if (Dan.LEFT > temp) {
      temp = Dan.LEFT
      num = this.#DIRECTION.LEFT
    }
    if (temp == 0) return this.#DIRECTION.STOP
    return num
  }
  #gogogo_3 (
    lateEnemy,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    currentTankDirect,
    godis
  ) {
    if (lateEnemy == undefined) return this.#DIRECTION.STOP
    var disX = lateEnemy.X - currentTankX
    var disY = lateEnemy.Y - currentTankY
    var col_dis = currentTankWH / 2 + bulletWH / 2
    var d1 = this.#DIRECTION.STOP
    var d2 = this.#DIRECTION.STOP
    if (Math.abs(disX) < col_dis) {
      if (disY > 0 && Math.abs(disY) > godis) {
        d1 = this.#DIRECTION.DOWN
      } else if (disY <= 0 && Math.abs(disY) > godis)
        d1 = this.#DIRECTION.UP
    } else {
      if (disX < 0) d1 = this.#DIRECTION.LEFT
      else d1 = this.#DIRECTION.RIGHT
    }
    if (Math.abs(disY) < col_dis) {
      if (disX < 0 && Math.abs(disX) > godis)
        d2 = this.#DIRECTION.LEFT
      else if (disX >= 0 && Math.abs(disX) > godis)
        d2 = this.#DIRECTION.RIGHT
    } else {
      if (disY < 0) d2 = this.#DIRECTION.UP
      else d2 = this.#DIRECTION.DOWN
    }
    if (currentTankDirect != d1 && currentTankDirect != d2) {
      if (Math.abs(disX) <= Math.abs(disY) && !this.#collisionMetal_3(currentTankX, currentTankY, currentTankWH, d1))
        return d1
      else return d2
    }
    if (currentTankDirect == d1 && !this.#collisionMetal_3(currentTankX, currentTankY, currentTankWH, d2)) {
      return d2
    } else return d1
  }
  #sacnTank_3 (
    Tank,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
  ) {
    if (Tank == undefined) return this.#DIRECTION.STOP
    var disX = Tank.X - currentTankX
    var disY = Tank.Y - currentTankY
    var col_dis = currentTankWH / 2 + bulletWH / 2
    if (Math.abs(disX) > col_dis && Math.abs(disY) > col_dis) {
      return this.#DIRECTION.STOP
    }
    else if (Math.abs(disX) < col_dis) {
      if (disY > 0) {
        return this.#DIRECTION.DOWN
      } else
        return this.#DIRECTION.UP
    } else {
      if (disX < 0)
        return this.#DIRECTION.LEFT
      else return this.#DIRECTION.RIGHT
    }
  }
  land_2 () {
    // 当前的坦克实例
    var cur = undefined
    var enr = undefined
    aMyTankCount.forEach((element) => {
      var c = element
      if (c['id'] == 200) {
        cur = c
      }
      if (c['id'] == 100) {
        enr = c
      }
    })
    const currentTank = cur
    const enemyTank = enr
    if (!currentTank) return

    //下面是方便读取的全局数据的别名
    // 所有的地方坦克实例数组
    const enemyTanks = aTankCount
    // 所有的敌方子弹实例数组
    const enemyBullets = aBulletCount
    // 坦克的宽高
    const currentTankWH = 50
    // 子弹的宽高
    const bulletWH = 10
    // 坦克的x,y  ===> 坦克中心点
    const currentTankX = currentTank.X
    const currentTankY = currentTank.Y
    const currentTankDirect = currentTank.direction
    //我方子弹
    const myBullets = this.type === 'A' ? aMyBulletCount1 : aMyBulletCount2

    const eBullets = this.type === 'A' ? aMyBulletCount2 : aMyBulletCount1
    // 游戏限制的子弹数为5 = aMyBulletCount2
    const myBulletLimit = 5

    // 当前策略移动方向
    let moveDirection = undefined

    // 中央逃逸点
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const limitDis = 75 //极限距离，小于该距离必须朝最近方向躲避
    const SafeDis = 125 //在极限距离和安全距离间可以综合考虑后躲避

    var lateEnemy = undefined //距离中心点最近的敌人
    var MindisTank = undefined  //距离自身最近的敌人
    var lateEnemyLeft = undefined // 左半边距离中心最近的敌人
    var lateEnemyRight = undefined // 右半边距离中心最近的敌人
    var RemainTankCount = { // 左右半边剩余的敌人数量
      LEFT: 0,
      RIGHT: 0
    }
    var MinTankdisLeft = 10000
    var MinTankdisRight = 10000
    var MinTankdis = 10000
    var secruitydistance = currentTankWH * 6
    var secruitylevel = enemyTanks.length
    var firedirectdis = 4
    var escapedir = 4
    var fight = 6
    var escapenum = 0
    var CanAttack = [0, 0, 0, 0]
    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        cx,
        0,
        enemy.X,
        enemy.Y
      )
      const disself = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
        enemy.X,
        enemy.Y
      )
      var i = this.#sacnTank_2(enemy,
        currentTankX,
        currentTankY,
        currentTankWH,
        bulletWH)
      if (i != this.#DIRECTION.STOP) {
        if (CanAttack[i] == 0 || CanAttack[i] < disself)
          CanAttack[i] = disself
      }
      if (MinTankdis > disself) {
        MinTankdis = disself
        MindisTank = enemy
      }
      if (enemy.X <= cx) {
        RemainTankCount.LEFT += 1
        if (MinTankdisLeft > dis) {
          MinTankdisLeft = dis
          lateEnemyLeft = enemy
        }
      } else {
        RemainTankCount.RIGHT += 1
        if (MinTankdisRight > dis) {
          MinTankdisRight = dis
          lateEnemyRight = enemy
        }
      }
    }
    lateEnemy = lateEnemyRight == undefined ? lateEnemyLeft : lateEnemyRight
    let arrayBullets = aBulletCount/*.concat(eBullets)*/
    //arrayBullets = arrayBullets.concat(aTankCount)
    var Bullets_is_close = new Array() //子弹是否远离坦克
    var Bullets_col_dis = new Array() //碰撞距离（用来判断子弹是否会碰上坦克）
    var Bullets_dis = new Array() //子弹运动方向和坦克的距离（判断威胁程度）
    this.#calcBulletDistance(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis
    )

    moveDirection = this.#avoidBullet_2(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      limitDis,
      SafeDis,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis,
      lateEnemy,
      currentTankDirect,
      CanAttack,
      MindisTank,
      RemainTankCount
    )

    /*moveDirection = this.#avoidBulletBt(
      arrayBullets,
      currentTankX,
      currentTankY,
      currentTankWH,
      bulletWH,
      limitDis,
      SafeDis,
      Bullets_is_close,
      Bullets_col_dis,
      Bullets_dis,
      lateEnemy,
      currentTankDirect
    )*/

    var c = new Date().valueOf()
    if (moveDirection[1] == 1) {
      if (c - this.firetimestamp > 100) {
        this.firetimestamp = c
        this.#fire()
        document.onkeyup(this.#fireEv)
      }
    }
    this.#move(moveDirection[0])
    this.#setName()
  }
  //计算躲避子弹要移动的方向
  #avoidBullet_2 (
    arrayBullets,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    limitDis,
    SafeDis,
    Bullets_is_close,
    Bullets_col_dis,
    Bullets_dis,
    lateEnemy,
    currentTankDirect,
    CanAttack,
    MindisTank,
    RemainTankCount
  ) {
    const centerTankX = currentTankX + currentTankWH / 2
    const centerTankY = currentTankY + currentTankWH / 2
    const col_dis = currentTankWH / 2 + bulletWH / 2
    var limitDirect = 0 //是否按最短路径躲避
    var moveDirection = this.#DIRECTION.STOP // 躲避方向
    var closetColUDDis = 10000
    var closetColRLDis = 10000
    var attack = 0 //是否攻击
    var TempDirection = 4
    //往各个方向躲避的系数
    var Dan = {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
    }
    var DanNearBa = {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
    }
    for (var i = 0; i < arrayBullets.length; i++) {
      const Bullet = arrayBullets[i]
      if (
        !Bullets_is_close[i] &&
        (Math.abs(Bullets_col_dis[i]) > col_dis + 7 ||
          Math.abs(Bullets_dis[i]) > col_dis)
      )
        //如果子弹是远离的并且在下一个阶段不可能产生碰撞则不考虑
        continue
      else if (
        Bullets_is_close[i] &&
        Math.abs(Bullets_col_dis[i]) <= col_dis &&
        Math.abs(Bullets_dis[i]) <= limitDis
      ) {
        //如果即将碰撞的子弹直线距离在极限距离以内，则按照最短路径方向躲避
        moveDirection = this.#getShortestDirecton_2(
          Bullet.direction,
          Bullets_is_close[i],
          Bullets_col_dis[i],
          Bullets_dis[i]
        )
        console.log('buxingle')
        if (moveDirection <= 4) limitDirect = 1
      } else if (
        Bullets_is_close[i] &&
        Math.abs(Bullets_col_dis[i]) <= col_dis &&
        /*Math.abs(Bullets_dis[i]) > limitDis &&*/
        Math.abs(Bullets_dis[i]) <= SafeDis
      ) {
        //计算在安全距离内会发生碰撞的最近的子弹
        switch (Bullet.direction) {
          case this.#DIRECTION.UP:
          case this.#DIRECTION.DOWN:
            closetColUDDis =
              Math.abs(Bullets_dis[i]) < closetColUDDis
                ? Math.abs(Bullets_dis[i])
                : closetColUDDis
            break
          case this.#DIRECTION.LEFT:
          case this.#DIRECTION.RIGHT:
            closetColRLDis =
              Math.abs(Bullets_dis[i]) < closetColRLDis
                ? Math.abs(Bullets_dis[i])
                : closetColRLDis
            break
        }
      } else {
        //计算不会碰上但是有威胁的
        var dis = Math.sqrt(
          Math.pow(Bullets_dis[i], 2) + Math.pow(Bullets_col_dis[i], 2)
        )
        if (dis < 177) {
          const direction = this.#getShortestDirecton_2(
            Bullet.direction,
            Bullets_is_close[i],
            Bullets_col_dis[i],
            Bullets_dis[i]
          )
          var weight = Math.cos(((dis / 177) * Math.PI) / 2)
          switch (direction) {
            case this.#DIRECTION.UP:
              Dan.UP += weight
              break
            case this.#DIRECTION.DOWN:
              Dan.DOWN += weight
              break
            case this.#DIRECTION.LEFT:
              Dan.LEFT += weight
              break
            case this.#DIRECTION.RIGHT:
              Dan.RIGHT += weight
              break
          }
        }
      }
    }
    if (limitDirect != 1) {
      if (moveDirection == this.#DIRECTION.STOP) {
        if (!(closetColRLDis == 10000 && closetColUDDis == 10000)) {
          if (closetColRLDis <= closetColUDDis) {
            moveDirection = this.#DIRECTION.UP_OR_DOWN
          } else moveDirection = this.#DIRECTION.RIGHT_OR_LEFT
        } else {
          //如果没有碰撞的可能则按照威胁程度进行躲避
          this.#isNearBoundaryDan_2(
            centerTankX,
            centerTankY,
            currentTankWH,
            DanNearBa,
            4
          )
          moveDirection = this.#getMaxDan_2(DanNearBa, Dan, 0.5)
          // 判断距离最近的坦克保持距离
          if (moveDirection == this.#DIRECTION.STOP) {
            moveDirection = this.#leaveEne_2(
              MindisTank,
              currentTankX,
              currentTankY,
              Dan,
              100
            )
          }
          if (moveDirection == this.#DIRECTION.STOP) {
            //如果没有威胁则进攻
            var DanTemp = {
              UP: 0,
              DOWN: 0,
              LEFT: 0,
              RIGHT: 0,
            }
            DanTemp.UP = Dan.UP + DanNearBa.UP * 2
            DanTemp.DOWN = Dan.DOWN + DanNearBa.DOWN * 2
            DanTemp.LEFT = Dan.LEFT + DanNearBa.LEFT * 2
            DanTemp.RIGHT = Dan.RIGHT + DanNearBa.RIGHT * 2
            moveDirection = this.#gogogo_2(
              lateEnemy,
              currentTankX,
              currentTankY,
              currentTankWH,
              bulletWH,
              currentTankDirect,
              100,
              Dan,
              RemainTankCount
            )
            console.log(Dan)
            console.log(moveDirection)
            if (moveDirection == this.#DIRECTION.STOP) {
              if (currentTankDirect != TempDirection && this.#aggressiveCheck_2(Dan, TempDirection, 0.7) != this.#DIRECTION.STOP) {
                moveDirection = TempDirection
              }

            }
            console.log('进攻')
          }
        }
      }
      if (moveDirection != this.#DIRECTION.STOP) {
        if (moveDirection == this.#DIRECTION.UP_OR_DOWN) {
          moveDirection =
            Dan.UP > Dan.DOWN ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
        } else if (moveDirection == this.#DIRECTION.RIGHT_OR_LEFT) {
          moveDirection =
            Dan.RIGHT > Dan.LEFT ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
        }
      }
    }
    if (CanAttack[currentTankDirect] != 0) {
      if (CanAttack[currentTankDirect] < 300) attack = 1
      else {
        if (aMyBulletCount1.length < 4) {
          attack = 1
        }
      }
    }
    console.log(CanAttack)
    console.log(moveDirection)
    return [moveDirection, attack]
  }
  #isNearBoundaryDan_2 (X, Y, currentTankWH, Dan, n) {
    const DisUP = screenY - Y
    const DisDOWN = Y
    const DisLEFT = screenX - X
    const DisRIGHT = X
    let tanksnum = aTankCount.length
    if (tanksnum < 10) n = (10 / tanksnum) * n

    // n = (20 / tanksnum) * n
    /*Dan.UP +=
      DisUP < screenY / n ? Math.cos(((DisUP / screenY) * n * Math.PI) / 2) : 0*/
    Dan.DOWN +=
      DisDOWN < screenY / n
        ? Math.cos(((DisDOWN / screenY) * n * Math.PI) / 2)
        : 0
    Dan.LEFT +=
      DisLEFT < screenX / n / 4
        ? Math.cos(((DisLEFT / screenX) * n * 4 * Math.PI) / 2)
        : 0
    Dan.RIGHT +=
      DisRIGHT < screenX / n / 4
        ? Math.cos(((DisRIGHT / screenX) * n * 4 * Math.PI) / 2)
        : 0
  }
  #getShortestDirecton_2 (
    direction,
    is_close,
    col_dis,
    dis
  ) {
    //获取要躲避子弹i的最短路径方向    
    switch (direction) {
      case this.#DIRECTION.UP:
      case this.#DIRECTION.DOWN:
        if (col_dis < 0) return this.#DIRECTION.RIGHT
        else if (col_dis > 0) return this.#DIRECTION.LEFT
        else return this.#DIRECTION.RIGHT_OR_LEFT
        break
      case this.#DIRECTION.LEFT:
      case this.#DIRECTION.RIGHT:
        if (col_dis > 0) return this.#DIRECTION.UP
        else if (col_dis < 0) return this.#DIRECTION.DOWN
        else return this.#DIRECTION.UP_OR_DOWN
        break
    }
  }
  #getMaxDan_2 (Dan, Danorigin, wight) {
    var temp = Dan.UP
    var num = this.#DIRECTION.UP
    if (Dan.RIGHT > temp && Danorigin.LEFT < wight && Dan.RIGHT > wight) {
      temp = Dan.RIGHT
      num = this.#DIRECTION.RIGHT
    }
    if (Dan.DOWN > temp && Danorigin.UP < wight && Dan.DOWN > wight) {
      temp = Dan.DOWN
      num = this.#DIRECTION.DOWN
    }
    if (Dan.LEFT > temp && Danorigin.RIGHT < wight && Dan.LEFT > wight) {
      temp = Dan.LEFT
      num = this.#DIRECTION.LEFT
    }
    if (temp == 0) return this.#DIRECTION.STOP
    if (num == this.#DIRECTION.UP && Danorigin.DOWN < wight && Dan.UP > wight) {
      return num
    }
    console.log("保守躲")
    console.log(Dan, Danorigin)
    return num
  }
  #gogogo_2 (
    lateEnemy,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
    currentTankDirect,
    godis,
    Dan,
    RemainTankCount
  ) {
    if (lateEnemy == undefined) return this.#DIRECTION.STOP
    var disX = lateEnemy.X - currentTankX
    var disY = lateEnemy.Y - currentTankY
    var col_dis = currentTankWH / 2 + bulletWH / 2
    var d1 = this.#DIRECTION.STOP
    var d2 = this.#DIRECTION.STOP
    if (Math.abs(disX) < col_dis) {
      if (disY > 0 && (Math.abs(disY) > godis || currentTankDirect != this.#DIRECTION.DOWN)) {
        d1 = this.#DIRECTION.DOWN
      } else if (disY <= 0 && (Math.abs(disY) > godis || currentTankDirect != this.#DIRECTION.UP))
        d1 = this.#DIRECTION.UP
    } else {
      if (disX < 0) d1 = this.#DIRECTION.LEFT
      else d1 = this.#DIRECTION.RIGHT
    }
    if (Math.abs(disY) < col_dis) {
      if (disX < 0 && (Math.abs(disX) > godis || currentTankDirect != this.#DIRECTION.LEFT))
        d2 = this.#DIRECTION.LEFT
      else if (disX >= 0 && (Math.abs(disX) > godis || currentTankDirect != this.#DIRECTION.RIGHT))
        d2 = this.#DIRECTION.RIGHT
    } else {
      if (disY < 0) d2 = this.#DIRECTION.UP
      else d2 = this.#DIRECTION.DOWN
    }
    d1 = this.#aggressiveCheck_2(Dan, d1, 0.7)//避免进攻时撞在路过的子弹上
    d2 = this.#aggressiveCheck_2(Dan, d2, 0.7)
    // if (d1 == this.#DIRECTION.STOP && Math.abs(disY) > godis) d1 = d2
    // if (d2 == this.#DIRECTION.STOP && Math.abs(disX) > godis) d2 = d1
    // if (currentTankDirect != d1 && currentTankDirect != d2) {
    if (this.#aggressiveCheck_2(Dan, d1, 0.5) == this.#DIRECTION.STOP) return d2
    if (RemainTankCount.LEFT > 2 || d2 == this.#DIRECTION.UP) {
      return d1
    }
    // if (/*Math.abs(disX) <= Math.abs(disY) ||*/ d1 != this.#DIRECTION.STOP || this.#aggressiveCheck_2(Dan, d2, 0.5) == this.#DIRECTION.STOP)
    //   return d1
    // else return d2
    // }
    var items = [d1, d2]
    return items[Math.floor(Math.random() * items.length)];
    // if (currentTankDirect == d1 && !this.#collisionMetal(currentTankX, currentTankY, currentTankWH, d2)) {
    //   return d2
    // } else return d1
  }
  #leaveEne_2 (
    lateEnemy,
    currentTankX,
    currentTankY,
    Dan,
    T2TSafeDis
  ) {
    let tanksnum = aTankCount.length
    // T2TSafeDis = T2TSafeDis * tanksnum / 20
    // if (T2TSafeDis < 60) T2TSafeDis = 60
    var re = this.#DIRECTION.STOP
    if (lateEnemy == undefined) return this.#DIRECTION.STOP
    var disX = lateEnemy.X - currentTankX
    var disY = lateEnemy.Y - currentTankY
    if (Math.abs(disX) >= Math.abs(disY)) {
      if (Math.abs(disX) < T2TSafeDis) {
        if (disX > 0) re = this.#DIRECTION.LEFT
        else re = this.#DIRECTION.RIGHT
      }
    } else {
      if (Math.abs(disY) < T2TSafeDis) {
        if (disY > 0) re = this.#DIRECTION.UP
        else re = this.#DIRECTION.DOWN
      }
    }
    re = this.#aggressiveCheck_2(Dan, re, 0.5)
    return re
  }
  #aggressiveCheck_2 (
    Dan,
    direction,
    weight
  ) {
    switch (direction) {
      case this.#DIRECTION.UP:
        if (Dan.DOWN > weight) return this.#DIRECTION.STOP
      case this.#DIRECTION.DOWN:
        if (Dan.UP > weight) return this.#DIRECTION.STOP
      case this.#DIRECTION.LEFT:
        if (Dan.RIGHT > weight) return this.#DIRECTION.STOP
      case this.#DIRECTION.RIGHT:
        if (Dan.LEFT > weight) return this.#DIRECTION.STOP
      default:
        return direction
    }
  }
  #sacnTank_2 (
    Tank,
    currentTankX,
    currentTankY,
    currentTankWH,
    bulletWH,
  ) {
    if (Tank == undefined) return this.#DIRECTION.STOP
    var disX = Tank.X - currentTankX
    var disY = Tank.Y - currentTankY
    var col_dis = currentTankWH / 2 + bulletWH / 2
    if (Math.abs(disX) > col_dis && Math.abs(disY) > col_dis) {
      return this.#DIRECTION.STOP
    }
    else if (Math.abs(disX) < col_dis) {
      if (disY > 0) {
        return this.#DIRECTION.DOWN
      } else
        return this.#DIRECTION.UP
    } else {
      if (disX < 0)
        return this.#DIRECTION.LEFT
      else return this.#DIRECTION.RIGHT
    }
  }
})('B')