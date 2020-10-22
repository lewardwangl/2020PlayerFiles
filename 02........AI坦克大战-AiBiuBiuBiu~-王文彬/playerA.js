window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");

    
    this.finals = 0 //决赛
    this.tank_wh = 50
    this.bullet_wh = 10
    
    this.tb_safe_min_dis = 150 // 坦克与子弹之间的安全距离
    this.tt_safe_min_dis = 110 // 坦克与坦克之间的安全距离 计算得来

    this.avoid_threshold_safe = 0.02    // 躲避时 低于此值 则为安全
    this.avoid_threshold_denger = 0.5   // 躲避时 如果高于此值 就很危险了 
    this.avoid_last_direct = undefined  // 最近一次躲避方向

    this.attack_threshold_fire = this.tank_wh * 1   // 进攻时 低于此值 便开火
    this.attack_threshold_chase = this.tank_wh * 8  // 进攻时 高于此值 便加速追击
    this.attack_want_fire_direct = undefined        // 进攻移动时 期望下次开火的方向
    
    this.attack_chase_count = 0           // 进攻 接近时 同一个方向追赶次数
    this.attack_chase_count_normal = 7    // 进攻 接近时 追赶多少次后开火
    this.attack_chase_direct = undefined  // 进攻 接近时 移动方向
    
    this.abbbp_count = 0                        // 步数编号
    this.abbbp_fire = 0                         // 当前是否需要开火
    this.abbbp_bullet_surplus = 0               // 子弹剩余数量
    this.abbbp_last_fire_index = 0              // 最近一次开火时的编号
    this.abbbp_last_fire_direct = undefined     // 最近一次开火时的方向

    this.avoid_predict_bullet_weight = 0.5      // 逃离时有近距离的坦克，预测其发射子弹对我造成的影响，采取比例  day1、day2都是0.25
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
    console.log("####### --------------------------------------------------------------",this.abbbp_count)

    var enemy_tanks = aTankCount
    var enemy_bullets = aBulletCount
    
    if (this.finals) { 
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
    
    this.abbb2_land(my_tank, my_bullets, enemy_tanks, enemy_bullets)
    this.#setName()
  }

  leave() {
    this.#setName()
    if (this.abbbp_fire) {
      this.abbbp_fire = 0
      if (this.abbbp_count > 30) {
        this.#fire();
        this.abbbp_last_fire_index = this.abbbp_count
        console.log("!!!fire!!!", this.abbbp_bullet_surplus)
      }
    }
  }

  /**
   * tank XY 表示左上角
   * bullet XY 表示中心
   * 画布 左上角（0,0） 右下角（screenX，screenY）
  */
  // 1017 新策略
  abbb2_land(my_tank, my_bullets, enemy_tanks, enemy_bullets) {
    if (!enemy_tanks || enemy_tanks.length == 0) { return }

    let direct = undefined

    // [逃离方向 危险系数]
    let avoid_res = this.abbb2_avoid(my_tank, enemy_bullets, enemy_tanks)
    if (avoid_res[0] != undefined) {
      direct = avoid_res[0]
      console.log("abbb2_land","attack_want_fire_direct=" + this.attack_want_fire_direct, "attack_chase_count=" + this.attack_chase_count, "abbbp_last_fire_direct=" + this.abbbp_last_fire_direct)
      if (avoid_res[1] == 0) {
        if (this.attack_want_fire_direct != undefined && this.attack_chase_count >= 2) {
          direct = this.attack_want_fire_direct
          this.abbbp_fire = 1
          this.attack_want_fire_direct = undefined
          this.attack_chase_count = 0
        }
      }
      if (direct == this.abbbp_last_fire_direct) { 
        this.abbbp_last_fire_direct = undefined
        this.abbbp_fire = 1 
      }
      console.log("####### 1 avoid #######",direct,this.abbbp_fire)
    }else {
      // [进击方向 是否开火]
      let att = this.abbb2_attack(my_tank, my_bullets, enemy_tanks)
      direct = att[1]
      this.abbbp_fire = att[0]
      if (this.abbbp_fire) {
        this.abbbp_last_fire_direct = direct
      }
      console.log("####### 2 attack #######",direct,this.abbbp_fire)
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
  abbb2_attack(my_tank, my_bullets, enemy_tanks) {

    const mt_x1 = my_tank.X + this.tank_wh / 2.0
    const mt_y1 = screenY - (my_tank.Y + this.tank_wh / 2.0)
    const that = this

    var min_dis_tanks = []

    enemy_tanks.forEach(ent => {
      let ent_x = ent.X + that.tank_wh / 2.0
      let ent_y = screenY - (ent.Y + that.tank_wh / 2.0)
      
      let pos_x = ent_x - mt_x1 
      let pos_y = ent_y - mt_y1
      let dis = Math.sqrt(Math.pow(pos_x, 2) + Math.pow(pos_y, 2))

      let new_ent = {
        dis: dis,
        x: ent_x,
        y: ent_y,
        pos_x: pos_x,
        pos_y: pos_y,
        direction: ent.direction 
      }
      for (let i = 0; i <= min_dis_tanks.length; i++) {
        let tmp = min_dis_tanks[i]
        if (!tmp || tmp.dis > new_ent.dis) {
          min_dis_tanks.splice(i, 0, new_ent)
          break
        }
      }
    })
    var min_dis_ent = min_dis_tanks[0]
    if (my_bullets.length > 0) {
      // 剔除可能被我命中的tank
      for (var i = 0; i < my_bullets.length; i++) {
        let my_b = my_bullets[i]
        let my_b_x = my_b.X
        let my_b_y = screenY - my_b.Y
        for (var j = 0; j < min_dis_tanks.length - 1; j++) {
          let min_t = min_dis_tanks[j]
          let tmp_pos = [min_t.x - my_b_x, min_t.y - my_b_y]
          let tmp_dir = that.abbbtool_vector_2_direct(tmp_pos)
          //console.log("min_t_xy" + min_t.x, min_t.y," tmp_pos=" + tmp_pos, " tmp_dir=" + tmp_dir, "my_b.d=" + my_b.direction)
          // 会不会太粗略了
          let min_min_t = min_dis_tanks[j + 1]
          if (min_min_t != undefined && min_min_t.dis < that.attack_threshold_chase) {
            if (tmp_dir == my_b.direction) {
              min_dis_tanks.splice(j, 1)
              break
            }
          }
        }
      }
    }
    if (min_dis_tanks.length > 0) {
      min_dis_ent = min_dis_tanks[0]
    }
    let min_dis = min_dis_ent.dis
    let move_x = min_dis_ent.pos_x
    let move_y = min_dis_ent.pos_y
    console.log("abbb2_attack","min dis ent move_xy=" + move_x, move_y, "min_dis=" + min_dis)

    var fire = 0
    var move_direction = undefined
    var type = ""
    if (this.finals) {
      let rock_move = this.abbbtool_detect_rock([mt_x1,mt_y1],[move_x,move_y],1)
      move_x = rock_move[0]
      move_y = rock_move[1]
    }
    if (move_x != 0 || move_y != 0) {
      do {
        if (min_dis < this.tt_safe_min_dis) {
          // 远离他
          type = "avoid"
          /**
           *  逃跑策略1，180度旋转角度
          */
          // if (Math.abs(move_y) <= Math.abs(move_x)) {
          //   move_direction = (move_y > 0) ? this.#DIRECTION.DOWN : this.#DIRECTION.UP
          // }else if (Math.abs(move_y) > Math.abs(move_x)) {
          //   move_direction = (move_x > 0) ? this.#DIRECTION.LEFT : this.#DIRECTION.RIGHT
          // }
  
          /**
           * 逃跑策略2，假设当前敌人下次的方向和当前方向一致
          */
          let enb_radian = that.abbbtool_direct_2_radian(min_dis_ent.direction)
          let ent_vector = [Math.round(Math.cos(enb_radian)), Math.round(Math.sin(enb_radian))]        
          let inner = min_dis_ent.pos_x * ent_vector[0] + min_dis_ent.pos_y * ent_vector[1]
          let outer = min_dis_ent.pos_x * ent_vector[1] - min_dis_ent.pos_y * ent_vector[0]
          if (inner < 0) {
            let tmp_radian = enb_radian + (Math.sign(outer) * (Math.PI / 2))
            move_direction = this.abbbtool_radian_2_direct(tmp_radian)
            break
          }
          // 继续打他
        }

        let chase_count_weight = 1
        if (min_dis > this.attack_threshold_chase) {
          // 使劲追
          type = "fast_chase"
          if (Math.abs(move_y) > Math.abs(move_x)) {
            move_direction = (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
          }else {
            move_direction = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
          }
          chase_count_weight = 0.2
          this.attack_want_fire_direct = move_direction
        }else {
          // 射击范围内
          type = "fire"
          let can_fire = (this.abbbp_count - this.abbbp_last_fire_index > 5) ? 1 : 0
          if (Math.abs(move_x) < this.attack_threshold_fire && can_fire) {
            move_direction = (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
            fire = 1
            this.attack_chase_direct = undefined
            break
          }else if (Math.abs(move_y) < this.attack_threshold_fire && can_fire) {
            move_direction = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
            fire = 1
            this.attack_chase_direct = undefined
            break
          }else {
            // 靠近
            type = "slow_chase"
            if (Math.abs(move_y) > Math.abs(move_x) || this.abbbp_count < 30) {
              move_direction = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
              this.attack_want_fire_direct = (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
            }else if (Math.abs(move_y) <= Math.abs(move_x)) {
              move_direction = (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
              this.attack_want_fire_direct = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
            } 
          }
        }
        if (this.abbbp_count < 25) {
          break  
        }

        if (move_direction != undefined && this.attack_chase_direct == move_direction) {
          this.attack_chase_count += chase_count_weight
        }else {
          this.attack_chase_count = 0
        }
        this.attack_chase_direct = move_direction
        if (this.attack_chase_count >= this.attack_chase_count_normal && this.attack_want_fire_direct != undefined) {
          type += "_change"
          this.attack_chase_count = 0
          fire = 1
          move_direction = this.attack_want_fire_direct
        }
      }while(0)
      if (this.abbbp_count < 300 && fire && Math.random() < 0.2 && (mt_y1 / screenY) > 0.6) {
        type += "_idiot"
        move_direction = (mt_x1 < screenX / 2.0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
      }
      console.log("abbb2_attack","final ~~~~", type, "move_direction=" + move_direction, "fire=" + fire, "chase_direct=" + this.attack_chase_direct, "count=" + this.attack_chase_count)
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
    var max_move_xy = undefined
    var has_too_close_bullets = 0

    console.log("abbb2_avoid","my_xy=",mt_x1,mt_y1)

    //let detection_dis_x = (enemy_tanks.length == 1) ? 0.2 * that.tank_wh : 3 * that.tank_wh       // 左右边界
    //let detection_dis_y = (enemy_tanks.length == 1) ? 0.2 * that.tank_wh : 3 * that.tank_wh       // 上下边界
    //const wall_weight_y = 1
    const edges = this.abbbtool_wall_edge(enemy_tanks) // 上 右 下 左
    const wall_weight = 1
    console.log("edgesedgesedges",edges)
    /** -------- 墙 -------- */ 
    function aloof_wall() {
      let wall_move_x = 0
      let wall_move_y = 0
      let x_scale = 0
      let y_scale = 0
      if ((mt_x1 - h1) < edges[3]) {
        x_scale = 1 - Math.pow((mt_x1 - h1) / edges[3], 2)
      }else if ((mt_x1 + h1) > (screenX - edges[1])) {
        x_scale = -1 * (1 - Math.pow(((screenX - (mt_x1 + h1)) / edges[1]), 2))
      }
      if ((mt_y1 - h1) < edges[2]) {
        y_scale = 1 - Math.pow((mt_y1 - h1) / edges[2], 2)
      }else if ((mt_y1 + h1) > (screenY - edges[0])) {
        y_scale = -1 * (1 - Math.pow((screenY - (mt_y1 + h1)) / edges[0], 2))
      }
      wall_move_x = x_scale * wall_weight
      wall_move_y = y_scale * wall_weight
      return [wall_move_x, wall_move_y]
    }
    /** -------- 墙 END -------- */ 

    /** -------- 远离每一颗子弹 -------- */ 
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
          //if (Math.abs(tmp_move_x) >= that.avoid_threshold_safe || Math.abs(tmp_move_y) >= that.avoid_threshold_safe) {
            let denger = (tank_time[0] <= 0 || Math.max(Math.abs(tmp_move_x), Math.abs(tmp_move_y)) > that.avoid_threshold_denger) ? 1 : 0
            return [denger, tmp_move_x, tmp_move_y]
          //}
        }
      }
      return undefined
    }
    /** -------- 远离每一颗子弹 END -------- */ 

    let type = ""
    let wall = aloof_wall()
    if (wall[0] != 0 || wall[1] != 0) { 
      type = "wall"
      if (wall_weight < (wall[0] + 0.01) || wall_weight < (wall[1] + 0.01)) {
        this.avoid_last_direct = undefined
      }
      console.log("abbb2_avoid","aloof_wall",wall,mt_x1,mt_y1,screenX,screenY)
    }
    move_x += wall[0]
    move_y += wall[1]

    enemy_bullets.forEach(enb => {
      let r = avoid_one(enb)
      if (r) {
        has_too_close_bullets += r[0]
        if (max_move_xy == undefined || (Math.abs(max_move_xy[0]) < Math.abs(move_x) || Math.abs(max_move_xy[1]) < Math.abs(move_y))) {
          max_move_xy = [move_x, move_y]
        }
        move_x += r[1]
        move_y += r[2]
      }
    })
    if (max_move_xy != undefined && this.has_too_close_bullets > 0) {
      if ((max_move_xy[0] * move_x + max_move_xy[1] * move_y) > 0) {
        type += "#used_max"
        console.log("abbb2_avoid", "xxxx max_move_xy=" + max_move_xy, "move_xy="+move_x,move_y)
        move_x = max_move_xy[0]
        move_y = max_move_xy[1]
      }
    }
    var move_direction = undefined
    //if (move_x != 0 || move_y != 0) {
    if (has_too_close_bullets || (Math.abs(move_x) >= this.avoid_threshold_safe || Math.abs(move_y) >= this.avoid_threshold_safe)) {

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
          move_x += that.avoid_predict_bullet_weight * r[1]
          move_y += that.avoid_predict_bullet_weight * r[2]
        }
      })
      if (predict_bullets > 0) {
        if (max_move_xy != undefined && this.has_too_close_bullets > 0) {
          if ((max_move_xy[0] * move_x + max_move_xy[1] * move_y) > 0) {
            type += "#used_max2"
            console.log("abbb2_avoid", "xxxx2 max_move_xy=" + max_move_xy, "move_xy="+move_x,move_y)
            move_x = max_move_xy[0]
            move_y = max_move_xy[1]
          }
        }
      }
      if (this.finals) {
        let rock_move = this.abbbtool_detect_rock([mt_x1, mt_y1],[move_x, move_y],0)
        move_x = rock_move[0]
        move_y = rock_move[1]
      }
      if (Math.abs(move_x) > Math.abs(move_y)) {
        move_direction = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
      }else {
        move_direction = (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
      }
    }
    // else {
    //   if (has_too_close_bullets) {  
    //     move_direction = this.#DIRECTION.STOP
    //   }
    // }
    if (has_too_close_bullets == 0) {
      if (move_direction != undefined && this.avoid_last_direct != undefined) {
        if (move_direction != this.#DIRECTION.STOP) {
          if (Math.abs(this.avoid_last_direct - move_direction) == 2) {
            type += "#used_last_direct"
            move_direction = this.avoid_last_direct
          }
        }
      }
      this.avoid_last_direct = move_direction
    }else {
      this.avoid_last_direct = undefined
    }
    console.log("abbb2_avoid final ==== ",type, "move_xy=" + move_x, move_y, "direct="+move_direction , "too_close_b=" + has_too_close_bullets)
    return [move_direction, has_too_close_bullets]
  }

  abbbtool_wall_edge(enemy_tanks) {
    // 上 右 下 左
    let tank_nbs = [0,0,0,0]
    let max_edge = 2.5 * this.tank_wh
    enemy_tanks.forEach(ent => {
      let ent_x = ent.X + this.tank_wh / 2.0
      let ent_y = screenY - (ent.Y + this.tank_wh / 2.0)
      if (ent_y > (screenY - max_edge)) {
        tank_nbs[0] += 1
      }else if (ent_y < max_edge) {
        tank_nbs[2] += 1
      }
      if (ent_x > (screenX - max_edge)) {
        tank_nbs[1] += 1
      }else if (ent_x < max_edge) {
        tank_nbs[3] += 1
      }
    });
    for (let i = 0; i < tank_nbs.length; i++) {
      let x = Math.min(3,tank_nbs[i])
      x = (x == 1 ? 0.5 : x)
      tank_nbs[i] = x * this.tank_wh * 0.70
    }
    return tank_nbs
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
      angle = 270
    }
    return angle
  }

  abbbtool_radian_2_direct(radian) {
    let direct = undefined
    let angle = Math.round((2 * (2 * Math.PI + radian) / Math.PI) % 4)
    if (angle == 0) {
      direct = this.#DIRECTION.RIGHT
    }else if (angle == 1) {
      direct = this.#DIRECTION.UP
    }else if (angle == 2) {
      direct = this.#DIRECTION.LEFT
    }else if (angle == 3) {
      direct = this.#DIRECTION.DOWN
    }
    return direct
  }

  abbbtool_direct_2_radian(direct) {
    let angle = this.abbbtool_direct_2_angle(direct)
    return angle / 180 * Math.PI
  }

  abbbtool_vector_2_direct(v) {
    let move_x = v[0]
    let move_y = v[1]
    let move_direction = undefined
    if (Math.abs(move_x) > 3 * Math.abs(move_y)) {
      move_direction = (move_x > 0) ? this.#DIRECTION.RIGHT : this.#DIRECTION.LEFT
    }else if (Math.abs(move_y) > 3 * Math.abs(move_x)) {
      move_direction =  (move_y > 0) ? this.#DIRECTION.UP : this.#DIRECTION.DOWN
    }
    return move_direction
  }

  /**
   * 石头 [400, 149.25, 100, 100]
   *      左上角        宽高
  */
  abbbtool_detect_rock(tank_center, move_vector, attack) {
    const rocks = ametal

    if (rocks != undefined) {

      const rock_wh = 100
      const rock_h1 = rock_wh / 2.0
      const gap = this.tank_wh * 0.4 // tank 和 rock 边边的间隙
      const max_gap = rock_h1 + gap + this.tank_wh / 2.0

      for (let i = 0; i < rocks.length; i++) {
        let rock = rocks[i]
        let r_center_x = rock[0] + rock_h1
        let r_center_y = (screenY - rock[1]) - rock_h1
        let v_x = tank_center[0] - r_center_x
        let v_y = tank_center[1] - r_center_y
        if (Math.abs(v_x) <= max_gap && Math.abs(v_y) <= max_gap) {
          let inner = move_vector[0] * v_x + move_vector[1] * v_y
          console.log("abbbtool detect rock","tank_center"+tank_center,"move_vector"+move_vector,"v_x"+v_x,"v_y"+v_y,"inner"+inner)
          if (inner <= 0) {
            if (Math.abs(v_x) < Math.abs(v_y)) {
              move_vector[1] = 0
              if (attack) {
                //move_vector[0] = (tank_center[0] > r_center_x) ? 1 : -1
                move_vector[0] = Math.sign(move_vector[0]) * 1
              }
            }else if (Math.abs(v_x) > Math.abs(v_y)) {
              move_vector[0] = 0
              if (attack) {
                //move_vector[1] = (tank_center[1] > r_center_y) ? 1 : -1
                move_vector[1] = Math.sign(move_vector[1]) * 1
              }
            }
          }
          break
        }
      }
    }

    return move_vector
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
        debugger
        if(x>metal[i][0] - r && x < metal[i][0] + metal[i][2] && y > metal[i][1]-r && y<metal[i][1] + metal[i][3])
        {
          return true
        }
      }
    }
    return false
  }
})("A");