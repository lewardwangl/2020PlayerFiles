window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;

    this.tank_wh = 50
    this.bullet_wh = 10
    this.tb_safe_min_dis = 200
    this.tt_safe_min_dis = 110 // 计算得来
    this.abbbp_fire = 0
    this.abbbp_bullet_surplus = 0
    this.abbbp_last_attack_direct = undefined
    this.abbbp_count = 0
  }

  land() {
    var a_tank = undefined
    var b_tank = undefined
    aMyTankCount.forEach(c => {
      if(c['id'] == 100) { a_tank = c }
      if(c['id'] == 200) { b_tank = c }
    });
    
    const my_tank = this.type === "A" ? a_tank : b_tank
    const my_bullets = this.type === "A" ? aMyBulletCount1 : aMyBulletCount2
    this.abbbp_bullet_surplus = 5 - my_bullets.length
    
    if (!my_tank) return;
    this.abbbp_count += 1
    //console.log("abbb_count--------------------------------------------------------------", abbb_count,this.abbbp_count)

    var enemy_tanks = aTankCount
    var enemy_bullets = aBulletCount
    
    let finals = 0
    if (finals) { 
      do {
        const other_tank = this.type === "B" ? a_tank : b_tank
        const other_bullets = this.type === "B" ? aMyBulletCount1 : aMyBulletCount2
        if (!other_tank) break

        enemy_bullets = enemy_bullets.slice()
        enemy_tanks = enemy_tanks.slice()
        enemy_tanks.push(other_tank)
        enemy_bullets = enemy_bullets.concat(other_bullets)
      } while(0)
    }

    this.abbb2_land(my_tank, enemy_bullets, enemy_tanks)
    this.#setName()
  }

  leave() {
    this.#setName()
    if (this.abbbp_fire) {
      this.abbbp_fire = 0
      var c = (new Date()).valueOf()
      if (this.abbbp_count <= 30 || (c - this.firetimestamp > 500)) {
        this.firetimestamp = c
        this.#fire();
        console.log("fire")
      }
    }
  }

  /**
   * tank XY 表示左上角
   * bullet XY 表示中心
   * 画布 左上角（0,0） 右下角（screenX，screenY）
  */
  // 1017 新策略
  abbb2_land(my_tank, enemy_bullets, enemy_tanks) {
    let direct = undefined

    if (this.abbbp_count < 30) {
      let idiot = this.abbb2_idiot_attack()
      direct = idiot[1]
      this.abbbp_fire = idiot[0]
      console.log("####### 1 idiot attack #######")
    }else {
      direct = this.abbb2_avoid(my_tank, enemy_bullets, enemy_tanks)
      if (direct == undefined) {
        let att = this.abbb2_attack(my_tank, enemy_tanks)
        direct = att[1]
        this.abbbp_fire = att[0]
        console.log("####### 2 attack #######")
      }else {
        if (direct == this.abbbp_last_attack_direct) { this.abbbp_fire = 1 }
        console.log("####### 3 avoid #######")
      }
    }

    if (this.abbbp_fire) {
      this.abbbp_last_attack_direct = direct
    }

    this.#move(direct)
  }

  abbb2_idiot_attack() {
    let fire = 0
    let move_dir = this.type === "A" ? this.#DIRECTION.LEFT : this.#DIRECTION.RIGHT
    if (this.abbbp_count > 20 && this.abbbp_count % 3 == 0) {
      fire = 1
      move_dir = this.#DIRECTION.UP
    }
    return [fire , move_dir]
  }

  // 1017 进攻
  abbb2_attack(my_tank, enemy_tanks) {

    const mt_x1 = my_tank.X + this.tank_wh / 2.0
    const mt_y1 = screenY - (my_tank.Y + this.tank_wh / 2.0)
    const mt_direct = my_tank.direction
    const that = this
    
    var move_x = 0
    var move_y = 0
    var fire = 0
    var min_dis = screenY * screenY
    console.log("abbb2_attack","my_xy=",mt_x1,mt_y1)
    enemy_tanks.forEach(ent => {
      // console.log("-------------------------------")
      let ent_x = ent.X + that.tank_wh / 2.0
      let ent_y = screenY - (ent.Y + that.tank_wh / 2.0)
      
      let pos_x = ent_x - mt_x1 
      let pos_y = ent_y - mt_y1
      let dis = Math.sqrt(Math.pow(pos_x, 2) + Math.pow(pos_y, 2))
      if (dis < min_dis) {
        min_dis = dis
        move_x = pos_x
        move_y = pos_y
      }
      // console.log("abbb2_attack","pos_xy=",pos_x,pos_y)
      // move_x += pos_x * (1 / dis)
      // move_y += pos_y * (1 / dis)
    })
    console.log("abbb2_attack","move_xy=",move_x,move_y," min_dis="+min_dis)
    var move_direction = undefined
    if (move_x != 0 || move_y != 0) {
      if (min_dis < this.tt_safe_min_dis) {
        move_x = -1 * move_x
        move_y = -1 * move_y
        fire = 0
      }else {
        fire = 1
      }
      if (Math.abs(move_x) > Math.abs(move_y)) {
        if (move_x > 0) {
          move_direction = this.#DIRECTION.RIGHT
        }else {
          move_direction = this.#DIRECTION.LEFT
        }
      }else {
        if (move_y > 0) {
          move_direction = this.#DIRECTION.UP
        }else {
          move_direction = this.#DIRECTION.DOWN
        }
      }
      console.log("abbb2_attack","move_direction=",move_direction," min_dis=" + min_dis)
    }else {
      move_direction = this.#DIRECTION.STOP
    }
    return [fire, move_direction]
  }

  // 1017 躲子弹
  abbb2_avoid(my_tank, enemy_bullets, enemy_tanks) {
    const h1 = this.tank_wh / 2.0
    const h2 = this.bullet_wh / 2.0

    const mt_x1 = my_tank.X + h1
    const mt_y1 = screenY - (my_tank.Y + h1)
    const that = this

    const mt_a = [mt_x1 - h1, mt_y1 + h1]
    const mt_b = [mt_x1 + h1, mt_y1 + h1]
    const mt_c = [mt_x1 - h1, mt_y1 - h1]
    const mt_d = [mt_x1 + h1, mt_y1 - h1]

    var move_x = 0
    var move_y = 0
    var has_too_close_bullets = 0

    console.log("abbb2_avoid","my_xy=",mt_x1,mt_y1)

    function aloof_wall() {
      const detection_dis = 2 * 50
      const wall_weight = 2
      let wall_move_x = 0
      let wall_move_y = 0
      if (mt_x1 < (detection_dis + h1)) {
        wall_move_x = (1 - (mt_x1 - h1) / detection_dis) * wall_weight
      }else if (mt_x1 > screenX - (detection_dis + h1)) {
        wall_move_x = -1 * (1 - (screenX - mt_x1 - h1) / detection_dis) * wall_weight
      }
      if (mt_y1 < (detection_dis + h1)) {
        wall_move_y = (1 - (mt_y1 - h1) / detection_dis) * wall_weight
      }else if (mt_y1 > screenY - (detection_dis + h1)) {
        wall_move_y = -1 * (1 - (screenY - mt_y1 - h1) / detection_dis) * wall_weight
      }
      return [wall_move_x, wall_move_y]
    }
    let wall = aloof_wall()
    if (wall[0] != 0 || wall[1] != 0) { 
      console.log("abbb2_avoid","aloof_wall",wall)
    }
    move_x += wall[0]
    move_y += wall[1]

    function avoid_one(enb) {
      let enb_x = enb.X
      let enb_y = screenY - enb.Y

      let enb_a = [enb_x - h2, enb_y + h2]
      let enb_b = [enb_x + h2, enb_y + h2]
      let enb_c = [enb_x - h2, enb_y - h2]
      let enb_d = [enb_x + h2, enb_y - h2]

      let enb_radian = that.abbbtool_direct_2_radian(enb.direction)

      let pos_x = enb_x - mt_x1 
      let pos_y = enb_y - mt_y1
      if ((enb.direction == that.#DIRECTION.RIGHT && pos_y > 0) || enb.direction == that.#DIRECTION.DOWN && pos_x <= 0) {
        pos_x = enb_a[0] - mt_d[0]
        pos_y = enb_a[1] - mt_d[1]
      }else if ((enb.direction == that.#DIRECTION.RIGHT && pos_y <= 0) || enb.direction == that.#DIRECTION.UP && pos_x <= 0) {
        pos_x = enb_c[0] - mt_b[0]
        pos_y = enb_c[1] - mt_b[1]
      }else if ((enb.direction == that.#DIRECTION.LEFT && pos_y > 0) || enb.direction == that.#DIRECTION.DOWN && pos_x > 0) {
        pos_x = enb_b[0] - mt_c[0]
        pos_y = enb_b[1] - mt_c[1]
      }else if ((enb.direction == that.#DIRECTION.LEFT && pos_y <= 0) || enb.direction == that.#DIRECTION.UP && pos_x > 0) {
        pos_x = enb_d[0] - mt_a[0]
        pos_y = enb_d[1] - mt_a[1]
      }

      let spd_x = Math.round(Math.cos(enb_radian))
      let spd_y = Math.round(Math.sin(enb_radian))
      
      let inner = pos_x * spd_x + pos_y * spd_y
      let outer = pos_x * spd_y - pos_y * spd_x
      //console.log("abbb2_avoid","inner=" + inner, "outer=" + outer)

      if (inner < 0 && Math.abs(outer) < that.tb_safe_min_dis) {
        console.log("abbb2_avoid","-------pos_xy=",pos_x,pos_y, "spd_xy=", spd_x,spd_y,"bullet_xy=", enb_x, enb_y, "direct=" + enb.direction," radian=" + enb_radian)
        // 预测可能命中我的子弹
        let tank_way = 0
        let bullet_way = 0
        if (enb.direction == that.#DIRECTION.LEFT || enb.direction == that.#DIRECTION.RIGHT) {
          tank_way = Math.abs(enb_y - mt_y1)
          bullet_way = Math.abs(enb_x - mt_x1)
        }else {
          tank_way = Math.abs(enb_x - mt_x1)
          bullet_way = Math.abs(enb_y - mt_y1)
        }
        let tank_time = [Math.ceil((tank_way - (h1 + h2)) / my_tank.speed) , 
                         Math.ceil((tank_way + (h1 + h2)) / my_tank.speed)]
        let bullet_time = [Math.ceil((bullet_way - (h1 + h2)) / enb.speed) , 
                           Math.ceil((bullet_way + (h1 + h2)) / enb.speed)]
        console.log("abbb2_avoid", "tank_time=" + tank_time[0], tank_time[1], "  bullet_time=" + bullet_time[0], bullet_time[1])
        if (tank_time[0] > 1 && (tank_time[0] > bullet_time[1] || tank_time[1] < bullet_time[0])) {
          // 无法命中
        }else {
          let tmp_dir = enb_radian + (Math.sign(outer) * (Math.PI / 2))
          let tmp_dis = Math.pow(pos_x, 2) + Math.pow(pos_y, 2)
          let tmp_move_x = Math.round(Math.cos(tmp_dir)) * (10000 / tmp_dis)
          let tmp_move_y = Math.round(Math.sin(tmp_dir)) * (10000 / tmp_dis)
          console.log("abbb2_avoid", "tmp_move_xy=" + tmp_move_x, tmp_move_y)
          return [1, tmp_move_x, tmp_move_y]
        }
      }
      return undefined
    }
    enemy_bullets.forEach(enb => {
      let r = avoid_one(enb)
      if (r) {
        has_too_close_bullets += r[0]
        move_x += r[1]
        move_y += r[2]
      }
    })

    var move_direction = undefined
    if (move_x != 0 || move_y != 0) {

      // 防止逃跑到坦克堆里
      var predict_bullets = []
      enemy_tanks.forEach(ent => {
        let ent_x = ent.X + that.tank_wh / 2.0
        let ent_y = screenY - (ent.Y + that.tank_wh / 2.0)
        let dis = Math.sqrt(Math.pow(ent_x - mt_x1, 2) + Math.pow(ent_y - mt_y1, 2))
        if (dis < this.tt_safe_min_dis) {
          for (let nb_i = 0; nb_i < 4; nb_i++) {
            var nb = {}
            var nb_x = 0
            var nb_y = 0
            if(nb_i == that.#DIRECTION.UP) {
              nb_x = ent_x + 0;
              nb_y = ent_y + 30;
            }else if(nb_i == that.#DIRECTION.RIGHT) {
              nb_x = ent_x + 30;
              nb_y = ent_y + 0;
            }else if(nb_i == that.#DIRECTION.DOWN) {
              nb_x = ent_x + 0;
              nb_y = ent_y - 30;
            }else if(nb_i == that.#DIRECTION.LEFT) {
              nb_x = ent_x - 30;
              nb_y = ent_y + 0;
            }
            nb.direction = nb_i
            nb.X = nb_x
            nb.Y = screenY - nb_y
            nb.speed = 10
            predict_bullets.push(nb)
          }
        }
      })
      console.log("abbb2_avoid", "predict_bullets----", predict_bullets)
      predict_bullets.forEach(enb => {
        let r = avoid_one(enb)
        if (r) {
          has_too_close_bullets += r[0]
          move_x += 0.25 * r[1]
          move_y += 0.25 * r[2]
        }
      })

      if (Math.abs(move_x) > Math.abs(move_y)) {
        if (move_x > 0) {
          move_direction = this.#DIRECTION.RIGHT
        }else {
          move_direction = this.#DIRECTION.LEFT
        }
      }else {
        if (move_y > 0) {
          move_direction = this.#DIRECTION.UP
        }else {
          move_direction = this.#DIRECTION.DOWN
        }
      }
    }else {
      if (has_too_close_bullets) {  
        move_direction = this.#DIRECTION.STOP
      }
    }
    console.log("abbb2_avoid final ==== ", "move_xy=" + move_x, move_y, "direct="+move_direction)
    return move_direction
  }

  abbbtool_direct_2_angle(direct) {
    let angle = 0
    if (direct == this.#DIRECTION.RIGHT) {
      angle = 0
    }else if (direct == this.#DIRECTION.UP) {
      angle = 90
    }else if (direct == this.#DIRECTION.LEFT) {
      angle = 180
    }else if (direct == this.#DIRECTION.DOWN) {
      angle = -90
    }
    return angle
  }

  abbbtool_direct_2_radian(direct) {
    let angle = this.abbbtool_direct_2_angle(direct)
    return angle / 180 * Math.PI
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
    ).value = "AiBiuBiuBiu~"
    document.getElementById(
      `Player${this.type === "A" ? 1 : 2}Name`
    ).textContent = "AiBiuBiuBiu~"
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