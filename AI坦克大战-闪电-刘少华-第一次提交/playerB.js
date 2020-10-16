// PlayerA/PlayerB
window.playerB = new (class PlayerControl {
    // A 选手   B 选手
    constructor(type) {
        this.type = type;
        this.svMoveEv = new CustomEvent("keydown");
        this.svFireEv = new CustomEvent("keydown");
        this.firetimestamp = (new Date()).valueOf();
        this.svMyTank;//我的坦克;
        this.enemyTank // 敌方坦克;
        this.myBullets = [];
        this.enemyBullets = [];
        this.svType = type;
        this.TANK_SPEED = 7;
        this.TANK_WIDTH = 50;
        this.BULLET_WIDTH = 10;
        this.dangerBullets = [];
        this.CHECK_STEP = 25;
        this.DANGER_STEP = 18;
        this.NO_COLLIDE = -1;
        this.BEST_SCORE = 1000;
        this.WORST_SCORE = -1000;
        this.svAllDirections = [this.DIRECTION.UP, this.DIRECTION.DOWN, this.DIRECTION.LEFT, this.DIRECTION.RIGHT, this.DIRECTION.STOP];
        this.svNoStopDirections = [this.DIRECTION.UP, this.DIRECTION.DOWN,  this.DIRECTION.LEFT, this.DIRECTION.RIGHT];
        this.loopCount = 0;
        // 危险距离
        this.DANGER_DISTANCE = 3 * this.TANK_WIDTH;
        this.BEST_FIRE_DISTANCE = 4 * this.TANK_WIDTH;
        // 攻击距离(缓冲距离2倍坦克宽度)
        this.FIRE_MAX_DISTANCE = this.DANGER_DISTANCE + 2 * this.TANK_WIDTH;
        // 非安全接近距离
        this.UNSAFE_APPROACH_DISTANCE = this.DANGER_DISTANCE + this.TANK_WIDTH/2;

        this.MAX_DEDUCE_COUNT = 2;
        this.MAX_DEDUCE_COUNT_FOR_ONE_DIR = 15;

        this.TANK_MOVE_DANGER_STEP = this.MAX_DEDUCE_COUNT + 1;

        this.targetTankInfo = [];
        this.DEBUG = false;

        this.shouldFireLoopTimes = [];
        this.imaginaryMetalBullets = [];
        this.IMGINARY_BULLET_WIDTH = 100;

        this.allEnemyTank = [];
        this.BEST_DISTANCE_OF_CENTER = 55;
        // 最小开火时间间隔
        this.MIN_FIRE_INTERVAL = 0;
        // 上一次对手方方向上的开火
        this.lastEnemyDirectionFire = 0;
        this.METAL_WIDTH = 100;
        this.MAX_DISTANCE = 0;
        this.MIN_FIRE_OFFSET = (this.TANK_WIDTH + this.BULLET_WIDTH)/2;

        this.myCollideNum = 0;
        this.enemyCollideNum = 0;

        this.allEnemyBullets = [];
        this.allAITankCount = 0;
    }

    land() {
        // 当前的坦克实例
        this.setName();
        let name = this.getName();
        this.svMyTank = undefined;
        this.enemyTank = undefined;
        // PlayerA/PlayerB
        aMyTankCount.forEach(element => {
            var c = element;
            if (c['id'] == 200) {
                this.svMyTank = c;
            }
            if (c['id'] == 100) {
                this.enemyTank = c;
            }
        });

        // PlayerA/PlayerB
        this.myBullets = aMyBulletCount2;
        this.enemyBullets = aMyBulletCount1;
        this.myCollideNum = player2CollideNum;
        this.enemyCollideNum = player1CollideNum;


        if (!this.svMyTank) return name;

        this.MAX_DISTANCE = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

        if (this.loopCount === 0) {
            // 记录AI坦克的初始数量
            this.allAITankCount = aTankCount.length;
        }

        // 构建所有敌方坦克
        this.allEnemyTank.push.apply(this.allEnemyTank, aTankCount);
        if (this.enemyTank && this.isCounterStrike()) {
            this.allEnemyTank.push(this.enemyTank);
        }

        if (this.allEnemyTank.length === 0) {
            return name;
        }

        if (this.loopCount === 0 && this.isCounterStrike()) {
            this.createImaginaryBullets();
        }

        this.loopCount++;

        this.log("start==============================>");

        this.error("进行第" + this.loopCount + "次循环");

        let array = this.traceAndFireV2();
        let direction = array[0];
        let targetTank = array[1];
        let shouldFire = false;

        let finalDirection = this.CheckIfIndangerAndAvoid(direction);

        // PlayerA/PlayerB
        if (finalDirection === this.DIRECTION.LEFT && this.loopCount - this.lastEnemyDirectionFire >= 50 && this.allEnemyTank.length >= 1 && targetTank !==this.enemyTank) {
            shouldFire = true;
            this.lastEnemyDirectionFire = this.loopCount;
        }

        // 检测此方向上是否有敌人，如果有，则开火
        shouldFire ||= this.shouldFireOnDirection(finalDirection);

        // 使用数组记录shouldFireLoopTime
        if (shouldFire && this.shouldFireLoopTimes.length < 5) {
            this.log("shouldFire", this.loopCount);
            let shouldFireLoopTime = this.loopCount + 1;
            this.shouldFireLoopTimes.push(shouldFireLoopTime);
        }


        this.SVMove(finalDirection);

        // 遍历shouldFireLoopTimes， remove掉小于当前looptime的条目
        for(let i=0; i<this.shouldFireLoopTimes.length; i++) {
            let fireLoopTime = this.shouldFireLoopTimes[i];
            if (fireLoopTime === this.loopCount && finalDirection === direction) {
                this.log("real shouldFire");
                this.SVFire();
            }
            if (fireLoopTime <= this.loopCount) {
                this.shouldFireLoopTimes.splice(i, 1);
                i--;
            }
        }

        this.log("end<===============================");

        return name;
        // return this.loopCount

    }

    leave() {
        document.onkeyup(this.svMoveEv);
        document.onkeyup(this.svFireEv);
        if (this.DEBUG) {
            for(let i=0; i<this.dangerBullets.length; i++) {
                this.dangerBullets[i].color = 'yellow';
            }
        }

        this.dangerBullets = [];
        this.allEnemyTank = [];
        this.allEnemyBullets = [];
        if (this.DEBUG) {
            // this.targetTankInfo[2].img = img0
        }
    }

    type;
    // 方向的别名
    DIRECTION = {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3,
        STOP: 4,
    };

    getName() {
        return "闪电";
    }

    isBulletInDirection(myBullet, finalDirection, targetTank) {
        let direction = finalDirection;
        if (direction === this.DIRECTION.STOP) {
            direction = this.svMyTank.direction;
        }
        if (myBullet.X - this.svMyTank.X === this.TANK_WIDTH/2) {
            if ((direction === this.DIRECTION.UP && myBullet.Y < this.svMyTank.Y && myBullet.Y > targetTank.Y) || (direction === this.DIRECTION.DOWN && myBullet.Y > this.svMyTank.Y && myBullet.Y < targetTank.Y)) {
                return true;
            }
        } else if (myBullet.Y - this.svMyTank.Y === this.TANK_WIDTH/2) {
            if ((direction === this.DIRECTION.LEFT && myBullet.X < this.svMyTank.X && myBullet.X > targetTank.X) || (direction === this.DIRECTION.RIGHT && myBullet.X > this.svMyTank.X && myBullet.X < targetTank.X)) {
                return true;
            }
        }
        return false;
    }

    hasMyBulletInDirection(direction, targetTank) {
        for(let i=0;i<this.myBullets.length; i++) {
            let myBullet = this.myBullets[i];
            if (this.isBulletInDirection(myBullet, direction, targetTank)) {
                return true;
            }
        }
        return false;
    }

    // 在此方向上是否应该开火
    shouldFireOnDirection(direction) {
        if (direction === this.DIRECTION.STOP) {
            direction = this.svMyTank.direction;
        }
        // 1. 如果方向通道内坦克数量多于有效子弹数量，则开火
        // 2. 特殊情况，如果通道内最近坦克距离大于半个屏幕，则只发一个子弹
        let info = this.getTankAndBulletsInfoOnDirections(direction);
        let tankCount = info[0];
        let myBulletCount = info[1];
        let nearestDistance = info[2];
        if (tankCount <= 0) {
            return false;
        }
        if (nearestDistance <= canvas.width*3/4) {
            if (myBulletCount < tankCount+1) {
                return true;
            }
        } else {
            if (myBulletCount < 2) {
                return true;
            }
        }
        return false;
    }

    getTankAndBulletsInfoOnDirections(direction) {
        let tankCount = 0;
        let myBulletCount = 0;
        let minYOnUp = canvas.height;
        let maxYOnUp = 0;

        let minYOnDown = canvas.height;
        let maxYOnDown = 0;

        let minXOnLeft = canvas.width;
        let maxXOnLeft = 0;

        let minXOnRight = canvas.width;
        let maxXOnRight = 0;

        let nearestDistance = canvas.width;
        for(let i=0;i<this.allEnemyTank.length;i++) {
            let enemy = this.allEnemyTank[i];
            if (this.isBlockByMetal(this.svMyTank, enemy)) {
                continue;
            }
            switch (direction) {
                case this.DIRECTION.UP:
                    if (Math.abs(this.svMyTank.X - enemy.X) < this.MIN_FIRE_OFFSET && enemy.Y < this.svMyTank.Y) {
                        tankCount ++;
                        if (enemy.Y < minYOnUp) {
                            minYOnUp = enemy.Y;
                        }
                        if (enemy.Y > maxYOnUp) {
                            maxYOnUp = enemy.Y;
                            nearestDistance = maxYOnUp;
                        }
                    }
                    break;
                case this.DIRECTION.RIGHT:
                    if (Math.abs(this.svMyTank.Y - enemy.Y) < this.MIN_FIRE_OFFSET && enemy.X > this.svMyTank.X) {
                        tankCount ++;
                        if (enemy.X > maxXOnRight) {
                            maxXOnRight = enemy.X;
                        }
                        if (enemy.X < minXOnRight) {
                            minXOnRight = enemy.X;
                            nearestDistance = minXOnRight;
                        }
                    }
                    break;
                case this.DIRECTION.DOWN:
                    if (Math.abs(this.svMyTank.X - enemy.X) < this.MIN_FIRE_OFFSET && enemy.Y > this.svMyTank.Y) {
                        tankCount ++;
                        if (enemy.Y > maxYOnDown) {
                            maxYOnDown = enemy.Y;
                        }
                        if (enemy.Y < minYOnDown) {
                            minYOnDown = enemy.Y;
                            nearestDistance = minYOnDown;
                        }
                    }
                    break;
                case this.DIRECTION.LEFT:
                    if (Math.abs(this.svMyTank.Y - enemy.Y) < this.MIN_FIRE_OFFSET && enemy.X < this.svMyTank.X) {
                        tankCount ++;
                        if (enemy.X < minXOnLeft) {
                            minXOnLeft = enemy.X;
                        }
                        if (enemy.X > maxXOnLeft) {
                            maxXOnLeft = enemy.X;
                            nearestDistance = maxXOnLeft;
                        }
                    }
                    break;
            }
        }

        for(let i=0;i<this.myBullets.length;i++) {
            let bullet = this.myBullets[i];
            switch (direction) {
                case this.DIRECTION.UP:
                    if (Math.abs(this.svMyTank.X - bullet.X) < this.TANK_WIDTH && bullet.Y < this.svMyTank.Y && bullet.Y > minYOnUp) {
                        myBulletCount ++;
                    }
                    break;
                case this.DIRECTION.RIGHT:
                    if (Math.abs(this.svMyTank.Y - bullet.Y) < this.TANK_WIDTH && bullet.X > this.svMyTank.X && bullet.X < maxXOnRight) {
                        myBulletCount ++;
                    }
                    break;
                case this.DIRECTION.DOWN:
                    if (Math.abs(this.svMyTank.X - bullet.X) < this.TANK_WIDTH && bullet.Y > this.svMyTank.Y && bullet.Y < maxYOnDown) {
                        myBulletCount ++;
                    }
                    break;
                case this.DIRECTION.LEFT:
                    if (Math.abs(this.svMyTank.Y - bullet.Y) < this.TANK_WIDTH && bullet.X < this.svMyTank.X && bullet.X > minXOnLeft) {
                        myBulletCount ++;
                    }
                    break;
            }
        }

        return [tankCount, myBulletCount, nearestDistance];
        
    }

    createImaginaryBullets() {
        let w = canvas.width;
        let h = canvas.height;
        let imaginaryBullet1 = new Bullet('metal1', 0, 1, 4, w/4, h/4);
        let imaginaryBullet2 = new Bullet('metal2', 0, 1, 4, w*3/4, h/4);
        let imaginaryBullet3 = new Bullet('metal3', 0, 1, 4, w/4, h*3/4);
        let imaginaryBullet4 = new Bullet('metal4', 0, 1, 4, w*3/4, h*3/4);
        imaginaryBullet1.width = this.IMGINARY_BULLET_WIDTH;
        imaginaryBullet2.width = this.IMGINARY_BULLET_WIDTH;
        imaginaryBullet3.width = this.IMGINARY_BULLET_WIDTH;
        imaginaryBullet4.width = this.IMGINARY_BULLET_WIDTH;
        this.imaginaryMetalBullets.push(imaginaryBullet1);
        this.imaginaryMetalBullets.push(imaginaryBullet2);
        this.imaginaryMetalBullets.push(imaginaryBullet3);
        this.imaginaryMetalBullets.push(imaginaryBullet4);
    }

    // 检查是否处于危险中，并返回可行的方向数组
    CheckIfIndangerAndAvoid(inputDirection) {
        this.log("input direction : ", this.SVGetDirectionStr(inputDirection));
        let finalDirection = inputDirection;
        // 如果检测出危险，则舍弃输入方向，重新计算出可行方向，否则使用输入方向进行推演1-2步，再选择方向
        let crash = false;
        // 局面总得分
        let totalScore = 0;
        let allCollideTime = "";
        let allScore = "";
        // 检测子弹, 找出危险子弹们
        this.allEnemyBullets.push.apply(this.allEnemyBullets, aBulletCount);
        if (this.isCounterStrike()) {
            this.allEnemyBullets.push.apply(this.allEnemyBullets, this.enemyBullets);
        }
        this.allEnemyBullets.push.apply(this.allEnemyBullets, this.imaginaryMetalBullets);
        for (let i = 0; i < this.allEnemyBullets.length; i++) {
            let bullet = this.allEnemyBullets[i];
            if (!bullet.hasOwnProperty("width")) {
                bullet.width = bulletWidth;
            }
            let disHor = this.svMyTank.X - bullet.X;
            let disVer = this.svMyTank.Y - bullet.Y;
            let dangerDis = tankWidth * 5;
            // 初始值;
            bullet.collideTime = -2; 
            if (Math.pow(disHor, 2) + Math.pow(disVer, 2) <= Math.pow(dangerDis, 2)) {
                // 危险子弹
                if (this.DEBUG) {
                    bullet.color = 'red';
                }
                // 计算出子弹与坦克当前位置距相撞的时间
                let array = this.getBulletScoreInfo(this.svMyTank, bullet, 1);
                if (array[0]) {
                    crash = true;
                }
                totalScore += array[1];
                allCollideTime += array[2] + " | ";
                allScore += array[1] + " ";

                this.dangerBullets.push(bullet);
            }
        }
        let currentPositionScore = this.BEST_SCORE;
        if (this.dangerBullets.length > 0) {
            this.log("in danger!!!");
            this.log("allCollideTime1", allCollideTime);
            this.log("allScore1", allScore);
            this.log("totalScore1", totalScore);
            this.log("bullets count", this.dangerBullets.length);
            if (crash) {
                currentPositionScore = this.WORST_SCORE;
            }
            currentPositionScore = totalScore/this.dangerBullets.length;
        } else {
            this.log("safe!!!");
        }


        this.log("currentPositionScore:", currentPositionScore);

        if (currentPositionScore < this.BEST_SCORE) {
            this.error("检测有危险，遍历各个方向获取得分");
            // 有危险，需要执行躲避策略
            // 遍历每个方向，向后推演一步，检查得分
            finalDirection = this.findRecommendPath(this.svAllDirections, currentPositionScore);

        } else {
            // 没有危险，保用输入的方向进行下一步推演，再选择方向
            this.log("检测没有危险，使用输入方向进行推演");
            let array = this.scoreOfDirection([finalDirection], 1);
            let score = array[0];
            this.log("推演后得分：" + score);
            if (score < currentPositionScore) {
                this.error("使用输入方向推演有危险");
                // 危险，改变方向
                let tempDirections = [];
                this.svAllDirections.forEach(direction => {
                    // 排除掉有危险的方向不再遍历
                    if (direction !== finalDirection) {
                        tempDirections.push(direction);
                    }
                });

                finalDirection = this.findRecommendPath(tempDirections, score);

            }
        }

        this.log("finalDirection", this.SVGetDirectionStr(finalDirection));

        // TODO SCJ 根据躲避时返回的可行的方向和距离目标远近决定出一个最终方向
        return finalDirection;
    }


    findRecommendPath(inputDirections, currentScore) {
        let standByPath = undefined;
        let bestPath = undefined;
        let paths = [];
        inputDirections.forEach(direction => {
            let movements = [];
            movements.push(this.Movement(direction, 0));
            let path = this.Path();
            path.movements = movements;
            paths.push(path);
        });

        let recommendPath = undefined;

        for(let i=1; i<=this.MAX_DEDUCE_COUNT; i++) {
            let array = this.deduce(paths, i);
            paths = array[0];
            bestPath = array[1];
            standByPath = array[2];
            if (bestPath !== undefined) {
                recommendPath = bestPath;
                break;
            } else if (standByPath !== undefined) {
                recommendPath = standByPath;
                break;
            }
        }

        let finalDirection;
        let highestScore = this.WORST_SCORE;

        if (recommendPath !== undefined) {
            // 找到了最好的路径或备用路径
            this.log("find best path : ", recommendPath.movements);
            this.log("最终推演推荐路径：", recommendPath.movements);
            highestScore = recommendPath.movements[recommendPath.movements.length-1].score;
            finalDirection = recommendPath.movements[0].direction;
        } else {
            // 如果2步推演之后仍然没有找到最佳路径，则采用一直往一个方向移动的策略去找
            let array = this.deduceForOneDirection();
            finalDirection = array[0];
            let highestScoreFromDeepDeduce = array[1];
            this.log("final direction from deep deduce is " , finalDirection);
            if (highestScoreFromDeepDeduce === this.BEST_SCORE) {
                highestScore = highestScoreFromDeepDeduce;
            } else {
                // 如果依然没有找到最佳路径，选个分最高的，听天由命
                this.log("not find best path and paths count : ", paths.length);
                // 未找到最好路径，使用得分最高的那个
                paths.sort(this.sortPaths);
                if (paths.length > 0) {
                    recommendPath = paths[0];
                    let tempHighestScore = recommendPath.movements[recommendPath.movements.length-1].score;
                    // 选择出2步推演与多步同方向推演中得分最高的
                    if (tempHighestScore > highestScoreFromDeepDeduce) {
                        highestScore = tempHighestScore;
                        finalDirection = recommendPath.movements[0].direction;
                    }
                }
                let pathes = "paths from deduce2 : ";
                for(let i=0;i<paths.length;i++) {
                    let path = paths[i];
                    pathes += "[" + path.movements[0].direction + "-" + path.movements[0].score + ", " + path.movements[1].direction + "-" + path.movements[1].score + "], ";
                }
                this.log("path2:", pathes);
            }
        }

        this.log("highest score is ", highestScore);
        if (highestScore >= currentScore) {
            this.log("final use this direction", this.SVGetDirectionStr(finalDirection));
        } else {
            this.error("STOP : 需要提前进行深一层推演");
        }
        return finalDirection;
    }

    deduceForOneDirection() {
        let highestScore = this.WORST_SCORE;
        let directionOnNoBest = this.DIRECTION.STOP;
        for(let k=0;k<this.svNoStopDirections.length;k++) {
            let direction = this.svNoStopDirections[k];
            let crash = false;
            for(let i=1;i<=this.MAX_DEDUCE_COUNT_FOR_ONE_DIR && !crash; i++) {
                let score = this.scoreOfNSameDirections(direction, i);
                // 前两次的遍历包含在了deduce2里面，不应该也不需要计算在内
                if (score > highestScore && i>2) {
                    highestScore = score;
                    directionOnNoBest = direction;
                }
                if (score > 0) {
                    if (score === this.BEST_SCORE) {
                        return [direction, this.BEST_SCORE];
                    }
                } else {
                    crash = true;
                    // 相撞了，舍弃当前方向
                    this.error("no best score in this derection", this.SVGetDirectionStr(direction));
                }
            }
        }
        // 没有最好的分数的情况下，返回最高分及其方向
        return [directionOnNoBest, highestScore];
    }

    deduce(paths, step) {
        if (step === 1) {
            // 第一步得到的为WORST_SCORE的方向要舍弃
            let resultPaths = [];
            // 备选路径
            let standByPath = undefined;
            // 最好路径
            let bestPath = undefined;
            this.log("deduce1=================>");
            for(let i=0;i<paths.length;i++) {
                let path = paths[i];
                let direction = path.movements[0].direction;
                let array = this.scoreOfDirection([direction], 1);
                let score = array[0];
                let imaginaryTank = array[1];
                if (score > 0) {
                    path.movements[0].score = score;
                    resultPaths.push(path);
                    if (score === this.BEST_SCORE) {
                        // 如果落点位置不佳，则继续寻找其他方向
                        let scoreOfPosition = this.imaginaryTankPositionScore(imaginaryTank);
                        if (scoreOfPosition < 0) {
                            standByPath = path;
                        } else {
                            bestPath = path;
                            break;
                        }
                    }
                }
            }
            this.log("deduce1<=================");
            return [resultPaths, bestPath, standByPath];
        } else {
            this.log("deduce" + step + "=====================>");
            let standbyPath = undefined;
            let bestPath = undefined;
            let finalPaths = [];
            let findBest = false;
            for(let j=0;j<paths.length;j++) {
                let path = paths[j];
                let tempPaths = [];
                for(let k=0; k<this.svAllDirections.length; k++) {
                    let direction = this.svAllDirections[k];
                    let directions = [];
                    // 拼接成新的路径
                    let movements = path.movements;
                    movements.forEach(movement => {
                        directions.push(movement.direction);
                    });
                    directions.push(direction);
                    let array = this.scoreOfDirection(directions, step);
                    let score = array[0];
                    let imaginaryTank = array[1];
                    if (score > 0) {
                        let tempPath = this.Path();
                        let tempMovements = [];
                        let tempMovement = this.Movement(direction, score);
                        tempMovements.push.apply(tempMovements, movements);
                        tempMovements.push(tempMovement);
                        tempPath.movements = tempMovements;
                        tempPaths.push(tempPath);
                        if (score === this.BEST_SCORE) {
                            // 找到最好路径后返回
                            // 算tank位置得分
                            let scoreOfPosition = this.imaginaryTankPositionScore(imaginaryTank);
                            if (scoreOfPosition < 0) {
                                standbyPath = tempPath;
                            } else {
                                bestPath = tempPath;
                                findBest = true;
                                break;
                            }
                        }
                    }
                }
                finalPaths.push.apply(finalPaths, tempPaths);
                if (findBest) {
                    break;
                }
            }
            this.log("deduce" + step + "<=====================");
            return [finalPaths, bestPath, standbyPath];
        }
    }

    // 往同一个方向推演N步后分析局面得分
    scoreOfNSameDirections(direction, step) {
        let imaginaryTank = this.copyOfTank(this.svMyTank);
        imaginaryTank.direction = direction;
        let bullets = this.dangerBullets;

        this.printMovablePos("before move", imaginaryTank);
        this.printBulletsPos("before move", bullets);

        let array = this.imagineAllMoveNStepForOneDirection(bullets, imaginaryTank, step);
        imaginaryTank = array[0];
        bullets = array[1];
        this.log("当前遍历的方向(" + step + "步)=", this.SVGetDirectionStr(direction));

        this.printMovablePos("after move", imaginaryTank);
        this.printBulletsPos("after move", bullets);

        return this.analyzeCurrentSituation(imaginaryTank, bullets, step, direction);
    }

    // 向后推演step步后分析局面得分
    scoreOfDirection(directions, step) {
        let imaginaryTank = this.copyOfTank(this.svMyTank);
        let bullets = this.dangerBullets;

        this.printMovablePos("before move", imaginaryTank);
        this.printBulletsPos("before move", bullets);

        let i=0;
        directions.forEach(direction => {
            imaginaryTank.direction = direction;
            let firstStep = (i === 0);
            let array = this.imagineAllMoveOneStep(bullets, imaginaryTank, firstStep);
            imaginaryTank = array[0];
            bullets = array[1];
            this.log("当前遍历的方向=", this.SVGetDirectionStr(direction));
            i++;
        });

        this.printMovablePos("after move", imaginaryTank);
        this.printBulletsPos("after move", bullets);

        return [this.analyzeCurrentSituation(imaginaryTank, bullets, step, directions[directions.length-1]), imaginaryTank];
    }

    analyzeCurrentSituation(imaginaryTank, bullets, step, direction) {
        if (bullets.length <= 0) {
            return this.BEST_SCORE;
        }
        let totalScore = 0;
        let allCollideTime = "";
        let allScore = "";
        // 用于判断所有危险子弹的方向是否相同，如果相同，则舍弃往子弹相同方向逃跑的路径，如果不相同，则往相同方向跑是有可能逃脱的
        let bulletDirection = bullets[0].direction;
        let allBulletsSameDirection = true;
        let isBestScore = true;
        let crash = false;
        for(let i=0; i<bullets.length; i++) {
            let bullet = bullets[i];
            let array = this.getBulletScoreInfo(imaginaryTank, bullet, step);
            totalScore += array[1];
            allCollideTime += array[2] + " | ";
            allScore += array[1] + " ";
            if (array[0]) {
                // 有相撞的情况，直接得分为最坏分
                crash = true;
                break;
            }
            if (bulletDirection !== bullet.direction) {
                allBulletsSameDirection = false;
            }
            if (array[1] < this.BEST_SCORE) {
                isBestScore = false;
            }

        }

        this.log("allCollideTimeAndDistance : ", allCollideTime);
        this.log("allScore:", allScore);

        if (crash) {
            return this.WORST_SCORE;
        }

        // 所有子弹都是一个方向，且方向与推演方向相同，并且此方向不是满分，则舍弃此方向
        if (allBulletsSameDirection && !isBestScore) {
            if (bulletDirection === direction) {
                // 舍弃与子弹方向相同的逃跑方向
                // 可能会出现顺着方向走可以躲开而不顺着方向走就躲不开的情况（两个方向都有子弹经过时出现，我们现在的策略是不容易出现这种情况的）
                // TODO SCJ 还有一种情况会导致坦克顺着子弹的方向走，即两个子弹从上下两边一起经过的时候，暂不知道为什么，后期再查
                this.error("ignore direction same with bullet");
                return this.WORST_SCORE;
            }
        }

        // 各个子弹的平均分作为局面得分
        return totalScore / bullets.length;
    }

    imaginaryTankPositionScore(imaginaryTank) {
        let targetTank = this.targetTankInfo[2];

        if (targetTank === undefined) {
            // 目前看是游戏结束后找不到最近的坦克导致的
            this.error("shit check");
            return 0;
        }

        let curDistance = this.getTankDistance(this.svMyTank, targetTank)[0];
        let imgDistance = this.getTankDistance(imaginaryTank, targetTank)[0];
        if (this.inDangerArea(this.svMyTank, targetTank)) {
            // 如果当前处在危险区域，则往更危险的地方的方向减分
            if (imgDistance < curDistance) {
                this.error("more danger, -1");
                return -1;
            }
        } else {
            // 如果处于非危险区域，则往更安全的地方的方向减分
            if (imgDistance > curDistance) {
                this.error("more safer, -1");
                return -1;
            }
        }
        return 0;
    }

    getDistanceOf(dx1, dy1) {
        return Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));
    }

    getBulletScoreInfo(tank, bullet, step) {
        let hasZero = false;
        let tempScore = this.BEST_SCORE;
        // 计算出子弹与坦克当前位置距相撞的时间
        bullet.collideTime = this.getCollideStepsOnBulletsMove(tank, bullet);
        let collideInfo = bullet.collideTime + " ";
        if (bullet.collideTime === 0) {
            // 有撞击的情况，直接得0分
            hasZero = true;
            tempScore = this.WORST_SCORE;
        } else {
            if (bullet.collideTime > 0 && bullet.collideTime < this.DANGER_STEP) {
                // 往后推演step后会更快速撞击到， 所以加一个step进行分数修正
                tempScore = this.BEST_SCORE + this.scoreOfCollideTime(bullet.collideTime, step);
                // 计算出子弹与坦克相撞时的中心点的最短距离
                bullet.centerDistance = this.getMinCenterDistanceOf(tank, bullet);
                let scoreOfdistance = this.scoreOfDistance(bullet.centerDistance);
                tempScore += scoreOfdistance;
                collideInfo += bullet.centerDistance + " " + scoreOfdistance;
            } else {
                // 还要把在坦克移动方向上的子弹的中心点的距离计算在内
                let collideTimeOnTankMove = this.getCollideStepsOnTankMove(tank, bullet);
                if (collideTimeOnTankMove >= 0 && collideTimeOnTankMove < this.TANK_MOVE_DANGER_STEP) {
                    // 计算出子弹与坦克相撞时的中心点的距离
                    bullet.centerDistance = this.getMinCenterDistanceOf(tank, bullet);
                    let scoreOfdistance = this.scoreOfDistance(bullet.centerDistance);
                    tempScore += scoreOfdistance;
                    collideInfo += bullet.centerDistance + " " + scoreOfdistance;
                    this.log("Find bullet on tank's path, calculate its distance2");
                }
            }
        }
        return [hasZero, tempScore, collideInfo, bullet.collideTime];
    }

    scoreOfCollideTime(collideTime, step) {
        let tempScore;
        if (collideTime >= 15) {
            tempScore = -(this.DANGER_STEP - collideTime + step - 1) * 2;
        } else if (collideTime >= 10) {
            tempScore = -(this.DANGER_STEP - collideTime + step - 1) * 4;
        } else if (collideTime >=5) {
            tempScore = -(this.DANGER_STEP - collideTime + step - 1) * 8;
        } else {
            tempScore = -(this.DANGER_STEP - collideTime + step - 1) * 9;
        }
        return tempScore;

        // return -(this.DANGER_STEP - collideTime + step - 1)
    }

    scoreOfDistance(distance) {
        let score = -((this.BEST_DISTANCE_OF_CENTER-distance));
        return score;
    }

    copyOfTank(myTank) {
        let imaginaryTank = {};
        imaginaryTank.X = myTank.X;
        imaginaryTank.Y = myTank.Y;
        imaginaryTank.speed = myTank.speed;
        return imaginaryTank;
    }

    // 将要撞击的两者中心点的最近距离, 最近距离越近越危险
    getMinCenterDistanceOf(tank, bullet) {
        if (bullet.speed === 0) {
            return this.BEST_DISTANCE_OF_CENTER;
        }
        let tankCenterPoint = {};
        let bulletCenterPoint = {};
        tankCenterPoint.X = tank.X + tankWidth/2;
        tankCenterPoint.Y = tank.Y + tankWidth/2;
        bulletCenterPoint.X = bullet.X;
        bulletCenterPoint.Y = bullet.Y;
        return Math.min(Math.abs(tankCenterPoint.X - bulletCenterPoint.X), Math.abs(tankCenterPoint.Y - bulletCenterPoint.Y));
    }

    willCollideAtNSteps(playControl, step, myTank, bullet, isTankMove) {
        if (isTankMove) {
            return function (step, myTank, bullet) {
                return playControl.willCollideAtNStepsOnTankMove(step, myTank, bullet);
            }
        } else {
            return function (step, myTank, bullet) {
                return playControl.willCollideAtNStepsOnBulletsMove(step, myTank, bullet);
            }
        }
    }

    getCollideStepsOnMove(myTank, bullet, isTankMove) {
        // 每次加5步，检测到之后再使用2分法找出具体值
        for(let j=0; j<=this.CHECK_STEP; j+=5) {
            let willCollideAtNSteps = this.willCollideAtNSteps(this, j, myTank, bullet, isTankMove);
            if (willCollideAtNSteps(j, myTank, bullet)) {
                if (j === 0) {
                    return 0;
                }
                let min = j-4;
                let max = j;
                while (true) {
                    let mid = this.bisect(min, max);
                    let willCollideAtNSteps = this.willCollideAtNSteps(this, mid, myTank, bullet, isTankMove);
                    if (willCollideAtNSteps(mid, myTank, bullet)) {
                        if (mid === max || mid === min) {
                            // 如果mid与最大最小值中一个相等，则在找到的情况下返回小的那个
                            return min;
                        }
                        // 开始查找最小值与中间值之间
                        max = mid - 1;
                    } else {
                        if (mid === max || mid === min) {
                            // 如果mid与最大最小值中一个相等，则在没找到的情况下返回大的那个
                            return max;
                        }
                        // 开始查找中间值与最大值之间
                        min = mid + 1;
                    }
                }
            }
        }
        // 返回一个比较大的数，表示不会碰撞
        return this.NO_COLLIDE;
    }

    bisect(min, max) {
        return Math.floor((min + max)/2);
    }

    getCollideStepsOnTankMove(myTank, bullet) {
        return this.getCollideStepsOnMove(myTank, bullet, true);
    }

    getCollideStepsOnBulletsMove(myTank, bullet) {
        return this.getCollideStepsOnMove(myTank, bullet, false);
    }

    // 想像子弹与坦克的移动steps步后，返回移动后的坐标， 坦克一直往一个方向移动
    imagineAllMoveNStepForOneDirection(bullets, tank, steps) {
        let bulletsPoints = [];
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            // 子弹是在检测碰撞之后移动的，所以比坦克慢一步
            let point;
            if (bullet.name >= 1000) {
                // AI子弹是在碰撞检测之后才移动的
                point = this.imagineMove(steps - 1, bullet, false);
            } else {
                point = this.imagineMove(steps, bullet, false);
            }
            bulletsPoints.push(point);
        }
        let tankPoint = this.imagineMove(steps, tank, true);
        return [tankPoint, bulletsPoints];
    }

    // 想像子弹与坦克的移动一步后，返回移动后的坐标
    imagineAllMoveOneStep(bullets, tank, firstStep) {
        let bulletsPoints = [];
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            let point;
            // AI子弹是在检测碰撞之后移动的，所以比坦克慢一步
            // 对手方子弹是在检测之前移动的
            if (firstStep && bullet.name >= 1000) {
                point = this.imagineMove(0, bullet, false);
            } else {
                point = this.imagineMove(1, bullet, false);
            }
            bulletsPoints.push(point);
        }
        let tankPoint = this.imagineMove(1, tank, true);
        return [tankPoint, bulletsPoints];
    }

    // 假想物体的移动，返回移动step步后的坐标
    imagineMove(step, movable, isTank) {
        let point = {};
        let moveOffset = movable.speed * step;
        let bX = movable.X;
        let bY = movable.Y;
        if (movable.direction === this.DIRECTION.LEFT) {
            bX -= moveOffset;
        } else if (movable.direction === this.DIRECTION.RIGHT) {
            bX += moveOffset;
        } else if (movable.direction === this.DIRECTION.UP) {
            bY -= moveOffset;
        } else if (movable.direction === this.DIRECTION.DOWN) {
            bY += moveOffset;
        } else {
            // 啥也不干
        }
        if (isTank) {
            // 对于自己的tank,实施检测边界
            if (bX < 0) {
                bX = 0;
            }
            if (bX > canvas.width-tankWidth) {
                bX = canvas.width-tankWidth;
            }
            if (bY < 0) {
                bY = 0;
            }
            if (bY > canvas.height-tankWidth) {
                bY = canvas.height-tankWidth;
            }

            // 如果移动后与障碍物相撞，则不移动
            if (this.collisionMetal(bX, bY, tankWidth)) {
                bX = movable.X;
                bY = movable.Y;
            }
        }
        point.X = bX;
        point.Y = bY;
        point.direction = movable.direction;
        point.speed = movable.speed;
        if (movable.hasOwnProperty("width")) {
            point.width = movable.width;
        }
        return point;
    }

    // 在接下来的第N秒是否会发生碰撞
    willCollideAtNStepsOnTankMove(n, myTank, bullet) {
        let isCollide = this.checkIfCollideOnTankMove(n, myTank, bullet);
        // this.log("willCollide: " + isCollide)
        return isCollide;
    }

    // 在接下来的第N秒是否会发生碰撞
    willCollideAtNStepsOnBulletsMove(n, myTank, bullet) {
        let isCollide = this.checkIfCollideOnBulletsMove(n, myTank, bullet);
        // this.log("willCollide: " + isCollide)
        return isCollide;
    }

    checkIfRectCollide(A, B, C, D, E, F, G, H) {
        C += A;//算出矩形1右下角横坐标;
        D += B;//算出矩形1右下角纵坐标;
        G += E;//算出矩形2右下角横纵标;
        H += F;//算出矩形2右下角纵坐标;
        if (C <= E || G <= A || D <= F || H <= B) {
        //两个图形没有相交
            return false;
        }
        return true;
    }

    checkIfCollideOnTankMove(n, myTank, bullet) {
        let tankPoint = this.imagineMove(n, myTank, true);

        let tX = tankPoint.X;
        let tY = tankPoint.Y;

        let collide = this.checkIfRectCollide(tX, tY, tankWidth, tankWidth, bullet.X-bullet.width/2, bullet.Y-bullet.width/2, bullet.width, bullet.width);
        // this.log("checkIfCollide: ", "第" + n + "次循环", "myTank=" + this.getMovablePos(myTank), "bullet=" + this.getMovablePos(point), collide)
        return collide;
    }

    // 坦克不动时
    checkIfCollideOnBulletsMove(n, myTank, bullet) {
        let point = this.imagineMove(n, bullet, false);

        point.X -= bullet.width/2;
        point.Y -= bullet.width/2;

        let tX = myTank.X;
        let tY = myTank.Y;

        let collide = this.checkIfRectCollide(tX, tY, tankWidth, tankWidth, point.X, point.Y, bullet.width, bullet.width);
        // this.log("checkIfCollide: ", "第" + n + "次循环", "myTank=" + this.getMovablePos(myTank), "bullet=" + this.getMovablePos(point), collide)
        return collide;
    }

    sortPaths(path1, path2) {
        let movements2 = path2.movements;
        let movements1 = path1.movements;
        if (movements2.length === movements1.length) {
            for(let i=movements2.length-1; i>=0; i--) {
                if (movements2[i].score !== movements1[i].score) {
                    return movements2[i].score - movements1[i].score;
                } else {
                    // 相等的话继续下一次循环
                    if (i===0) {
                        return 0;
                    }
                }
            }
        } else {
            return movements2.length - movements1.length;
        }

    }

    Path() {
        let path = {};
        path.movements = [];
        return path;
    }

    Movement(direction, score) {
        let movement = {};
        movement.direction = direction;
        movement.score = score;
        return movement;
    }

    getMovablePos(movable) {
        return "(" + movable.X + "," + movable.Y + ")";
    }

    printMovablePos(prefix, movable) {
        let position = prefix;
        position += this.getMovablePos(movable);
        this.log("tankPosition", position);
    }

    printBulletsPos(prefix, bullets) {
        let allPoistion = prefix;
        bullets.forEach(bullet => {
            allPoistion += this.getMovablePos(bullet) + " ";
        });
        this.log("allBulletPosition:" + allPoistion);
    }

    countEnemy() {
        let width;
        if (this.isCounterStrike()) {
            width = canvas.width/8;
        } else {
            width = canvas.width/4;
        }
        let count = 0;
        for(let i=0;i<this.allEnemyTank.length; i++) {
            let enemy = this.allEnemyTank[i];
            if (Math.abs(this.svMyTank.Y - enemy.Y) < canvas.height/2 && Math.abs(this.svMyTank.X - enemy.X) < width) {
                count ++;
            }
        }
        return count;
    }

    traceAndFireV2() {
        let finalDirection;
        this.targetTankInfo = this.findNearestTank();
        let dx = this.targetTankInfo[0];
        let dy = this.targetTankInfo[1];
        let targetTank = this.targetTankInfo[2];
        if (this.DEBUG) {
            // targetTank.img = myTankImg0
        }

        if (targetTank === this.enemyTank) {
            this.DANGER_DISTANCE = 3 * this.TANK_WIDTH;
            this.BEST_FIRE_DISTANCE = 4 * this.TANK_WIDTH;
            this.MIN_FIRE_INTERVAL = 200 - (5-this.myBullets.length) * 40;
            this.MIN_FIRE_OFFSET = (this.TANK_WIDTH + this.BULLET_WIDTH)/2;
        } else {
            // 检测我方坦克周围敌方坦克的数量，根据数量多少制定危险距离
            this.DANGER_DISTANCE = 2.5 * this.TANK_WIDTH;
            this.BEST_FIRE_DISTANCE = 3.5 * this.TANK_WIDTH;
            let enemyAroundCount = this.countEnemy();
            let step = this.TANK_WIDTH/10 * (Math.floor(enemyAroundCount/2)-(this.allAITankCount/8));
            this.DANGER_DISTANCE += step;
            this.BEST_FIRE_DISTANCE += step;
            this.MIN_FIRE_INTERVAL = 200 - enemyAroundCount * 20;
            // 敌人多时增大射击区域
            this.MIN_FIRE_OFFSET = (this.TANK_WIDTH + this.BULLET_WIDTH)/2 ;
            //+ (Math.floor(enemyAroundCount/2) - 1)
        }
        this.UNSAFE_APPROACH_DISTANCE = this.DANGER_DISTANCE + this.TANK_WIDTH/2;
        this.FIRE_MAX_DISTANCE = this.DANGER_DISTANCE + 2 * this.TANK_WIDTH;


        // 判断我方与敌方消灭坦克数量，如果我方更多，则执行逃离策略，绕障碍物逃离
        // 如果对手更多，则执行击杀策略
        if (targetTank === this.enemyTank) {
            if (this.myCollideNum > 10) {
                // 绕障碍物逃离， 无合适障碍物时也执行击杀策略
                let bestMetal = this.findBestMetal2Escape();
                let distance = this.calculateDistanceWithMetal(this.svMyTank, targetTank, bestMetal);
                
                // 有可绕障碍并且有足够的逃跑距离
                if (bestMetal !== undefined && distance > 3 * this.TANK_WIDTH) {
                    finalDirection = this.escape4Enemy(bestMetal);
                    // 专注于逃跑，不管其他， 如果无法逃跑再执行其他策略
                    return [finalDirection, targetTank];
                } else {
                    // 考虑找不到的情况: 击杀
                    finalDirection = this.approachAndFire(dx, dy);
                    return [finalDirection, targetTank];
                }
            } else {
                // 击杀
                finalDirection = this.approachAndFire(dx, dy);
                return [finalDirection, targetTank];
            }
        }


        if (this.inDangerArea(this.svMyTank, targetTank)) {
            // 远离（根据是否靠近边界）
            finalDirection = this.escape(dx, dy);
        } else if (this.inFireArea(this.svMyTank, targetTank)) {
            // 攻击区域，停止并攻击 要考虑方向
            finalDirection = this.stopAndFire(dx, dy);
            this.log("stop and fire");
        } else  if (this.inUnSafeApproachArea(this.svMyTank, targetTank) && targetTank !== this.enemyTank) {
            // 远离再接近
            finalDirection = this.escapeForApproach(dx, dy);
        } else if (this.inFarFireArea(this.svMyTank, targetTank)) {
            // 准攻击区域，前进并攻击
            finalDirection = this.goAndFire(dx, dy);
            this.log("go and fire");
        } else {
            // 找到最佳攻击区域，向那个方向移动
            finalDirection = this.findBestFireArea(targetTank);
        }

        return [finalDirection, targetTank];
    }

    approachAndFire(dx, dy) {
        if (this.inAttackArea(dx, dy)) {
            return this.attack(dx, dy);
        } else {
            this.DANGER_DISTANCE = 0;
            this.BEST_FIRE_DISTANCE = this.TANK_WIDTH;
            return this.findBestFireArea(this.targetTankInfo[2]);
        }
    }

    findBestFireArea(targetTank) {
        let targetTankCenter = {X:targetTank.X, Y:targetTank.Y};
        let point1 = {X:targetTankCenter.X - this.BEST_FIRE_DISTANCE, Y:targetTankCenter.Y};
        let point2 = {X:targetTankCenter.X, Y:targetTankCenter.Y - this.BEST_FIRE_DISTANCE};
        let point3 = {X:targetTankCenter.X + this.BEST_FIRE_DISTANCE, Y:targetTankCenter.Y};
        let point4 = {X:targetTankCenter.X, Y:targetTankCenter.Y + this.BEST_FIRE_DISTANCE};
        let points = [point1, point2, point3, point4];
        let highestScore = -this.MAX_DISTANCE;
        let nearestPoint;
        // 寻找出最优的点，并不一定是最近的，如果有多个点可用，则使用更靠近中间的点

        for(let i=0;i<points.length;i++) {
            // 找出4个点中不被遮挡且距离最近的点
            let point = points[i];
            if (point.X < 0 || point.Y < 0 || point.X > canvas.width-tankWidth || point.Y > canvas.height-tankWidth) {
                // 此点在屏幕外，不要
                continue;
            }
            if (this.collisionMetal(point.X, point.Y, tankWidth)) {
                // 所在位置与障碍物碰撞，不要
                continue;
            }

            let imagineTank = {X:point.X ,Y:point.Y};

            let block = this.isBlockByMetal(imagineTank, targetTank);
            // 攻击点与目标坦克之间有障碍物， 不要
            if (block) {
                continue;
            }

            // 根据目标点处子弹的多少及目标点的远近以及距离边缘远近计算综合得分，选出得分高的点
            let score = this.getPositionScoreOfFireArea(point);

            // console.log("position and score: ", point.X, point.Y, score)

            if (score > highestScore) {
                highestScore = score;
                nearestPoint = point;
            }
        }
        // 向nearestPoint移动
        return this.move2Point(nearestPoint);
    }

    getPositionScoreOfFireArea(point) {
        // 根据目标点处子弹的多少及目标点的远近以及距离边缘远近计算综合得分，选出得分高的点
        // 找出距离屏幕中心点和距离坦克位置平均值最近的点
        let nearestMetal = this.findNearestMetal(this.svMyTank, point);
        let distance = this.calculateDistanceWithMetal(this.svMyTank, point, nearestMetal);

        let minDistanceOfBoundLR = Math.min(point.X, canvas.width - point.X);
        let minDistanceOfBoundTB = Math.min(point.Y, canvas.height - point.Y);

        let bulletsCount = this.calculateBulletCountAroundPoint(point);
        // let bulletsCount = 0

        // console.log("scores: ", -distance, -bulletsCount, minDistanceOfBoundLR, minDistanceOfBoundTB)

        let factors = this.getFactorOfBound();
        let score = -distance - bulletsCount * 10 + minDistanceOfBoundLR * factors[0] + minDistanceOfBoundTB * factors[1];

        return score;
    }

    getFactorOfBound() {
        for(let i=0;i<this.allEnemyTank.length;i++) {
            let tank = this.allEnemyTank[i];
            // PlayerA/PlayerB
            if (tank.X > canvas.width/2) {
                return [0.25, 4];
            }
        }
        return [4, 0.25];
    }

    calculateBulletCountAroundPoint(point) {
        let bulletsCount = 0;
        for(let i=0;i<this.allEnemyBullets.length; i++) {
            let bullet = this.allEnemyBullets[i];
            if (bullet.speed === 0) {
                // 排除障碍物
                continue;
            }
            let distance = this.getDistanceOfPoints(point, bullet);
            if (distance < 2 * this.TANK_WIDTH) {
                bulletsCount ++;
            }
        }
        return bulletsCount;
    }

    findNearestMetal(point1, point2) {
        let nearestMetal;
        let nearestMetalDistance = this.MAX_DISTANCE;
        for(let j=0;j<ametal.length;j++) {
            let metal = ametal[j];
            let metalCenter = {X:metal[0]+this.METAL_WIDTH/2, Y:metal[1]+this.METAL_WIDTH/2};
            let tempDistance = (this.getDistanceOfPoints(metalCenter, point1) + this.getDistanceOfPoints(metalCenter, point2))/2;
            if (tempDistance < nearestMetalDistance) {
                nearestMetalDistance = tempDistance;
                nearestMetal = metal;
            }
        }
        return nearestMetal;
    }

    move2Point(targetPoint) {
        let nearestMetal = this.findNearestMetal(this.svMyTank, targetPoint);
        let distance = this.calculateDistanceWithMetal(this.svMyTank, targetPoint, nearestMetal);

        let recommendDirection;
        let dx = this.svMyTank.X - targetPoint.X;
        let dy = this.svMyTank.Y - targetPoint.Y;

        if (this.targetTankInfo[2] === this.enemyTank) {
            // 如果是对手方，则使用Z字形接近，否则，优先向最容易打击的方向走
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    recommendDirection = this.DIRECTION.LEFT;
                } else {
                    recommendDirection = this.DIRECTION.RIGHT;
                }
            } else {
                if (dy > 0) {
                    recommendDirection = this.DIRECTION.UP;
                } else {
                    recommendDirection = this.DIRECTION.DOWN;
                }
            }
        } else {

            if (Math.abs(dx) > canvas.width/4) {
                // 距离太远，命中率低且容易走到子弹多的地方，比较危险
                if (dx > 0) {
                    recommendDirection = this.DIRECTION.LEFT;
                } else {
                    recommendDirection = this.DIRECTION.RIGHT;
                }
            } else {
                // 找到更容易走到远程开火的方向， 需要判断目标点与目标坦克的位置关系
                let targetTank = this.targetTankInfo[2];
                let dxOfTankAndPoint = targetPoint.X - targetTank.X;
                let dyOfTankAndPoint = targetPoint.Y - targetTank.Y;

                if (dxOfTankAndPoint > 0) {
                    // 目标点在目标坦克右面
                    if (dx <= 0) {
                        recommendDirection = this.DIRECTION.RIGHT;
                    } else {
                        if (dy < 0) {
                            recommendDirection = this.DIRECTION.DOWN;
                        } else {
                            recommendDirection = this.DIRECTION.UP;
                        }
                    }
                } else if (dxOfTankAndPoint < 0) {
                    // 目标点在目标坦克左面
                    if (dx >= 0) {
                        recommendDirection = this.DIRECTION.LEFT;
                    } else {
                        if (dy < 0) {
                            recommendDirection = this.DIRECTION.DOWN;
                        } else {
                            recommendDirection = this.DIRECTION.UP;
                        }
                    }
                } else if (dyOfTankAndPoint > 0) {
                    // 目标点在目标坦克下面
                    if (dy <= 0) {
                        recommendDirection = this.DIRECTION.DOWN;
                    } else {
                        if (dx > 0) {
                            recommendDirection = this.DIRECTION.LEFT;
                        } else {
                            recommendDirection = this.DIRECTION.RIGHT;
                        }
                    }
                } else {
                    // 目标点在目标坦克上面
                    if (dy >= 0) {
                        recommendDirection = this.DIRECTION.UP;
                    } else {
                        if (dx > 0) {
                            recommendDirection = this.DIRECTION.LEFT;
                        } else {
                            recommendDirection = this.DIRECTION.RIGHT;
                        }
                    }
                }
            }
            
        }

        let optionDirections = [];
        for(let i=0; i<this.svNoStopDirections.length; i++) {
            let direction = this.svNoStopDirections[i];
            let copyOfMyTank = this.copyOfTank(this.svMyTank);
            copyOfMyTank.direction = direction;
            let imaginaryTank = this.imagineMove(1, copyOfMyTank, true);
            let tempDistance = this.calculateDistanceWithMetal(imaginaryTank, targetPoint, nearestMetal);

            // 1. 检测是否会与障碍物碰撞，如果会碰撞，false
            if (imaginaryTank.X === copyOfMyTank.X && imaginaryTank.Y === copyOfMyTank.Y) {
                // 坦克未能移动，说明遇到边界或者障碍物
                continue;
            }
            // 2. 检测移动后是否在危险区域
            if (this.inDangerArea(imaginaryTank, this.targetTankInfo[2])) {
                continue;
            }

            if (tempDistance < distance) {
                optionDirections.push(direction);
            }
        }
        if (optionDirections.length > 0) {
            for(let i=0; i<optionDirections.length;i++) {
                let direction = optionDirections[i];
                if (direction === recommendDirection) {
                    return direction;
                }
            }
            return optionDirections[0];
        } else {
            this.log("查问题");
            return this.DIRECTION.STOP;
        }

    }

    inAttackArea(dx, dy) {
        if (Math.abs(dx) < this.MIN_FIRE_OFFSET || Math.abs(dy) < this.MIN_FIRE_OFFSET) {
            if (this.isBlockByMetal(this.svMyTank, this.targetTankInfo[2])) {
                return false;
            }
            return true;
        }
        return false;
    }

    inDangerArea(myTank, targetTank) {
        let absDx = Math.abs(myTank.X-targetTank.X);
        let absDy = Math.abs(myTank.Y-targetTank.Y);
        if (absDx<=this.DANGER_DISTANCE && absDy<=this.DANGER_DISTANCE) {
            // TODO SCJ 中间间隔较小时极易被攻击，暂时认为只要在区域内就要逃跑，后面再考虑具体情况
            // if (this.isLineCrossWithMetals(myTank, targetTank)) {
            //     // 中间有障碍物，不是危险区域
            //     return false
            // }
            return true;
        }
        return false;
    }

    inFireArea(myTank, targetTank) {
        let absDx = Math.abs(myTank.X-targetTank.X);
        let absDy = Math.abs(myTank.Y-targetTank.Y);
        if ((absDx<this.MIN_FIRE_OFFSET && absDy>=this.DANGER_DISTANCE && absDy <= this.FIRE_MAX_DISTANCE)
            || (absDy<this.MIN_FIRE_OFFSET && absDx>=this.DANGER_DISTANCE && absDx <= this.FIRE_MAX_DISTANCE)) {
            if (this.isBlockByMetal(myTank, targetTank)) {
                // 中间有障碍物，不是开火区域
                return false;
            }
            return true;
        }
        return false;
    }

    inUnSafeApproachArea(myTank, targetTank) {

        let absDx = Math.abs(myTank.X-targetTank.X);
        let absDy = Math.abs(myTank.Y-targetTank.Y);

        if (this.isBlockByMetal(myTank, targetTank)) {
            // 中间有障碍物，不是非安全接近区域
            return false;
        }

        if (absDx>this.DANGER_DISTANCE && absDx<=this.UNSAFE_APPROACH_DISTANCE && absDy>=this.DANGER_DISTANCE && absDy<=this.UNSAFE_APPROACH_DISTANCE) {
            return true;
        }
        if (absDx>=this.MIN_FIRE_OFFSET && absDx<=this.DANGER_DISTANCE && absDy>=this.DANGER_DISTANCE && absDy<=this.UNSAFE_APPROACH_DISTANCE) {
            return true;
        }
        if (absDy>=this.MIN_FIRE_OFFSET && absDy<=this.DANGER_DISTANCE && absDx>=this.DANGER_DISTANCE && absDx<=this.UNSAFE_APPROACH_DISTANCE) {
            return true;
        }
        return false;
    }

    inFarFireArea(myTank, targetTank) {
        let absDx = Math.abs(myTank.X-targetTank.X);
        let absDy = Math.abs(myTank.Y-targetTank.Y);
        if ((absDx<this.MIN_FIRE_OFFSET && absDy>=this.FIRE_MAX_DISTANCE) || (absDy<this.MIN_FIRE_OFFSET && absDx>=this.FIRE_MAX_DISTANCE)) {
            if (this.isBlockByMetal(myTank, targetTank)) {
                // 中间有障碍物，不是远程开火区域
                return false;
            }
            return true;
        }
        return false;
    }

    escape(dx, dy) {
        let direction = this.DIRECTION.STOP;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDy < absDx) {
            // this.log("distanceHor : " + distanceHor)
            if (absDy <= this.DANGER_DISTANCE) {
                // 小于安全距离，远离
                if (dy > 0) {
                    if (this.svMyTank.Y >= canvas.height-this.DANGER_DISTANCE) {
                        if (dx > 0) {
                            direction = this.DIRECTION.RIGHT;
                        } else {
                            direction = this.DIRECTION.LEFT;
                        }
                    } else {
                        // 同方向往下逃
                        direction = this.DIRECTION.DOWN;
                    }

                } else {
                    if (this.svMyTank.Y <= this.DANGER_DISTANCE) {
                        if (dx > 0) {
                            direction = this.DIRECTION.RIGHT;
                        } else {
                            direction = this.DIRECTION.LEFT;
                        }
                    } else {
                        // 同方向往上逃
                        direction = this.DIRECTION.UP;
                    }
                }

            } else {
                // 不会出现
            }
        } else {
            // this.log("distanceVer : " + distanceVer)
            if (absDx <= this.DANGER_DISTANCE) {
                // 小于安全距离，远离
                // 如果靠近边界，转向离开， 否则同向远离
                if (dx > 0) {
                    // 往右跑
                    // 如果靠近边界，转向离开， 否则同向远离
                    if (this.svMyTank.X >= canvas.width-this.DANGER_DISTANCE) {
                        if (dy > 0) {
                            direction = this.DIRECTION.DOWN;
                        } else {
                            direction = this.DIRECTION.UP;
                        }
                    } else {
                        direction = this.DIRECTION.RIGHT;
                    }
                } else {
                    // 往左跑，如果
                    if (this.svMyTank.X <= this.DANGER_DISTANCE) {
                        if (dy > 0) {
                            direction = this.DIRECTION.DOWN;
                        } else {
                            direction = this.DIRECTION.UP;
                        }
                    } else {
                        direction = this.DIRECTION.LEFT;
                    }
                }
            } else {
                // 不会出现
            }
        }

        return this.checkIfNeedTurnDirection(direction);
    }

    approach(dx, dy) {
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDx > absDy) {
            // 往水平方向移动
            if (dx > 0) {
                return this.DIRECTION.LEFT;
            } else {
                return this.DIRECTION.RIGHT;
            }
        } else {
            if (dy > 0) {
                return this.DIRECTION.UP;
            } else {
                return this.DIRECTION.DOWN;
            }
        }
        // TODO SCJ 是否要考虑重合的情况
    }

    escape4Enemy(bestMetal) {
        // 绕障碍物逃离
        // 1. 判断谁更靠近中心点，以判断是否可以逃离
        // 2. 根据相对位置确定障碍物， 并移动到相应顶点
        // 3. 根据距离是否增加来确定绕行方向

        let myTankCenter = {X:this.svMyTank.X + this.TANK_WIDTH/2, Y:this.svMyTank.Y + this.TANK_WIDTH/2};
        let metalCenter = {X:bestMetal[0] + this.METAL_WIDTH/2, Y:bestMetal[1] + this.METAL_WIDTH/2};
        let centerDx = myTankCenter.X - metalCenter.X;
        let centerDy = myTankCenter.Y - metalCenter.Y;

        if (this.rollingMetal(centerDx, centerDy)) {
            return this.rollMetal(centerDx, centerDy, bestMetal);
        } else {
            // 往最小间距增加的方向移动
            return this.approachMetal(bestMetal);
        }
    }

    rollMetal(dx, dy, metal) {
        // 对于每个区域，计算三个方向（两个移动方向与当前不动的方向）哪个与目标距离较远，则往那个方向移动
        let directions = this.getTwoRollDirections(dx, dy);
        directions.push(this.DIRECTION.STOP);
        let copyOfMyTank = this.copyOfTank(this.svMyTank);
        let targetTank = this.targetTankInfo[2];
        let maxDistance = 0;
        let finalDirection = this.DIRECTION.STOP;
        for(let i=0;i<directions.length;i++) {
            let direction = directions[i];
            copyOfMyTank.direction = direction;
            let imaginaryTank = this.imagineMove(2, copyOfMyTank, true);
            let distance = this.calculateDistanceWithMetal(imaginaryTank, targetTank, metal);
            if (distance > maxDistance) {
                maxDistance = distance;
                finalDirection = direction;
            }
        }
        return finalDirection;
    }



    /**
     * 获取当前绕障碍物时可能的两个方向，排除掉在敌方打击范围内的方向，即在同一轴线上的
     * @param dx 水平方向上的中心点的差
     * @param dy 竖直方向上的中心点的差
     */
    getTwoRollDirections(dx, dy) {
        let directions = [];
        let minDistance = (this.TANK_WIDTH + this.METAL_WIDTH)/2;
        let maxDistance = minDistance + this.svMyTank.speed;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDx < minDistance && absDy >= minDistance && absDy < maxDistance) {
            // 在障碍物的上下两边
            directions = [this.DIRECTION.LEFT, this.DIRECTION.RIGHT];
        }
        if (absDy < minDistance && absDx >= minDistance && absDx < maxDistance) {
            // 在障碍物的左右两边
            directions = [this.DIRECTION.UP, this.DIRECTION.DOWN];
        }
        if (absDx >= minDistance && absDx < maxDistance && absDy >= minDistance && absDy < maxDistance) {
            if (dx < 0 && dy < 0) {
                directions = [this.DIRECTION.RIGHT, this.DIRECTION.DOWN];
            }
            if (dx < 0 && dy > 0) {
                directions = [this.DIRECTION.RIGHT, this.DIRECTION.UP];
            }
            if (dx > 0 && dy < 0) {
                directions = [this.DIRECTION.LEFT, this.DIRECTION.DOWN];
            }
            if (dx > 0 && dy > 0) {
                directions = [this.DIRECTION.LEFT, this.DIRECTION.UP];
            }
        }
        // 其他情况不在绕行范围内

        return directions;

    }

    isInConnectPointArea(absDx, absDy) {
        let minDistance = (this.TANK_WIDTH + this.METAL_WIDTH)/2;
        return (absDx >= minDistance && absDy >= minDistance);
    }

    rollingMetal(dx, dy) {
        let rollingDistance = this.TANK_WIDTH/2 + this.METAL_WIDTH/2 + this.svMyTank.speed;
        if (Math.abs(dx) < rollingDistance && Math.abs(dy) < rollingDistance) {
            return true;
        }
        return false;
    }

    approachMetal(metal) {
        let direction;

        let nearestVertexOfTank = this.getNearestVertexOfTank(this.svMyTank, metal);
        let nearestVertex = this.getNearestVertexOfMetal(metal);

        let dx = nearestVertexOfTank.X - nearestVertex.X;
        let dy = nearestVertexOfTank.Y - nearestVertex.Y;
        // dx,dy 应该以距离坦克最近的顶点来计算
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                direction = this.DIRECTION.LEFT;
            } else {
                direction = this.DIRECTION.RIGHT;
            }
        } else {
            if (dy > 0) {
                direction = this.DIRECTION.UP;
            } else {
                direction = this.DIRECTION.DOWN;
            }
        }
        return direction;
    }

    findBestMetal2Escape() {
        let minDistance = this.MAX_DISTANCE;
        let bestMetal;
        let targetTank = this.targetTankInfo[2];
        for(let i=0; i<ametal.length;i++) {
            let metal = ametal[i];
            // 距离计算须使用最近点，而不能使用固定点
            let nearestVertexOfTank = this.getNearestVertexOfTank(this.svMyTank, metal);
            let nearestVertex = this.getNearestVertexOfMetal(metal);

            let dx1 = this.svMyTank.X - targetTank.X;
            let dx2 = nearestVertexOfTank.X - nearestVertex.X;
            let dy1 = this.svMyTank.Y - targetTank.Y;
            let dy2 = nearestVertexOfTank.Y - nearestVertex.Y;
            if (this.inDangerArea(this.svMyTank, targetTank)) {
                // 两者距离小于安全距离
                if ((dx1 * dx2 > 0 && Math.abs(dx1) < Math.abs(dx2)) || (dy1 * dy2 > 0 && Math.abs(dy1) < Math.abs(dy2))) {
                    // 障碍物与敌方坦克在我方的同一侧且我方距离敌方比距离障碍更近，则不要
                    continue;
                }
            }
            let tempDistance = this.getDistanceOfPoints(this.svMyTank, {X:metal[0], Y:metal[1]});
            if (tempDistance < minDistance) {
                minDistance = tempDistance;
                bestMetal = metal;
            }
        }
        return bestMetal;
    }

    getNearestVertexOfTank(tank, metal) {
        let nearestVertex = {};
        let vertex1 = {X:tank.X, Y:tank.Y};
        let vertex2 = {X:tank.X + this.TANK_WIDTH, Y:tank.Y};
        let vertex3 = {X:tank.X + this.TANK_WIDTH, Y:tank.Y + this.TANK_WIDTH};
        let vertex4 = {X:tank.X, Y:tank.Y + this.TANK_WIDTH};
        let vertexs = [vertex1, vertex2, vertex3, vertex4];

        let minDistance = this.MAX_DISTANCE;
        for(let i=0;i<vertexs.length;i++) {
            let vertex = vertexs[i];
            let distance = this.getDistanceOfPoints({X:metal[0]+this.METAL_WIDTH/2, Y:metal[1]+this.METAL_WIDTH/2}, vertex);
            if (distance < minDistance) {
                minDistance = distance;
                nearestVertex = vertex;
            }
        }
        return nearestVertex;
    }

    getNearestVertexOfMetal(metal) {
        let nearestVertex = {};
        let vertex1 = {X:metal[0], Y:metal[1]};
        let vertex2 = {X:metal[0] + this.METAL_WIDTH, Y:metal[1]};
        let vertex3 = {X:metal[0] + this.METAL_WIDTH, Y:metal[1] + this.METAL_WIDTH};
        let vertex4 = {X:metal[0], Y:metal[1] + this.METAL_WIDTH};
        let vertexs = [vertex1, vertex2, vertex3, vertex4];

        let minDistance = this.MAX_DISTANCE;
        for(let i=0;i<vertexs.length;i++) {
            let vertex = vertexs[i];
            // 计算中点与各顶点的距离
            let distance = this.getDistanceOfPoints({X:this.svMyTank.X+this.TANK_WIDTH/2, Y:this.svMyTank.Y+this.TANK_WIDTH/2}, vertex);
            if (distance < minDistance) {
                minDistance = distance;
                nearestVertex = vertex;
            }
        }
        return nearestVertex;
    }

    checkIfNeedTurnDirection(direction) {
        let copyOfTank = this.copyOfTank(this.svMyTank);
        copyOfTank.direction = direction;
        let point = this.imagineMove(1, copyOfTank, true);
        if (point.X === copyOfTank.X && point.Y === copyOfTank.Y) {
            direction = this.turnDirectionWhenCollide(direction);
        }
        return direction;
    }

    turnDirectionWhenCollide(direction) {
        let finalDirection;
        switch (direction) {
            case this.DIRECTION.UP:
            case this.DIRECTION.DOWN:
                if (this.svMyTank.X < canvas.width/2) {
                    finalDirection = this.DIRECTION.RIGHT;
                } else {
                    finalDirection = this.DIRECTION.LEFT;
                }
                break;
            case this.DIRECTION.LEFT:
            case this.DIRECTION.RIGHT:
                if (this.svMyTank.X < canvas.height/2) {
                    finalDirection = this.DIRECTION.DOWN;
                } else {
                    finalDirection = this.DIRECTION.UP;
                }
                break;
        }
        return finalDirection;
    }

    stopAndFire(dx, dy) {
        // 攻击区域，停止并攻击 要考虑方向
        let absDX = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDX > absDy) {
            if (dx > 0) {
                // 我方在右边
                if (this.svMyTank.direction === this.DIRECTION.LEFT) {
                    return this.DIRECTION.STOP;
                } else {
                    return this.DIRECTION.LEFT;
                }
            } else {
                // 我方在左边
                if (this.svMyTank.direction === this.DIRECTION.RIGHT) {
                    return this.DIRECTION.STOP;
                } else {
                    return this.DIRECTION.RIGHT;
                }
            }
        } else {
            if (dy > 0) {
                if (this.svMyTank.direction === this.DIRECTION.UP) {
                    return this.DIRECTION.STOP;
                } else {
                    return this.DIRECTION.UP;
                }
            } else {
                if (this.svMyTank.direction === this.DIRECTION.DOWN) {
                    return this.DIRECTION.STOP;
                } else {
                    return this.DIRECTION.DOWN;
                }
            }
        }
    }

    attack(dx, dy) {
        // 攻击区域，停止并攻击 要考虑方向
        let absDX = Math.abs(dx);
        let absDy = Math.abs(dy);
        // 重合，开火
        if (absDX > absDy) {
            if (dx > 0) {
                // 我方在右边
                return this.DIRECTION.LEFT;
            } else {
                // 我方在左边
                return this.DIRECTION.RIGHT;
            }
        } else {
            if (dy > 0) {
                return this.DIRECTION.UP;
            } else {
                return this.DIRECTION.DOWN;
            }
        }
    }

    escapeForApproach(dx, dy) {
        let direction;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDx >= absDy) {
            if (dx > 0) {
                direction = this.DIRECTION.RIGHT;
            } else {
                direction = this.DIRECTION.LEFT;
            }
        } else {
            if (dy > 0) {
                direction = this.DIRECTION.DOWN;
            } else {
                direction = this.DIRECTION.UP;
            }
        }
        return this.checkIfNeedTurnDirection(direction);
    }

    goAndFire(dx, dy) {
        let direction = this.DIRECTION.STOP;
        if (dx >= this.FIRE_MAX_DISTANCE) {
            direction = this.DIRECTION.LEFT;
        }
        if (dx <= -this.FIRE_MAX_DISTANCE) {
            direction = this.DIRECTION.RIGHT;
        }
        if (dy >= this.FIRE_MAX_DISTANCE) {
            direction = this.DIRECTION.UP;
        }
        if (dy <= -this.FIRE_MAX_DISTANCE) {
            direction = this.DIRECTION.DOWN;
        }
        return direction;
    }

    findNearestTank() {
        // 针对障碍物进行处理，有障碍物时需要特殊计算
        let highestScore = -this.MAX_DISTANCE;

        // 离我方最近的Tank位置
        let distanceVer = canvas.height;
        let distanceHor = canvas.width;

        let nearestTank;

        for (let i = 0; i < this.allEnemyTank.length; i++) {
            let tank = this.allEnemyTank[i];
            // 敌方坦克
            let dx = this.svMyTank.X - tank.X;
            let dy = this.svMyTank.Y - tank.Y;

            let score = this.scoreOfTank(tank);
            

            if (score > highestScore) {
                highestScore = score;
                distanceHor = dx;
                distanceVer = dy;
                nearestTank = tank;
            }
        }
        // console.log("tank score is : ", nearestTank, highestScore)
        return [distanceHor, distanceVer, nearestTank];
    }

    scoreOfTank(tank) {
        let distance = this.getTankDistance(this.svMyTank, tank);
        let minDistanceOfBoundLR = Math.min(tank.X, canvas.width - tank.X);
        let minDistanceOfBoundTB = Math.min(tank.Y, canvas.height - tank.Y);
        let score = -distance + minDistanceOfBoundLR/8 + minDistanceOfBoundTB/6;
        return score;
    }

    getTankDistance(tank1, tank2) {
        // 敌方坦克
        let dx = tank1.X - tank2.X;
        let dy = tank1.Y - tank2.Y;

        let realDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        return realDistance;
    }

    /**
     * 判断两个坦克是否被障碍物阻隔
     * 首先构造两个以坦克中心点为中心，以子弹直径为边长的正方形
     * 连接两个正方形的四个顶点，形成四个长方形，判断四个长方形与障碍物的碰撞情况
     * 如果四个长方形中任何一个发生碰撞，说明两个坦克被阻隔，否则不被阻隔
     * @param tank1
     * @param tank2
     */
    isBlockByMetal(tank1, tank2) {
        if (!this.isCounterStrike()) {
            return false;
        }
        // 构建两个正方形
        let delta = (this.TANK_WIDTH-this.BULLET_WIDTH)/2;
        let square1 = {X:tank1.X+delta, Y:tank1.Y+delta, R:this.BULLET_WIDTH};
        let square2 = {X:tank2.X+delta, Y:tank2.Y+delta, R:this.BULLET_WIDTH};
        // 得到四个长方形
        let rects = this.getFourRectOfTwoSquares(square1, square2, this.BULLET_WIDTH);
        // 判断长方形与障碍物是否碰撞
        for(let i=0;i<rects.length;i++) {
            let rect = rects[i];
            for(let j=0;j<ametal.length;j++) {
                let metal = ametal[j];
                if (this.rectCollisionMetal(rect.x1, rect.y1, rect.x2, rect.y2, metal)) {
                    return true;
                }
            }
        }
        return false;
    }

    // 获取到两个坦克形成的四条长方形
    getFourRectOfTwoSquares(s1, s2, r) {
        let dx = s1.X - s2.X;
        let dy = s1.Y - s2.Y;
        // 定义靠左，上，右，下的坦克
        let tt, tp, tr, td;
        // 边长;
        let w = r;  
        if (dx > 0) {
            if (dy > 0) {
                tt = s2;
                tp = s2;
                tr = s1;
                td = s1;
            } else {
                tt = s2;
                tp = s1;
                tr = s1;
                td = s2;
            }
        } else {
            if (dy > 0) {
                tt = s1;
                tp = s2;
                tr = s2;
                td = s1;
            } else {
                tt = s1;
                tp = s1;
                tr = s2;
                td = s2;
            }
        }
        let rect1 = {x1:tt.X, y1:tp.Y, x2:tr.X+w, y2:tp.Y+w};
        let rect2 = {x1:tr.X, y1:tp.Y, x2:tr.X+w, y2:td.Y+w};
        let rect3 = {x1:tt.X, y1:td.Y, x2:tr.X+w, y2:td.Y+w};
        let rect4 = {x1:tt.X, y1:tp.Y, x2:tt.X+w, y2:td.Y+w};
        return [rect1, rect2, rect3, rect4];
    }

    getDistanceOfPoints(point1, point2) {
        return this.getDistanceOf(point1.X-point2.X, point1.Y-point2.Y);
    }

    calculateDistanceWithMetal(tank1, tank2, metal) {
        let distance;
        let dx = Math.abs(tank1.X - tank2.X);
        let dy = Math.abs(tank1.Y - tank2.Y);

        if (this.isPointReachable(tank1, tank2, metal)) {
            distance = dx + dy;
            return distance;
        }

        let points = this.findTwoConnectPoint(tank1, metal);
        if (points.length !== 2) {
            this.log("shit, 查问题");
            return 0;
        }

        let distances = [];
        for(let i=0;i<points.length;i++) {
            let point = points[i];
            let dx1 = Math.abs(tank1.X - point.X);
            let dy1 = Math.abs(tank1.Y - point.Y);
            let dx2 = Math.abs(tank2.X - point.X);
            let dy2 = Math.abs(tank2.Y - point.Y);
            let distance = dx1 + dy1 + dx2 + dy2;
            distances.push(distance);
        }

        return Math.min.apply(null, distances);

    }

    findTwoConnectPoint(tank, metal) {
        if (metal === undefined) {
            return [];
        }
        let points = [];
        let centerOfMetal = {X:metal[0]+this.METAL_WIDTH/2,Y:metal[1]+this.METAL_WIDTH/2};
        for(let i=0;i<this.svNoStopDirections.length;i++) {
            let direction = this.svNoStopDirections[i];
            let copyOfTank = this.copyOfTank(tank);
            copyOfTank.direction = direction;
            // TODO SCJ 可优化为二分法查找 22=150/7
            let lastImaginaryTank = {X:0, Y:0};
            for(let step=1;step<=22;step++) {
                let imaginaryTank = this.imagineMove(step, copyOfTank, true);
                if (imaginaryTank.X === lastImaginaryTank.X && imaginaryTank.Y === lastImaginaryTank.Y) {
                    // 遇到边界，停止此方向上的寻找
                    break;
                }
                lastImaginaryTank = imaginaryTank;
                let centerOfTank = {X:imaginaryTank.X+this.TANK_WIDTH/2, Y:imaginaryTank.Y+this.TANK_WIDTH/2};
                let absDx = Math.abs(centerOfTank.X-centerOfMetal.X);
                let absDy = Math.abs(centerOfTank.Y-centerOfMetal.Y);
                if (this.isInConnectPointArea(absDx, absDy)) {
                    points.push(imaginaryTank);
                    break;
                }
            }
        }
        return points;

    }

    // 目标点对于原始点是否可达，如果可通过一次转向到达，则可达
    isPointReachable(originPoint, targetPoint, metal) {
        if (metal === undefined) {
            return true;
        }
        // 找到两个坦克形成的正方形上的另外两个点
        // 分别从这两个点出发到tank1, tank2连线，看看连线形成的长方形条是否与障碍物相碰撞，如果存在不相交的情况，则两者距离即为dx+dy
        let twoOtherPoints = this.getOtherTwoPoints(originPoint, targetPoint);
        let reachable = false;
        for(let i=0;i<twoOtherPoints.length;i++) {
            let point = twoOtherPoints[i];
            let rects = this.getTwoRectsFromPoint(point, originPoint, targetPoint);
            let collide = false;
            for(let j=0; j<rects.length;j++) {
                let rect = rects[j];
                if (this.rectCollisionMetal(rect.x1, rect.y1, rect.x2, rect.y2, metal)) {
                    collide = true;
                    break;
                }
            }

            // 当前点不能用作连接点
            if (!collide) {
                reachable = true;
            }
        }

        return reachable;

    }

    getOtherTwoPoints(t1, t2) {
        let p1 = {X:t2.X, Y:t1.Y};
        let p2 = {X:t1.X, Y:t2.Y};
        return [p1, p2];
    }

    getTwoRectsFromPoint(point, t1, t2) {
        let w = this.TANK_WIDTH;
        let rect1, rect2;
        if (t1.X === t2.X || t1.Y === t2.Y) {
            // 原始点与目标点在同一水平线或竖直线上
            rect1 = {x1:point.X, y1:point.Y, x2:point.X+w, y2:point.Y+w};
            // 从小到大
            if (t1.Y > t2.Y || t1.X > t2.X) {
                rect2 = {x1:t2.X, y1:t2.Y, x2:t1.X+w, y2:t1.Y+w};
            } else {
                rect2 = {x1:t1.X, y1:t1.Y, x2:t2.X+w, y2:t2.Y+w};
            }
        } else {
            if (point.X === t1.X) {
                if (point.Y < t1.Y) {
                    if (point.X > t2.X) {
                        rect1 = {x1:point.X, y1:point.Y, x2:t1.X+w, y2:t1.Y+w};
                        rect2 = {x1:t2.X, y1:t2.Y, x2:point.X+w, y2:point.Y+w};
                    } else {
                        rect1 = {x1:point.X, y1:point.Y, x2:t1.X+w, y2:t1.Y+w};
                        rect2 = {x1:point.X, y1:point.Y, x2:t2.X+w, y2:t2.Y+w};
                    }
                } else {
                    if (point.X > t2.X) {
                        rect1 = {x1:t1.X, y1:t1.Y, x2:point.X+w, y2:point.Y+w};
                        rect2 = {x1:t2.X, y1:t2.Y, x2:point.X+w, y2:point.Y+w};
                    } else {
                        rect1 = {x1:t1.X, y1:t1.Y, x2:point.X+w, y2:point.Y+w};
                        rect2 = {x1:point.X, y1:point.Y, x2:t2.X+w, y2:t2.Y+w};
                    }
                }
            } else {
                // point.X === point.X
                if (point.Y < t2.Y) {
                    if (point.X > t1.X) {
                        rect1 = {x1:t1.X, y1:t1.Y, x2:point.X+w, y2:point.Y+w};
                        rect2 = {x1:point.X, y1:point.Y, x2:t2.X+w, y2:t2.Y+w};
                    } else {
                        rect1 = {x1:point.X, y1:point.Y, x2:t2.X+w, y2:t2.Y+w};
                        rect2 = {x1:point.X, y1:point.Y, x2:t1.X+w, y2:t1.Y+w};
                    }
                } else {
                    if (point.X > t1.X) {
                        rect1 = {x1:t1.X, y1:t1.Y, x2:point.X+w, y2:point.Y+w};
                        rect2 = {x1:t2.X, y1:t2.Y, x2:point.X+w, y2:point.Y+w};
                    } else {
                        rect2 = {x1:point.X, y1:point.Y, x2:t1.X+w, y2:t1.Y+w};
                        rect1 = {x1:t2.X, y1:t2.Y, x2:point.X+w, y2:point.Y+w};
                    }
                }
            }
        }

        return [rect1, rect2];

    }

    // 控制移动   举例子：  向左移动： this.SVMove(this.DIRECTION.LEFT)
    SVMove(direction) {
        if (typeof direction === undefined) return;
        this.svMoveEv.keyCode = this.SVGetDirectionKeyCode(direction);
        document.onkeydown(this.svMoveEv);
    }

    // 开火
    SVFire() {
        let now = (new Date()).valueOf();
        if (now - this.firetimestamp > this.MIN_FIRE_INTERVAL) {
            this.firetimestamp = now;
            this.svFireEv.keyCode = this.svType === "A" ? 32 : 8;
            document.onkeydown(this.svFireEv);
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

    SVGetDirectionStr(direction) {
        switch (direction) {
            case this.DIRECTION.UP:
                return "UP";
            case this.DIRECTION.DOWN:
                return "DOWN";
            case this.DIRECTION.LEFT:
                return "LEFT";
            case this.DIRECTION.RIGHT:
                return "RIGHT";
            default:
                return "STOP";
        }
    }

    isCounterStrike() {
        return ametal.length > 0;
    }

    log(...data) {
        if (this.DEBUG) {
            console.log(data.join(' '));

        }
    }

    error(...data) {
        if (this.DEBUG) {
            console.error(data.join(' '));
        }
    }

    setName() {
        // PlayerA/PlayerB
        document.getElementById(
            `Player${this.type === "A" ? 1 : 2}Name`
        ).textContent = `闪电`;
    }

    rectCollisionMetal(x1, y1, x2, y2, metal) {
        if (metal === undefined) {
            return false;
        }
        let dx = x2-x1;
        let dy = y2-y1;
        //障碍阻挡
        if(x1>metal[0] - dx && x1 < metal[0] + metal[2] && y1 > metal[1]-dy && y1<metal[1] + metal[3]) {
            return true;
        }
        return false;
    }

    collisionMetal(x,y,r) {
        //障碍阻挡
        const metal = ametal;
        if(metal.length > 0) {
            for(var i = 0;i<metal.length;i++) {
                if(x>metal[i][0] - r && x < metal[i][0] + metal[i][2] && y > metal[i][1]-r && y<metal[i][1] + metal[i][3])
                {
                    return true;
                }
            }
        }
        return false;
    }

    // PlayerA/PlayerB
})("B");