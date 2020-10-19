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
        this.#setName();
        // 当前的坦克实例
        var cur = undefined
        var enr = undefined
        aMyTankCount.forEach(element => {
            var c = element
            if (c['id'] == 200) {
                cur = c
            }
            if (c['id'] == 100) {
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
        const cx = canvas.width / 2;
        const cy = canvas.height / 2

        // 躲AI子弹
        let Bullet = new Array(this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP, this.#DIRECTION.STOP,);

        this.#calcBulletDistance(enemyBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
        // this.#calcBulletDistance(eBullets, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH)
        moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
        // let isMovew = false;
        //         // for (let i = 0; i < Bullet.length; i++) {
        //         //     if (i != 6 && Bullet[i] == this.#DIRECTION.STOP) {
        //         //         isMovew = true;
        //         //         break;
        //         //     }
        //         // }
        //         // if (enemyTanks.length > 10) {
        if (Bullet[2] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP && Bullet[7] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP
        // Bullet[0] == this.#DIRECTION.STOP && Bullet[1] == this.#DIRECTION.STOP &&
        // Bullet[2] == this.#DIRECTION.STOP && Bullet[3] == this.#DIRECTION.STOP &&
        // Bullet[4] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP &&
        // Bullet[7] == this.#DIRECTION.STOP && Bullet[8] == this.#DIRECTION.STOP &&
        // Bullet[9] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP &&
        // Bullet[11] == this.#DIRECTION.STOP && Bullet[12] == this.#DIRECTION.STOP &&
        // Bullet[13] == this.#DIRECTION.STOP && Bullet[14] == this.#DIRECTION.STOP &&
        // Bullet[15] == this.#DIRECTION.STOP && Bullet[16] == this.#DIRECTION.STOP &&
        // Bullet[17] == this.#DIRECTION.STOP && Bullet[18] == this.#DIRECTION.STOP &&
        // Bullet[19] == this.#DIRECTION.STOP && Bullet[20] == this.#DIRECTION.STOP
        ) {
            moveDirection = this.findTactics(currentTankWH, currentTankX, currentTankY, enemyTanks, enemyTank, Bullet, moveDirection, currentTankDirect, cx, cy);

        }
//     } else {
//     var c = (new Date()).valueOf()
//     if (c - this.firetimestamp > 100) {
//     this.firetimestamp = c
//     this.#fire();
//     document.onkeyup(this.#fireEv);
// }
        // } else {
        // moveDirection = this.findTactics(currentTankWH, currentTankX, currentTankY, enemyTanks, enemyTank, Bullet, moveDirection, currentTankDirect, cx, cy);
        // }
        // moveDirection = this.#avoidBullet(currentTankX, currentTankY, currentTankWH, Bullet, moveDirection)
        this.#move(moveDirection);
        if (undefined != moveDirection) {
            console.log(moveDirection)
        }
    }
    // findTacticsNew(currentTankWH, currentTankX, currentTankY, enemyTanks, enemyTank, Bullet, moveDirection, currentTankDirect, cx, cy) {
    //     return;
    // }

    findTactics(currentTankWH, currentTankX, currentTankY, enemyTanks, enemyTank, Bullet, moveDirection, currentTankDirect, cx, cy) {
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

            if (secruitydistance > dis && enemyTanks.length >= 4)///需要优化
            {
                escapenum++//逃亡系数，大了就要跑
            }
            if (misDistanceOfEnemy > dis) {
                misDistanceOfEnemy = dis;
                lateEnemy = enemy;//寻找最近的敌
            }
        }
        // if (undefined != enemyTank) {
        //     const enemydis = this.#calcTwoPointDistance(
        //         currentTankX,
        //         currentTankY,
        //         enemyTank.X,
        //         enemyTank.Y
        //     );
        //     if (enemydis < misDistanceOfEnemy) {
        //         lateEnemy = enemyTank;
        //         firedirectdis = 1
        //         escapedir = 1
        //         fight = 3
        //     }
        // }
        if (secruitylevel <= 2 && undefined != enemyTank)//是否可以加速打电脑
        {
            firedirectdis = 3//炮击系数
            escapedir = 3//逃跑系数
            fight = 4
        }

        if (secruitylevel <= 1) {
            firedirectdis = 3//炮击系数
            escapedir = 1//逃跑系数
            fight = 0
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
                if (/*(disX > fight * currentTankWH || disY > fight * currentTankWH) && */dis >= fight * currentTankWH) {//追击
                    if ((disX <= disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
                        moveDirection = this.#DIRECTION.UP;
                    } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
                        moveDirection = this.#DIRECTION.DOWN;
                    } else if ((disX >= disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
                        moveDirection = this.#DIRECTION.RIGHT;
                    } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
                        moveDirection = this.#DIRECTION.LEFT;
                    }

                    console.log("战术前进", moveDirection)
                }
                else if (/*(disX < escapedir * currentTankWH || disY < escapedir * currentTankWH) ||*/ dis < escapedir * currentTankWH) {//逃跑

                    if ((disX <= disY) && (lateEnemy.Y < currentTankY) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
                        moveDirection = this.#DIRECTION.DOWN;
                    } else if ((disX < disY) && (lateEnemy.Y >= currentTankY) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
                        moveDirection = this.#DIRECTION.UP;
                    } else if ((disX >= disY) && (lateEnemy.X >= currentTankX) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
                        moveDirection = this.#DIRECTION.LEFT;
                    } else if ((disX > disY) && (lateEnemy.X < currentTankX) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
                        moveDirection = this.#DIRECTION.RIGHT
                    }
                    console.log("战术撤退", moveDirection)
                }
                for (let i = 0; i < enemyTanks.length; i++) {
                    let dis = this.#calcTwoPointDistance(currentTankX, currentTankY, enemyTanks[i].X, enemyTanks[i].Y)
                    if (dis <= currentTankWH * 8 && (enemyTanks[i].X <= currentTankX + currentTankWH && enemyTanks[i].X >= currentTankX - currentTankWH) || (enemyTanks[i].Y <= currentTankY + currentTankWH && enemyTanks[i].Y >= currentTankY - currentTankWH)) {
                        // (enemyTank.X <= currentTankX + currentTankWH && enemyTank.X >= currentTankX - currentTankWH) || (enemyTank.Y <= currentTankY + currentTankWH && enemyTank.Y >= currentTankY - currentTankWH)
                        var c = (new Date()).valueOf()
                        if (c - this.firetimestamp > 100) {
                            this.firetimestamp = c
                            this.#fire();
                            console.log("战术开枪")
                            document.onkeyup(this.#fireEv);
                        }
                    }
                // var c = (new Date()).valueOf()
                // if (c - this.firetimestamp > 100) {
                //     this.firetimestamp = c
                //     this.#fire();
                //     document.onkeyup(this.#fireEv);
                }
            }
        }
        else if (escapenum >= 4) {
            if (cy > currentTankY && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.STOP == Bullet[11]) {
                moveDirection = this.#DIRECTION.DOWN;
            } else if (cy > currentTankY && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[3]) {
                moveDirection = this.#DIRECTION.UP;
            } else if (cx < currentTankX && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[4] && this.#DIRECTION.STOP == Bullet[9]) {
                moveDirection = this.#DIRECTION.LEFT;
            } else if (cx > currentTankX && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[7] && this.#DIRECTION.STOP == Bullet[11]) {
                moveDirection = this.#DIRECTION.RIGHT
            }
            //document.onkeyup(this.#fireEv);
            console.log("中央逃逸", moveDirection)
        }
        this.#setName();
        this.priority = moveDirection;
        return moveDirection;
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
             13 0 14
         15  1  2  3 16
         04  5  6  7 08
         17  9 10 11 18
           19 12 20
        */

        if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.DOWN == Bullet[0]) { //必须左右移动
            let turnleft = false;
            let turnright = false;
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
            ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[13] && this.#DIRECTION.UP != Bullet[19] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] /*&& moveDirection != this.#DIRECTION.RIGHT*/) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
                // ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.DOWN != Bullet[14] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.UP != Bullet[20] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7] && moveDirection == this.#DIRECTION.RIGHT) {
                //     moveDirection = this.#DIRECTION.RIGHT;
                //     console.log("上方来子弹，左右没子弹，原来方向为右，走右")
                //
                // }
                // console.log("上方来子弹走左")
                // moveDirection = this.#DIRECTION.LEFT;
                turnleft = true;

            }
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
            ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.DOWN != Bullet[14] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.UP != Bullet[20] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7] /*&& moveDirection != this.#DIRECTION.LEFT*/) {
                // if (this.priority == this.#DIRECTION.RIGHT && turnleft == true) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
                // ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[13] && this.#DIRECTION.UP != Bullet[19] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] && moveDirection == this.#DIRECTION.LEFT) {
                //     moveDirection = this.#DIRECTION.LEFT;
                //     console.log("上方来子弹，左右没子弹，原来方向为左，走左")
                //
                // }
                turnright = true;
                // console.log("上方来子弹走右")
                // moveDirection = this.#DIRECTION.RIGHT;
                // }
            }
            if (turnleft == true && turnright == false) {
                moveDirection = this.#DIRECTION.LEFT;
                console.log("上方来子弹，右边不能走走左")
            } else if (turnleft == false && turnright == true) {
                moveDirection = this.#DIRECTION.RIGHT;
                console.log("上方来子弹，左边不能走走右")
            } else if (turnright == true && turnleft == true) {
                if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                    moveDirection = this.#DIRECTION.RIGHT;
                    console.log("上方来子弹，两边都能走原来右上，走右")
                } else {
                    moveDirection = this.#DIRECTION.LEFT;
                    console.log("上方来子弹，两边都能走原来左下，走左")
                }

            }

            else {
                if (this.#DIRECTION.STOP == Bullet[5] && this.#DIRECTION.STOP == Bullet[7]) {
                    if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                        moveDirection = this.#DIRECTION.RIGHT;
                        console.log("上方来子弹，危险状况，两边能走原来右上，走右")
                    } else {
                        moveDirection = this.#DIRECTION.LEFT;
                        console.log("上方来子弹，危险状况，两边能走原来左下，走左")
                    }
                    return;
                }
                if (this.#DIRECTION.STOP == Bullet[5]) {
                    moveDirection = this.#DIRECTION.LEFT;
                    console.log("上方来子弹，危险状况，走左")
                }
                if (this.#DIRECTION.STOP == Bullet[7]) {
                    moveDirection = this.#DIRECTION.RIGHT;
                    console.log("上方来子弹，危险状况，走右")
                }
                else {
                    moveDirection = this.#DIRECTION.DOWN;
                    console.log("上方，水平无法躲避")
                }
                // moveDirection = this.#DIRECTION.DOWN
                // console.log("上方，水平无法躲避")
            }
        }
        if ((this.#DIRECTION.UP == Bullet[10] || this.#DIRECTION.UP == Bullet[12])) { //考虑左右移动
            let turnleft = false;
            let turnright = false;
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
            ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[13] && this.#DIRECTION.UP != Bullet[19] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] /*&& moveDirection != this.#DIRECTION.RIGHT*/) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
                // ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.DOWN != Bullet[14] && this.#DIRECTION.UP != Bullet[20] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7] && moveDirection == this.#DIRECTION.RIGHT) {
                //     moveDirection = this.#DIRECTION.RIGHT;
                //     console.log("下方来子弹，左右没子弹，原来方向为左，走右")
                //
                // }
                // console.log("下方来子弹走左")
                // moveDirection = this.#DIRECTION.LEFT;
                turnleft == true;

            }
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
            ) && this.#DIRECTION.DOWN != Bullet[3] && this.#DIRECTION.DOWN != Bullet[14] && this.#DIRECTION.UP != Bullet[20] && this.#DIRECTION.UP != Bullet[11] && this.#DIRECTION.LEFT != Bullet[8] && this.#DIRECTION.STOP == Bullet[7]  /*&& moveDirection != this.#DIRECTION.LEFT*/) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
                // ) && this.#DIRECTION.DOWN != Bullet[1] && this.#DIRECTION.DOWN != Bullet[13] && this.#DIRECTION.UP != Bullet[19] && this.#DIRECTION.UP != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.STOP == Bullet[5] && moveDirection == this.#DIRECTION.LEFT) {
                //     moveDirection = this.#DIRECTION.LEFT;
                //     console.log("下方来子弹，左右没子弹，原来方向为左，走左")
                //
                // }
                // if (this.priority == this.#DIRECTION.RIGHT && moveDirection == this.#DIRECTION.LEFT) {
                // }
                // console.log("下方来子弹走右")
                // moveDirection = this.#DIRECTION.RIGHT;
                turnright = true;
            }
            if (turnleft == true && turnright == false) {
                moveDirection = this.#DIRECTION.LEFT;
                console.log("下方来子弹，右边不能走走左")
            } else if (turnleft == false && turnright == true) {
                moveDirection = this.#DIRECTION.RIGHT;
                console.log("下方来子弹，左边不能走走右")
            } else if (turnright == true && turnleft == true) {
                if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                    moveDirection = this.#DIRECTION.RIGHT;
                    console.log("下方来子弹，两边都能走原来右上，走右")
                } else {
                    moveDirection = this.#DIRECTION.LEFT;
                    console.log("下方来子弹，两边都能走原来左下，走左")
                }

            }
            else {
                if (this.#DIRECTION.STOP == Bullet[5] && this.#DIRECTION.STOP == Bullet[7]) {
                    if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                        moveDirection = this.#DIRECTION.RIGHT;
                        console.log("下方来子弹，危险状况，两边能走原来右上，走右")
                    } else {
                        moveDirection = this.#DIRECTION.LEFT;
                        console.log("下方来子弹，危险状况，两边能走原来左下，走左")
                    }
                    return;
                }
                if (this.#DIRECTION.STOP == Bullet[5]) {
                    moveDirection = this.#DIRECTION.LEFT;
                    console.log("下方来子弹，危险状况，走左")
                }
                if (this.#DIRECTION.STOP == Bullet[7]) {
                    moveDirection = this.#DIRECTION.RIGHT;
                    console.log("下方来子弹，危险状况，走右")
                }
                else {
                    moveDirection = this.#DIRECTION.UP;
                    console.log("下方，水平无法躲避")
                }
                // moveDirection = this.#DIRECTION.UP
                // console.log("下方，水平警戒不适合移动")
            }
        }
        if (this.#DIRECTION.RIGHT == Bullet[4] || this.#DIRECTION.RIGHT == Bullet[5]) { //必须垂直移动
            let turnup = false;
            let turndown = false;
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
            ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.RIGHT != Bullet[15] && this.#DIRECTION.LEFT != Bullet[16] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0] /*&& moveDirection != this.#DIRECTION.DOWN*/) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
                // ) && this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.LEFT != Bullet[18] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12] && moveDirection == this.#DIRECTION.DOWN) {
                //     console.log("左方来子弹，上下没子弹，原来方向为下，走下")
                //     moveDirection = this.#DIRECTION.DOWN;
                //
                // }
                // console.log("左边来子弹走上")
                turnup = true;
                // moveDirection = this.#DIRECTION.UP;

            }
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
            ) && this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.LEFT != Bullet[18] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12] /*&& moveDirection != this.#DIRECTION.UP*/) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
                // ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.RIGHT != Bullet[15] && this.#DIRECTION.LEFT != Bullet[16] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0] && moveDirection == this.#DIRECTION.UP) {
                //     console.log("左方来子弹，上下没子弹，原来方向为上，走上")
                //     moveDirection = this.#DIRECTION.UP;
                // }
                // if (this.priority == this.#DIRECTION.DOWN && moveDirection == this.#DIRECTION.UP) {
                // console.log("左边来子弹走下")
                // moveDirection = this.#DIRECTION.DOWN;
                turndown = true

                // }
            }
            if (turnup == true && turndown == false) {
                moveDirection = this.#DIRECTION.UP;
                console.log("左方来子弹，下边不能走走上")
            } else if (turnup == false && turndown == true) {
                moveDirection = this.#DIRECTION.DOWN;
                console.log("左方来子弹，上边不能走走下")
            } else if (turnup == true && turndown == true) {
                if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                    moveDirection = this.#DIRECTION.UP;
                    console.log("左方来子弹，两边都能走原来右上，走上")
                } else {
                    moveDirection = this.#DIRECTION.DOWN;
                    console.log("左方来子弹，两边都能走原来左下，走下")
                }

            }


            else {
                if (this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[10]) {
                    if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                        moveDirection = this.#DIRECTION.UP;
                        console.log("左方来子弹，危险状况，两边能走原来右上，走上")
                    } else {
                        moveDirection = this.#DIRECTION.DOWN;
                        console.log("左方来子弹，危险状况，两边能走原来左下，走下")
                    }
                    return;
                }
                if (this.#DIRECTION.STOP == Bullet[2]) {
                    moveDirection = this.#DIRECTION.UP;
                    console.log("左方来子弹，危险状况，走上")
                }
                if (this.#DIRECTION.STOP == Bullet[10]) {
                    moveDirection = this.#DIRECTION.DOWN;
                    console.log("左方来子弹，危险状况，走下")
                }
                else {
                    moveDirection = this.#DIRECTION.RIGHT;
                    console.log("下方，水平无法躲避")
                }
                // moveDirection = this.#DIRECTION.RIGHT
                // console.log("左边，垂直无法躲避")
            }
        }
        if ((this.#DIRECTION.LEFT == Bullet[7] || this.#DIRECTION.LEFT == Bullet[8])) { //考虑垂直移动
            let turnup = false;
            let turndown = false;
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
            ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.RIGHT != Bullet[15] && this.#DIRECTION.LEFT != Bullet[16] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0]) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
                // ) && this.#DIRECTION.RIGHT != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.LEFT != Bullet[18] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12] && moveDirection == this.#DIRECTION.DOWN) {
                //     console.log("右方来子弹，上下没子弹，原来方向为下，走下")
                //     moveDirection = this.#DIRECTION.DOWN;
                //
                // }
                // console.log("右边来子弹走上")
                // moveDirection = this.#DIRECTION.UP;
                turnup = true;

            }
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
            ) && this.#DIRECTION.LEFT != Bullet[9] && this.#DIRECTION.RIGHT != Bullet[17] && this.#DIRECTION.LEFT != Bullet[18] && this.#DIRECTION.STOP == Bullet[10] && this.#DIRECTION.LEFT != Bullet[11] && this.#DIRECTION.UP != Bullet[12]) {
                // if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
                // ) && this.#DIRECTION.RIGHT != Bullet[1] && this.#DIRECTION.RIGHT != Bullet[15] && this.#DIRECTION.LEFT != Bullet[16] && this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.LEFT != Bullet[3] && this.#DIRECTION.DOWN != Bullet[0] && moveDirection == this.#DIRECTION.UP) {
                //     console.log("右方来子弹，上下没子弹，原来方向为上，走上")
                //     moveDirection = this.#DIRECTION.UP;
                //
                // }
                // console.log("右边来子弹走下")
                // moveDirection = this.#DIRECTION.DOWN;
                turndown = true;
            }
            if (turnup == true && turndown == false) {
                moveDirection = this.#DIRECTION.UP;
                console.log("右方来子弹，下边不能走走上")
            } else if (turnup == false && turndown == true) {
                moveDirection = this.#DIRECTION.DOWN;
                console.log("右方来子弹，上边不能走走下")
            } else if (turnup == true && turndown == true) {
                if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                    moveDirection = this.#DIRECTION.UP;
                    console.log("右方来子弹，两边都能走原来右上，走上")
                } else {
                    moveDirection = this.#DIRECTION.DOWN;
                    console.log("右方来子弹，两边都能走原来左下，走下")
                }

            }


            else {
                if (this.#DIRECTION.STOP == Bullet[2] && this.#DIRECTION.STOP == Bullet[10]) {
                    if (this.priority == this.#DIRECTION.UP || this.priority == this.#DIRECTION.RIGHT) {
                        moveDirection = this.#DIRECTION.UP;
                        console.log("右方来子弹，危险状况，两边能走原来右上，走上")
                    } else {
                        moveDirection = this.#DIRECTION.DOWN;
                        console.log("右方来子弹，危险状况，两边能走原来左下，走下")
                    }
                    return;
                }
                if (this.#DIRECTION.STOP == Bullet[2]) {
                    moveDirection = this.#DIRECTION.UP;
                    console.log("右方来子弹，危险状况，走上")
                }
                if (this.#DIRECTION.STOP == Bullet[10]) {
                    moveDirection = this.#DIRECTION.DOWN;
                    console.log("右方来子弹，危险状况，走下")
                }
                else {
                    moveDirection = this.#DIRECTION.LEFT;
                    console.log("右方，水平无法躲避")
                }
                // moveDirection = this.#DIRECTION.LEFT;
                // console.log("右边，垂直警戒不适合移动")
            }
        }
        // if (this.#DIRECTION.DOWN == Bullet[2] || this.#DIRECTION.DOWN == Bullet[0]) {
        //     if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
        //     ) && this.#DIRECTION.UP != Bullet[10] && this.#DIRECTION.UP != Bullet[12] ) {
        //         console.log("走下")
        //         moveDirection = this.#DIRECTION.DOWN;
        //     }
        // }
        // if (this.#DIRECTION.UP == Bullet[10] || this.#DIRECTION.UP == Bullet[12]) {
        //     if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
        //     ) && this.#DIRECTION.DOWN != Bullet[0] && this.#DIRECTION.DOWN != Bullet[2] ) {
        //         console.log("走上")
        //         moveDirection = this.#DIRECTION.UP;
        //     }
        // }
        // if (this.#DIRECTION.LEFT == Bullet[7] || this.#DIRECTION.LEFT == Bullet[8]) {
        //     if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
        //     ) && this.#DIRECTION.RIGHT != Bullet[4] && this.#DIRECTION.RIGHT != Bullet[5] ) {
        //         console.log("走左")
        //         moveDirection = this.#DIRECTION.LEFT;
        //     }
        // }
        // if (this.#DIRECTION.RIGHT == Bullet[4] || this.#DIRECTION.RIGHT == Bullet[5]) {
        //     if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
        //     ) && this.#DIRECTION.LEFT != Bullet[7] && this.#DIRECTION.LEFT != Bullet[8] ) {
        //         console.log("走右")
        //         moveDirection = this.#DIRECTION.RIGHT;
        //     }
        // }


        if (this.#DIRECTION.DOWN == Bullet[0] && this.#DIRECTION.LEFT == Bullet[8]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.LEFT == Bullet[11]) {
                console.log("走左")
                moveDirection = this.#DIRECTION.LEFT;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.DOWN == Bullet[1]) {
                console.log("走下")
                moveDirection = this.#DIRECTION.DOWN;
            } else {
                console.log("再算算")
            }
        }
        if (this.#DIRECTION.LEFT == Bullet[8] && this.#DIRECTION.UP == Bullet[12]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.LEFT, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.LEFT == Bullet[3]) {
                console.log("走左")
                moveDirection = this.#DIRECTION.LEFT;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.UP == Bullet[9]) {
                console.log("走上")
                moveDirection = this.#DIRECTION.UP;
            } else {
                console.log("再算算")
            }
        }
        if (this.#DIRECTION.UP == Bullet[12] && this.#DIRECTION.RIGHT == Bullet[4]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.RIGHT == Bullet[1]) {
                console.log("走右")
                moveDirection = this.#DIRECTION.RIGHT;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.UP, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[1] && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.UP == Bullet[11]) {
                console.log("走上")
                moveDirection = this.#DIRECTION.UP;
            } else {
                console.log("再算算")
            }
        }
        if (this.#DIRECTION.DOWN == Bullet[0] && this.#DIRECTION.RIGHT == Bullet[4]) {
            if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.RIGHT, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[3] && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.RIGHT == Bullet[9]) {
                console.log("走右")
                moveDirection = this.#DIRECTION.RIGHT;
            } else if (!this.#isNearBoundary(currentTankX, currentTankY, this.#DIRECTION.DOWN, currentTankWH
            ) && this.#DIRECTION.STOP == Bullet[11] && this.#DIRECTION.STOP == Bullet[9] && this.#DIRECTION.DOWN == Bullet[3]) {
                console.log("走下")
                moveDirection = this.#DIRECTION.DOWN;
            } else {
                console.log("再算算")
            }
        }

        this.priority = moveDirection;
        return moveDirection
    }

    /*
             13 0 14
         15  1  2  3 16
         04  5  6  7 08
         17  9 10 11 18
            19 12 20
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
    */
    #calcBulletDistance(arraybullet, currentTankX, currentTankY, Bullet, currentTankWH, bulletWH) {
        var dis
        var bulletdis
        for (const bullet of arraybullet) {
            bulletdis = this.#calcTwoPointDistance(currentTankX, currentTankY, bullet.X, bullet.Y)
            dis = this.#collision(
                currentTankX + currentTankWH,//A
                currentTankY,//B
                bullet.X - bulletWH / 2 - 1,//E
                bullet.Y - bulletWH / 2 - 1,//F
                currentTankWH/*C*/, currentTankWH/*D*/, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[7] = bullet.direction
            }
            else if (true == this.#collisionMetal(currentTankX + 25, currentTankY, currentTankWH)
                && Bullet[0] == this.#DIRECTION.STOP && Bullet[1] == this.#DIRECTION.STOP &&
                Bullet[2] == this.#DIRECTION.STOP && Bullet[3] == this.#DIRECTION.STOP &&
                Bullet[4] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP &&
                Bullet[7] == this.#DIRECTION.STOP && Bullet[8] == this.#DIRECTION.STOP &&
                Bullet[9] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP &&
                Bullet[11] == this.#DIRECTION.STOP && Bullet[12] == this.#DIRECTION.STOP &&
                Bullet[13] == this.#DIRECTION.STOP && Bullet[14] == this.#DIRECTION.STOP &&
                Bullet[15] == this.#DIRECTION.STOP && Bullet[16] == this.#DIRECTION.STOP &&
                Bullet[17] == this.#DIRECTION.STOP && Bullet[18] == this.#DIRECTION.STOP &&
                Bullet[19] == this.#DIRECTION.STOP && Bullet[20] == this.#DIRECTION.STOP) {
                Bullet[7] = this.#DIRECTION.LEFT
            }

            dis = this.#collision(
                currentTankX + 2 * currentTankWH,
                currentTankY,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[8] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - 2 * currentTankWH,
                currentTankY,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[4] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - currentTankWH,
                currentTankY,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[5] = bullet.direction
            }
            else if (true == this.#collisionMetal(currentTankX - 25, currentTankY, currentTankWH)
                && Bullet[0] == this.#DIRECTION.STOP && Bullet[1] == this.#DIRECTION.STOP &&
                Bullet[2] == this.#DIRECTION.STOP && Bullet[3] == this.#DIRECTION.STOP &&
                Bullet[4] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP &&
                Bullet[7] == this.#DIRECTION.STOP && Bullet[8] == this.#DIRECTION.STOP &&
                Bullet[9] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP &&
                Bullet[11] == this.#DIRECTION.STOP && Bullet[12] == this.#DIRECTION.STOP &&
                Bullet[13] == this.#DIRECTION.STOP && Bullet[14] == this.#DIRECTION.STOP &&
                Bullet[15] == this.#DIRECTION.STOP && Bullet[16] == this.#DIRECTION.STOP &&
                Bullet[17] == this.#DIRECTION.STOP && Bullet[18] == this.#DIRECTION.STOP &&
                Bullet[19] == this.#DIRECTION.STOP && Bullet[20] == this.#DIRECTION.STOP) {
                Bullet[5] = this.#DIRECTION.RIGHT
            }
            dis = this.#collision(
                currentTankX,
                currentTankY + currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[10] = bullet.direction
            }
            else if (true == this.#collisionMetal(currentTankX, currentTankY + 25, currentTankWH) && Bullet[0] == this.#DIRECTION.STOP && Bullet[1] == this.#DIRECTION.STOP &&
                Bullet[2] == this.#DIRECTION.STOP && Bullet[3] == this.#DIRECTION.STOP &&
                Bullet[4] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP &&
                Bullet[7] == this.#DIRECTION.STOP && Bullet[8] == this.#DIRECTION.STOP &&
                Bullet[9] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP &&
                Bullet[11] == this.#DIRECTION.STOP && Bullet[12] == this.#DIRECTION.STOP &&
                Bullet[13] == this.#DIRECTION.STOP && Bullet[14] == this.#DIRECTION.STOP &&
                Bullet[15] == this.#DIRECTION.STOP && Bullet[16] == this.#DIRECTION.STOP &&
                Bullet[17] == this.#DIRECTION.STOP && Bullet[18] == this.#DIRECTION.STOP &&
                Bullet[19] == this.#DIRECTION.STOP && Bullet[20] == this.#DIRECTION.STOP) {
                Bullet[10] = this.#DIRECTION.UP
            }
            dis = this.#collision(
                currentTankX,
                currentTankY + 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[12] = bullet.direction
            }
            dis = this.#collision(
                currentTankX,
                currentTankY - 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[0] = bullet.direction
            }
            dis = this.#collision(
                currentTankX,
                currentTankY - currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[2] = bullet.direction
            }
            else if (true == this.#collisionMetal(currentTankX, currentTankY - 25, currentTankWH)
                && Bullet[0] == this.#DIRECTION.STOP && Bullet[1] == this.#DIRECTION.STOP &&
                Bullet[2] == this.#DIRECTION.STOP && Bullet[3] == this.#DIRECTION.STOP &&
                Bullet[4] == this.#DIRECTION.STOP && Bullet[5] == this.#DIRECTION.STOP &&
                Bullet[7] == this.#DIRECTION.STOP && Bullet[8] == this.#DIRECTION.STOP &&
                Bullet[9] == this.#DIRECTION.STOP && Bullet[10] == this.#DIRECTION.STOP &&
                Bullet[11] == this.#DIRECTION.STOP && Bullet[12] == this.#DIRECTION.STOP &&
                Bullet[13] == this.#DIRECTION.STOP && Bullet[14] == this.#DIRECTION.STOP &&
                Bullet[15] == this.#DIRECTION.STOP && Bullet[16] == this.#DIRECTION.STOP &&
                Bullet[17] == this.#DIRECTION.STOP && Bullet[18] == this.#DIRECTION.STOP &&
                Bullet[19] == this.#DIRECTION.STOP && Bullet[20] == this.#DIRECTION.STOP) {

                // if ((Bullet[5] != this.#DIRECTION.RIGHT && Bullet[4] != this.#DIRECTION.RIGHT && Bullet[7] != this.#DIRECTION.LEFT && Bullet[8] != this.#DIRECTION.LEFT) && Bullet[10] == this.#DIRECTION.STOP) {
                Bullet[2] = this.#DIRECTION.DOWN
                // }
            }
            dis = this.#collision(
                currentTankX - currentTankWH,
                currentTankY - currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[1] = bullet.direction
            }
            dis = this.#collision(
                currentTankX + currentTankWH,
                currentTankY - currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[3] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - currentTankWH,
                currentTankY + currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[9] = bullet.direction
            }
            dis = this.#collision(
                currentTankX + currentTankWH,
                currentTankY + currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[11] = bullet.direction
            }


            dis = this.#collision(
                currentTankX + 2 * currentTankWH,
                currentTankY - currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[16] = bullet.direction
            }
            dis = this.#collision(
                currentTankX + currentTankWH,
                currentTankY - 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[14] = bullet.direction
            }

            dis = this.#collision(
                currentTankX + 2 * currentTankWH,
                currentTankY + currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[18] = bullet.direction
            }
            dis = this.#collision(
                currentTankX + currentTankWH,
                currentTankY + 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[20] = bullet.direction
            }


            dis = this.#collision(
                currentTankX - currentTankWH,
                currentTankY - 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[13] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - 2 * currentTankWH,
                currentTankY - currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[15] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - currentTankWH,
                currentTankY + 2 * currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[19] = bullet.direction
            }
            dis = this.#collision(
                currentTankX - 2 * currentTankWH,
                currentTankY + currentTankWH,
                bullet.X - bulletWH / 2 - 1, bullet.Y - bulletWH / 2 - 1,
                currentTankWH, currentTankWH, bulletWH * 1.2, bulletWH * 1.2
            );
            if (true == dis) {
                Bullet[17] = bullet.direction
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
        ).value = "JuBian"
        document.getElementById(
            `Player${this.type === "A" ? 1 : 2}Name`
        ).textContent = "JuBian"
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
    #scanner(currentTank) {
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
            } else if (currentDirection === this.#DIRECTION.RIGHT && X + currentTankWH > screenX) {
                return true;
            } else {
                return false;
            }
            // return (
            //     currentDirection === this.#DIRECTION.RIGHT && X + currentTankWH > screenX
            // );
        }

        return (
            this.#isNearBoundary(X, Y, this.#DIRECTION.DOWN) ||
            this.#isNearBoundary(X, Y, this.#DIRECTION.UP) ||
            this.#isNearBoundary(X, Y, this.#DIRECTION.RIGHT) ||
            this.#isNearBoundary(X, Y, this.#DIRECTION.LEFT)
        );
    }

    #collisionMetal(x, y, r) {
        //障碍阻挡
        const metal = ametal
        if (undefined != metal) {
            for (var i = 0; i < metal.length; i++) {
                if (x > metal[i][0] - r && x < metal[i][0] + metal[i][2] && y > metal[i][1] - r && y < metal[i][1] + metal[i][3]) {
                    return true
                }
            }
        }
        return false
    }
})("B");