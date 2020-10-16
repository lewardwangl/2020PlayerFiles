window.playerB = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;
  }

  abbbx_bullet_distance(mt_x, mt_y, enemy_bullet, bullet) {

    var that = this
    const t_wh = this.tank_wh
    const b_wh = this.bullet_wh
    const max_b_wh = b_wh * 1.2
    enemy_bullet.forEach(enb => {
      const enb_x = enb.X
      const b_y = enb.Y
      const e_d = enb.direction

      if (that.#collision(mt_x + t_wh, mt_y, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1, 
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[7] = e_d
      }

      if (that.#collision(mt_x + 2 * t_wh, mt_y, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[8] = e_d
      }                            

      if (that.#collision(mt_x - 2 * t_wh, mt_y, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[4] = e_d
      }                
      
      if (that.#collision(mt_x - 1 * t_wh, mt_y, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[5] = e_d
      }

      if (that.#collision(mt_x, mt_y + t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[10] = e_d
      }

      if (that.#collision(mt_x, mt_y + 2 * t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[12] = e_d
      }

      if (that.#collision(mt_x, mt_y - 2 * t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[0] = e_d
      }

      if (that.#collision(mt_x, mt_y - 1 * t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[2] = e_d
      }

      if (that.#collision(mt_x - t_wh, mt_y - t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[1] = e_d
      }

      if (that.#collision(mt_x + t_wh, mt_y - t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[3] = e_d
      }

      if (that.#collision(mt_x - t_wh, mt_y + t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[9] = e_d
      }

      if (that.#collision(mt_x + t_wh, mt_y + t_wh, enb_x - b_wh / 2 - 1, b_y - b_wh / 2 - 1,
        t_wh, t_wh, max_b_wh, max_b_wh)) {
        bullet[11] = e_d
      }
    });
  }

  abbbx_avoid_bullet(mt_x, mt_y, bullet, move_direction) {
    if (this.#DIRECTION.DOWN == bullet[2] || this.#DIRECTION.UP == bullet[10]) {
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.LEFT, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[1] && this.#DIRECTION.UP != bullet[9] && this.#DIRECTION.RIGHT != bullet[4] && this.#DIRECTION.STOP == bullet[5]) {
          move_direction = this.#DIRECTION.LEFT
      }
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.RIGHT, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[3] && this.#DIRECTION.UP != bullet[11] && this.#DIRECTION.LEFT != bullet[8] && this.#DIRECTION.STOP == bullet[7]) {
          if (this.priority == this.#DIRECTION.RIGHT && move_direction == this.#DIRECTION.LEFT) {
            move_direction = this.#DIRECTION.RIGHT
          }
      }
    }else if (this.#DIRECTION.DOWN == bullet[0] || this.#DIRECTION.UP == bullet[12]) {
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.LEFT, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[1] && this.#DIRECTION.UP != bullet[9] && this.#DIRECTION.RIGHT != bullet[4] && this.#DIRECTION.STOP == bullet[5]) {
          move_direction = this.#DIRECTION.LEFT
      }else if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.RIGHT, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[3] && this.#DIRECTION.UP != bullet[11] && this.#DIRECTION.LEFT != bullet[8] && this.#DIRECTION.STOP == bullet[7]) {
          move_direction = this.#DIRECTION.RIGHT
      }
    }

    if (this.#DIRECTION.RIGHT == bullet[5] || this.#DIRECTION.LEFT == bullet[7]) {
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.UP, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[0] && this.#DIRECTION.LEFT != bullet[3] && this.#DIRECTION.RIGHT != bullet[1] && this.#DIRECTION.STOP == bullet[2]) {
          move_direction = this.#DIRECTION.UP
      }
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.DOWN, this.tank_wh) && 
        this.#DIRECTION.UP != bullet[12] && this.#DIRECTION.LEFT != bullet[11] && this.#DIRECTION.RIGHT != bullet[9] && this.#DIRECTION.STOP == bullet[10]) {
          if (this.priority == this.#DIRECTION.DOWN && move_direction == this.#DIRECTION.UP) {
            move_direction = this.#DIRECTION.DOWN
          }
      }
    }else if (this.#DIRECTION.RIGHT == bullet[4] || this.#DIRECTION.LEFT == bullet[8]) {
      if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.UP, this.tank_wh) && 
        this.#DIRECTION.DOWN != bullet[0] && this.#DIRECTION.LEFT != bullet[3] && this.#DIRECTION.RIGHT != bullet[1] && this.#DIRECTION.STOP == bullet[2]) {
        move_direction = this.#DIRECTION.UP
      }else if (!this.#isNearBoundary(mt_x, mt_y, this.#DIRECTION.DOWN, this.tank_wh) && 
        this.#DIRECTION.UP != bullet[12] && this.#DIRECTION.LEFT != bullet[11] && this.#DIRECTION.RIGHT != bullet[9] && this.#DIRECTION.STOP == bullet[10]) {
          move_direction = this.#DIRECTION.DOWN
      }
    }
    this.priority = move_direction
    return move_direction
  }

  abbbx_blind_run(my_tank, enemy_bullets, enemy_tanks) {
    const mt_x = my_tank.X;
    const mt_y = my_tank.Y;
    const mt_direct = my_tank.direction
    var that = this
    var direction = undefined

    let bullet = [this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP]

    // this.#calcBulletDistance(enemy_bullets, mt_x, mt_y, bullet, this.tank_wh, this.bullet_wh)
    this.abbbx_bullet_distance(mt_x, mt_y, enemy_bullets, bullet)
    direction = this.#avoidBullet(mt_x, mt_y, this.tank_wh, bullet, direction)
    // direction = this.abbbx_avoid_bullet(mt_x, mt_y, bullet, direction)

    const cx = canvas.width / 2.0
    const cy = canvas.height / 2.0

    var min_tank_dis = undefined
    var min_tank_dis_ent = undefined
    const secruity_dis = this.tank_wh * 6
    const fire_direct_dis = this.tank_wh * 4
    const fight_dis = this.tank_wh * 6
    const escape_dis = this.tank_wh * 4
    var escape_num = 0

    enemy_tanks.forEach(ent => {
      var dis = that.#calcTwoPointDistance(mt_x, mt_y, ent.X, ent.Y)
      if (secruity_dis > dis && enemy_tanks.length >= 4) {
        escape_num += 1
      }
      if (!min_tank_dis_ent || min_tank_dis > dis) {
        min_tank_dis = dis
        min_tank_dis_ent = ent
      }
    })
    if (direction == undefined && escape_num < 4) {
      if (min_tank_dis_ent) {
        const ent_x = min_tank_dis_ent.X
        const ent_y = min_tank_dis_ent.Y
        var dis_x = Math.abs(ent_x - mt_x)
        var dis_y = Math.abs(ent_y - mt_y)
        var dis = this.#calcTwoPointDistance(mt_x, mt_y, ent_x, ent_y)
        if (dis >= fire_direct_dis) {
          if ((dis_x < dis_y) && (ent_y < mt_y) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[2] && this.#DIRECTION.STOP == bullet[3]) {
            if (mt_direct != this.#DIRECTION.UP) { direction = this.#DIRECTION.UP }
          }else if ((dis_x < dis_y) && (ent_y >= mt_y) 
              && this.#DIRECTION.STOP == bullet[9] && this.#DIRECTION.STOP == bullet[10] && this.#DIRECTION.STOP == bullet[11]) { 
            if (mt_direct != this.#DIRECTION.DOWN) { direction = this.#DIRECTION.DOWN }
          }else if ((dis_x > dis_y) && (ent_x >= mt_x)
              && this.#DIRECTION.STOP == bullet[3] && this.#DIRECTION.STOP == bullet[7] && this.#DIRECTION.STOP == bullet[11]) {
            if (mt_direct != this.#DIRECTION.RIGHT) { direction = this.#DIRECTION.RIGHT }
          }else if ((dis_x > dis_y) && (ent_x < mt_x) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[4] && this.#DIRECTION.STOP == bullet[9]) {
            if (mt_direct != this.#DIRECTION.LEFT) { direction = this.#DIRECTION.LEFT }
          }
        }

        if ((dis_x > fight_dis || dis_y > fight_dis) && dis > fight_dis) {
          if ((dis_x < dis_y) && (ent_y < mt_y) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[2] && this.#DIRECTION.STOP == bullet[3]) {
             { direction = this.#DIRECTION.UP }
          }else if ((dis_x < dis_y) && (ent_y >= mt_y) 
              && this.#DIRECTION.STOP == bullet[9] && this.#DIRECTION.STOP == bullet[10] && this.#DIRECTION.STOP == bullet[11]) { 
             { direction = this.#DIRECTION.DOWN }
          }else if ((dis_x > dis_y) && (ent_x >= mt_x)
              && this.#DIRECTION.STOP == bullet[3] && this.#DIRECTION.STOP == bullet[7] && this.#DIRECTION.STOP == bullet[11]) {
             { direction = this.#DIRECTION.RIGHT }
          }else if ((dis_x > dis_y) && (ent_x < mt_x) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[4] && this.#DIRECTION.STOP == bullet[9]) {
             { direction = this.#DIRECTION.LEFT }
          }
        }else if (dis < escape_dis) {
          if ((dis_x < dis_y) && (ent_y >= mt_y) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[2] && this.#DIRECTION.STOP == bullet[3]) {
             { direction = this.#DIRECTION.UP }
          }else if ((dis_x < dis_y) && (ent_y < mt_y) 
              && this.#DIRECTION.STOP == bullet[9] && this.#DIRECTION.STOP == bullet[10] && this.#DIRECTION.STOP == bullet[11]) { 
             { direction = this.#DIRECTION.DOWN }
          }else if ((dis_x > dis_y) && (ent_x < mt_x)
              && this.#DIRECTION.STOP == bullet[3] && this.#DIRECTION.STOP == bullet[7] && this.#DIRECTION.STOP == bullet[11]) {
             { direction = this.#DIRECTION.RIGHT }
          }else if ((dis_x > dis_y) && (ent_x >= mt_x) 
              && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[4] && this.#DIRECTION.STOP == bullet[9]) {
             { direction = this.#DIRECTION.LEFT }
          }
        }

        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 500) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }

      }
    }else if (escape_num >= 4) {
      if (cy > mt_y 
          && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[2] && this.#DIRECTION.STOP == bullet[3]) {
        { direction = this.#DIRECTION.UP }
      }else if (cy > mt_y
          && this.#DIRECTION.STOP == bullet[9] && this.#DIRECTION.STOP == bullet[10] && this.#DIRECTION.STOP == bullet[11]) { 
        { direction = this.#DIRECTION.DOWN }
      }else if (cx > mt_x
          && this.#DIRECTION.STOP == bullet[3] && this.#DIRECTION.STOP == bullet[7] && this.#DIRECTION.STOP == bullet[11]) {
        { direction = this.#DIRECTION.RIGHT }
      }else if (cx < mt_x
          && this.#DIRECTION.STOP == bullet[1] && this.#DIRECTION.STOP == bullet[4] && this.#DIRECTION.STOP == bullet[9]) {
        { direction = this.#DIRECTION.LEFT }
      }      
    }

    direction = this.#avoidBullet(mt_x, mt_y, this.tank_wh, bullet, direction)
    this.#move(direction);
    this.#setName();
  }

  land() {

    var a_tank = undefined
    var b_tank = undefined
    aMyTankCount.forEach(element => {
      var c = element
      if(c['id'] == 100)
      {
        a_tank = c
      }
      if(c['id'] == 200)
      {
        b_tank = c
      }
    });
    if (!b_tank) return;
    // this.land_ori()
    this.abbbx_blind_run(b_tank, aBulletCount, aTankCount)
    return

    // 当前的坦克实例
    var cur = undefined
    var enr = undefined
    aMyTankCount.forEach(element => {
      var c = element
      if(c['id'] == 200)
      {
        cur = c
      }
      if(c['id'] == 100)
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

    for (const enemy of enemyTanks) {
      const dis = this.#calcTwoPointDistance(
        currentTankX,
        currentTankY,
          enemy.X,
          enemy.Y 
      );

      if(secruitydistance>dis  && enemyTanks.length >= 4)
      {
        escapenum++//逃亡系数，大了就要跑
      }
      if (misDistanceOfEnemy > dis) {
        misDistanceOfEnemy = dis;
        lateEnemy = enemy;
      }
    }
    if(undefined != enemyTank)
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
    if(secruitylevel<=2 && undefined != enemyTank)//是否可以加速打电脑
    {
       firedirectdis = 3
       escapedir = 3
       fight = 4
    }
    if (moveDirection == undefined && escapenum < 4) {
      //不移动可以考虑炮击
      if (undefined != lateEnemy) {
        var disX = Math.abs(lateEnemy.X - currentTankX)
        var disY = Math.abs(lateEnemy.Y - currentTankY)
        var dis = this.#calcTwoPointDistance(currentTankX, currentTankY, lateEnemy.X, lateEnemy.Y)
        if (/*(disX > firedirectdis * currentTankWH || disY > firedirectdis * currentTankWH) ||*/ dis >= firedirectdis * currentTankWH) {//调整炮口
          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
            if (currentTankDirect != this.#DIRECTION.UP) {
              moveDirection = this.#DIRECTION.UP;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.DOWN) {
              moveDirection = this.#DIRECTION.DOWN;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
            if (currentTankDirect != this.#DIRECTION.RIGHT) {
              moveDirection = this.#DIRECTION.RIGHT;
              console.log("炮口调整", moveDirection)
            }
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
            if (currentTankDirect != this.#DIRECTION.LEFT) {
              moveDirection = this.#DIRECTION.LEFT;
              console.log("炮口调整", moveDirection)
            }
          }
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

          if ((disX < disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
            moveDirection = this.#DIRECTION.DOWN;
          } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
            moveDirection = this.#DIRECTION.UP;
          } else if ((disX > disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
            moveDirection = this.#DIRECTION.LEFT;
          } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
            moveDirection = this.#DIRECTION.RIGHT
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
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.LEFT != Bullet[10] && this.#DIRECTION.UP != Bullet[7]) {
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
      ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.LEFT != Bullet[10] && this.#DIRECTION.UP != Bullet[7]) {
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
    ).value = `AiBiuBiuBiu~`;
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = `AiBiuBiuBiu~`;
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