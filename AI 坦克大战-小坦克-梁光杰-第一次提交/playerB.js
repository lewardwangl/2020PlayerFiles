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

if (typeof (enableAstar) == 'undefined') {
  !function (e, t) { "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : "function" == typeof define && (define.cmd || define.hjs) ? define(function (require, exports, e) { e.exports = t() }) : e.Astar = t() }(this, function () { "use strict"; var e = function (e) { return e.split(",").map(Number) }; return function () { function t (e) { var t = this; t.grid = e, t.openList = {}, t.closeList = {}, t.current } return t.prototype.search = function (e, t, r) { var n = this, i = { rightAngle: !1, optimalResult: !0 }; r = n.searchOption = r || {}; for (var o in i) r[o] === undefined && (r[o] = i[o]); n.start = e, n.end = t, n.grid.get(e).value = 0, n.grid.set(e, "type", "start"), n.grid.get(t).value = 0, n.grid.set(t, "type", "end"); var d, u; return n.openList[e] = null, n.grid.set(e, "type", "open"), (u = function (e) { if (n.grid.set(e, "type", "highlight"), n.grid.get(e) === n.grid.get(n.end)) d = n.getBackPath(e); else { for (var t = n.getAround(e), r = 0, i = t.length; r < i; r++) { var o = t[r], l = n.grid.get(o); if (null !== n.openList[o]) n.openList[o] = null, l.parent = e, l.g = n.g(o, e), l.h = n.h(o, n.end), l.f = n.f(o), n.grid.set(o, "type", "open"); else { var s = l.g, g = n.g(o, e); g < s && (l.parent = e, l.g = g, l.f = n.f(o), n.grid.set(o, "type", "update")) } } delete n.openList[e], n.closeList[e] = null, n.grid.set(e, "type", "close"); var f = n.getOpenListMin(); f && u(f.key) } })(e), d }, t.prototype.getBackPath = function (e) { var t, r = this, n = [e]; return (t = function (e) { var i = r.grid.get(e).parent; i && (n.unshift(i), t(i)) })(e), n }, t.prototype.getOpenListMin = function () { var t, r = this; for (var n in r.openList) { var i = e(n), o = r.grid.get(i); (t === undefined || o.f < t.f) && (t = r.grid.get(i)) } return t }, t.prototype.getOffsetGrid = function (e, t) { return [e[0] + t[0], e[1] + t[1]] }, t.prototype.getAround = function (e) { var t = this, r = t.searchOption, n = [], i = t.grid, o = { lt: [-1, -1], t: [0, -1], rt: [1, -1], r: [1, 0], rb: [1, 1], b: [0, 1], lb: [-1, 1], l: [-1, 0] }, d = function (e, r) { var n = i.get(t.getOffsetGrid(e, r)); return n !== undefined && n.value > 0 }; r.rightAngle ? (delete o.lt, delete o.rt, delete o.rb, delete o.lb) : (d(e, o.l) && (delete o.lt, delete o.lb), d(e, o.r) && (delete o.rt, delete o.rb), d(e, o.t) && (delete o.lt, delete o.rt), d(e, o.b) && (delete o.lb, delete o.rb)); for (var u in o) { var l = o[u], s = [e[0] + l[0], e[1] + l[1]], g = null === t.closeList[s]; s[0] > -1 && s[0] < i.col && s[1] > -1 && s[1] < i.row && !g && i.get(s).value < 1 && n.push(s) } return n }, t.prototype.f = function (e) { var t = this, r = t.grid.get(e); return r.g + r.h }, t.prototype.g = function (e, t) { return this.searchOption.optimalResult ? (t[0] === e[0] || t[1] === e[1] ? 10 : 14) + this.grid.get(t).g : 0 }, t.prototype.h = function (e, t) { return 10 * (Math.abs(e[0] - t[0]) + Math.abs(e[1] - t[1])) }, t }() });
  !function (e, n) { "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : "function" == typeof define && (define.cmd || define.hjs) ? define(function (require, exports, e) { e.exports = n() }) : e.Grid = n() }(this, function () { "use strict"; var e = function (e, n) { return ~~(Math.random() * (n - e + 1)) + e }, n = function (e, n) { var t = this; t.x = e, t.y = n, t.g = 0, t.h = 0, t.f = 0, t.value = 0, t.key = [e, n] }; return function () { function t (e) { var n = this; n.col = e.col, n.row = e.row, n.grid = n.createGrid(e.col, e.row, e.render) } return t.prototype.obstacle = function (n, t) { for (var r, o = this, i = ~~(o.col * o.row * n / 100), u = [], f = {}, c = 0; c < i; c++)(r = function () { u[0] = e(0, o.col - 1), u[1] = e(0, o.row - 1); var n = o.get(u); 0 === n.value ? (n.value = t, f[[u[0], u[1]]] = null) : r() })(); return f }, t.prototype.get = function (e) { var n = this.grid[e[1]]; return n ? n[e[0]] : undefined }, t.prototype.set = function (e, n, t) { var r = this.get(e); r[n] = t, "function" == typeof r.render && r.render({ key: n, val: t }) }, t.prototype.createGrid = function (e, t, r) { for (var o = [], i = 0; i < t; i++)!function (t) { var i = function () { for (var o = [], i = 0; i < e; i++) { var u = new n(i, t); "function" == typeof r && (u.render = r), o[i] = u } return o }(); o.push(i) }(i); return o }, t.prototype.getData = function () { for (var e = this, n = e.grid, t = [], r = 0, o = n.length; r < o; r++)!function (e, r) { var o = n[e]; t.push(function () { for (var e = [], n = 0, t = o.length; n < t; n++)e.push(o[n].value); return e }()) }(r); return t }, t }() });
  var enableAstar = true;
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
    let Bullet = new Array(
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP,
      this.#DIRECTION.STOP
    )
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

    moveDirection = this.#avoidBullet(
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
  //计算躲避子弹要移动的方向
  #avoidBullet (
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
        moveDirection = this.#getShortestDirecton(
          arrayBullets,
          i,
          Bullets_is_close,
          Bullets_col_dis,
          Bullets_dis
        )
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
          const direction = this.#getShortestDirecton(
            arrayBullets,
            i,
            Bullets_is_close,
            Bullets_col_dis,
            Bullets_dis
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
          this.#isNearBoundaryDan(
            centerTankX,
            centerTankY,
            currentTankWH,
            Dan,
            10
          )
          moveDirection = this.#getMaxDan(Dan)
          if (moveDirection == this.#DIRECTION.STOP) {
            //如果没有威胁则进攻
            moveDirection = this.#gogogo(
              lateEnemy,
              currentTankX,
              currentTankY,
              currentTankWH,
              bulletWH,
              currentTankDirect,
              177
            )
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
    ).value = `畅游小坦克队`
    document.getElementById(
      `Player${this.type === 'A' ? 1 : 2}Name`
    ).textContent = `畅游小坦克队`
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
  #scanner (currentTank) { }
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
  #isNearBoundaryDan (X, Y, currentTankWH, Dan, n) {
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
  #collisionMetal (x, y, r) {
    //障碍阻挡
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
  #getShortestDirecton (
    arrayBullets,
    i,
    Bullets_is_close,
    Bullets_col_dis,
    Bullets_dis
  ) {
    //获取要躲避子弹i的最短路径方向
    const direction = arrayBullets[i].direction
    const col_dis = Bullets_col_dis[i]
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
  #getMaxDan (Dan) {
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
  #gogogo (
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
      if (Math.abs(disX) <= Math.abs(disY) && !this.#collisionMetal(currentTankX, currentTankY, currentTankWH, d1))
        return d1
      else return d2
    }
    if (currentTankDirect == d1 && !this.#collisionMetal(currentTankX, currentTankY, currentTankWH, d2)) {
      return d2
    } else return d1
  }
})('B')
