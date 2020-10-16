window.playerA = new (class PlayerControl {
  // A 选手   B 选手
  constructor(type) {
    this.type = type;
    this.#moveEv = new CustomEvent("keydown");
    this.#fireEv = new CustomEvent("keydown");
    this.firetimestamp = (new Date()).valueOf()
    this.priority = this.#DIRECTION.STOP;
    /////////////////////////////////////////////////////////////////////////////////////////
    this.epsilonInit = 0.5;
    this.epsilonFinal = 0.01;
    this.epsilonDecayFrames = 1e5;
    this.epsilonIncrement_ = (this.epsilonFinal - this.epsilonInit) /this.epsilonDecayFrames;
    /////////////////////////////////////////////////////////////////////////////////////////
    this.onlineNetwork = undefined  //this.createDeepQNetwork(10, 10, 10);
    this.targetNetwork = undefined  //this.createDeepQNetwork(10, 10, 10);
    this.wHeight = undefined
    this.wWidth = undefined
    /////////////////////////////////////////////////////////////////////////////////////////
    this.batchSize = 64 //'Batch size for DQN training.'
    this.learningRate = 1e-3
    //this.optimizer = tf.train.adam(this.learningRate);
    this.gamma = 0.99 //'Reward discount rate.'
    this.cumulativeRewardThreshold = 100
    this.maxNumFrames = 1e6
    this.syncEveryFrames = 1e3
    this.savePath = './models/dqn'
    this.logDir = null
    /////////////////////////////////////////////////////////////////////////////////////////
    this.scaleFactor = 0.2;
    this.tankWH = 50
    this.bulletWH = 10
    //
    this.myTankBaseValue = 3
    this.myBulletBaseValue = 4
    this.enemyPlayerTankBaseValue = 5
    this.enemyPlayerBulletBaseValue = 6
    this.enemyTankBaseValue = 1
    this.enemyBulletBaseValue = 2
    this.ametalBaseValue = 7
    //
    this.replayBufferSize = 1e4;
    this.constructReplayBuffer(this.replayBufferSize)
    //
    this.constructRewardBuffer(100)
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.reset();
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //this.w = canvas.height
  }
  //
  reset(){
    this.frameCount = 0;
    //this.die = false;
    this.collideNum=0;
    this.state = undefined;
    this.action = undefined;
    this.reward = 0;
    this.done = false;
    this.nextState = undefined;
    //
  }
  //
  /////////////////////////////////////////////////////////////////////////////////////////////////////
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
  //移动事件
  #moveEv;
  //开火事件
  #fireEv;
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  //#ACTIONS
  ALL_ACTIONS = [0,1,2,3,4,5,6,7,8,9]
  NUM_ACTIONS = 10
  //REWARK
  NO_KILL_REWARD = -0.2
  KILL_REWARD = 1;
  WIN_REWARD = 10;
  DEATH_REWARD = -10;
  //
  //setDie(){
     //this.die = die;
  //}
  setCollideNum(){
    if(this.type == "A"){
        this.collideNum = player1CollideNum;
     }
     if(this.type == "B"){
        this.collideNum = player2CollideNum;
     }
  }
  setState(){
    this.state = this.getState();
  }
  setAction(action){
    this.action = action;
  }
  setReward(){
     if(this.type === "A"){
        if(player1Die){
            this.reward = this.DEATH_REWARD;
            console.log("*************be killed, big negative reward***************");
        }
        else if(player2Die && playerNum ==2){
            this.reward = this.WIN_REWARD;
            console.log("kill enemy, big positive reward");
        }else{
            if(this.collideNum < player1CollideNum){
                this.reward = this.KILL_REWARD;
                console.log("kill tank, positive reward");
            }else{
                this.reward = this.NO_KILL_REWARD;
                console.log("no kill, small negative reward");
            }
        }
     }
     if(this.type === "B"){
        if(player2Die){
            this.reward = this.DEATH_REWARD;
            console.log("be killed, big negative reward");
        }
        else if(player1Die){
            this.reward = this.WIN_REWARD;
            console.log("kill enemy, big positive reward");
        }else{
            if(this.collideNum < player2CollideNum){
                this.reward = this.KILL_REWARD;
                console.log("kill tank, positive reward");
            }else{
                this.reward = this.NO_KILL_REWARD;
                console.log("no kill, small negative reward");
            }
        }
     }
  }
  setDone(){
      this.done = false;
      if(player1Die || player2Die){
        this.done = true;
      }
  }
  setNextState(){
      this.nextState = this.getState();
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  loadDeepQNetwork(){
    if(this.wHeight == undefined){
        this.wHeight = Math.floor(canvas.height*this.scaleFactor)
    }
    if(this.wWidth==undefined){
        this.wWidth = Math.floor(canvas.width*this.scaleFactor)
    }
    //
    if(this.onlineNetwork == undefined){
       try{
            //load from file
            this.onlineNetwork = this.createDeepQNetwork(this.wHeight, this.wWidth, 10);
       }catch(error){
            //create
            this.onlineNetwork = this.createDeepQNetwork(this.wHeight, this.wWidth, 10);
       }
    }
    //
    if(this.targetNetwork == undefined){
        this.targetNetwork = this.createDeepQNetwork(this.wHeight, this.wWidth, 10);
        // Freeze target network: it's weights are updated only through copying from the online network.
        this.targetNetwork.trainable = false;
    }
    //
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  evaluateAction(){
    //check if buffer is full
    this.appendItem2ReplayBuffer();
    if(this.checkReplayBuffer()){
    }
  }
  /**
     * Play one step of the game.
     *
     * @returns {number | null} If this step leads to the end of the game,
     *   the total reward from the game as a plain number. Else, `null`.
     */
    takeAction() {
      this.epsilon = this.frameCount >= this.epsilonDecayFrames ?
          this.epsilonFinal :
          this.epsilonInit + this.epsilonIncrement_  * this.frameCount;
      this.frameCount++;
      //
      // The epsilon-greedy algorithm.
      //////////////////////////////////////////
      this.setCollideNum();
      //////////////////////////////////////////
      this.action = undefined;
      this.state = this.getState();
      if (Math.random() < this.epsilon) {
        // Pick an action at random.
        this.action = this.getRandomAction();
        console.log("Random take action", this.action)
      } else {
        // Greedily pick an action based on online DQN output.
        tf.tidy(() => {
          const stateTensor = this.getStateTensor(this.state)
          this.action = this.ALL_ACTIONS[this.onlineNetwork.predict(stateTensor).argMax(-1).dataSync()[0]];
          console.log("DQN take action", this.action)
        });
      }
      if(this.action != undefined){
        const moveDirection = this.action>>1;
        console.log(moveDirection)
        this.#move(moveDirection);
        /*
        var c = (new Date()).valueOf()
        if (c - this.firetimestamp > 500) {
          this.firetimestamp = c
          this.#fire();
          document.onkeyup(this.#fireEv);
        }
        */
        if(this.action%2 == 1){
            this.#fire();
            document.onkeyup(this.#fireEv);
        }
      }
      this.#setName();
    }
    getRandomAction(){
        return this.getRandomInteger(0, this.NUM_ACTIONS);
    }
    getRandomInteger(min, max) {
      // Note that we don't reuse the implementation in the more generic
      // `getRandomIntegers()` (plural) below, for performance optimization.
      return Math.floor((max - min) * Math.random()) + min;
    }
    //
    getState(){
        // 当前的坦克实例
        var cur = undefined
        var enr = undefined
        aMyTankCount.forEach(element => {
          var c = element
          if(this.type === "A"){
              if(c['id'] == 100)
              {
                cur = c
              }
              if(c['id'] == 200)
              {
                enr = c
              }
          } else {
            if(c['id'] == 100){
                enr = c
            }
            if(c['id'] == 200){
                cur = c
            }
          }
        });
        const myTank = cur
        const enemyPlayerTank = enr
        if (!myTank) return;
        //下面是方便读取的全局数据的别名
        // 所有的地方坦克实例数组
        const enemyTanks = aTankCount;
        // 所有的敌方子弹实例数组
        const enemyBullets = aBulletCount;
        //我方子弹
        const myBullets = this.type === "A" ? aMyBulletCount1 : aMyBulletCount2;
        //对手子弹
        const enemyPlayerBullets = this.type === "A" ? aMyBulletCount2 : aMyBulletCount1;
        //
        const ametals = ametal
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        return {
            "ametals" : ametals,
            "myTank" : myTank,
            "myBullets": myBullets,
            "enemyTanks" : enemyTanks,
            "enemyBullets" : enemyBullets,
            "enemyPlayerTank" : enemyPlayerTank,
            "enemyPlayerBullets" : enemyPlayerBullets
        }
    }
    //
    getStateTensor(state) {
        if (!Array.isArray(state)) {
          state = [state];
        }
        const numExamples = state.length;
        // TODO(cais): Maintain only a single buffer for efficiency.
        const buffer = tf.buffer([numExamples, this.wHeight, this.wWidth, 1]);
        //
        for (let n = 0; n < numExamples; ++n) {
          //
          if (state[n] == null) {
            continue;
          }
          // mark the amental
          const ametals = state[n].ametals
          for(var i = 0;i<ametals.length;i++){
            const ametalValue = this.ametalBaseValue
            this.mark(buffer, ametalValue, ametals[i][0],ametals[i][1],ametals[i][2],ametals[i][3]);
          }
          // Mark myTank
          const myTank = state[n].myTank
          const myTankValue = this.myTankBaseValue + myTank.direction * 0.25
          this.mark(buffer, myTankValue, myTank.X, myTank.Y, this.tankWH)
          // Mark myBullets
          for(const myBullet of state[n].myBullets){
            const myBulletValue = this.myBulletBaseValue + myBullet.direction * 0.25
            this.mark(buffer, myBulletValue, myBullet.X, myBullet.Y, this.bulletWH)
          }
          // Mark enemyTanks
          for (const enemyTank of state[n].enemyTanks){
            const enemyTankValue = this.enemyTankBaseValue + enemyTank.direction * 0.25
            this.mark(buffer, enemyTankValue, enemyTank.X, enemyTank.Y, this.tankWH)
          }
          // Mark enemyBullets
          for (const enemyBullet of state[n].enemyBullets){
            const enemyBulletValue = this.enemyBulletBaseValue + enemyBullet.direction * 0.25
            this.mark(buffer, enemyBulletValue, enemyBullet.X, enemyBullet.Y, this.bulletWH)
          }
          // Mark enemyPlayerTank.
          if( state[n].enemyPlayerTank != undefined){
            const enemyPlayerTank = state[n].enemyPlayerTank
            const enemyPlayerTankValue = this.enemyPlayerTankBaseValue + enemyPlayerTank.direction * 0.25
             this.mark(buffer, enemyPlayerTankValue, enemyPlayerTank.X, enemyPlayerTank.Y, this.tankWH)
          }
          // Mark enemyPlayerBullets
          for (const enemyPlayerBullet of state[n].enemyPlayerBullets){
            const enemyPlayerBulletValue = this.enemyPlayerBulletBaseValue + enemyPlayerBullet.direction * 0.25
            this.mark(buffer, enemyPlayerBulletValue, enemyPlayerBullet.X, enemyPlayerBullet.Y, this.bulletWH)
          }
          //
        }
        return buffer.toTensor();
    }
    //
    mark(buffer, value, n, x, y, width){
        for (let h=y; h<=y+width; h++){
          for (let w=x; w<=x+width; w++){
            var resizedW = Math.floor(w*this.scaleFactor);
            var resizedH = Math.floor(h*this.scaleFactor);
            //检查边界？
            if(resizedW>this.wWidth) resizedW = this.wWidth;
            if(resizedH>this.wHeight) resizedH = this.wHeight;
            buffer.set(value, n, resizedH, resizedW, 0);
          }
        }
    }
    //
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  land() {
    //load or create deep-q-network
    this.loadDeepQNetwork();
    this.takeAction();
  }
  leave() {
    this.#setName();
    document.onkeyup(this.#moveEv);
    document.onkeyup(this.#fireEv);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // 设置队伍
    #setName() {
      document.getElementById(
        `Player${this.type === "A" ? 1 : 2}barName`
      ).value = "test1"
      document.getElementById(
        `Player${this.type === "A" ? 1 : 2}Name`
      ).textContent = "test1"
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
  /////////////////////////////////deep-Q-network/////////////////////////////////
  createDeepQNetwork(h, w, numActions) {
    if (!(Number.isInteger(h) && h > 0)) {
      throw new Error(`Expected height to be a positive integer, but got ${h}`);
    }
    if (!(Number.isInteger(w) && w > 0)) {
      throw new Error(`Expected width to be a positive integer, but got ${w}`);
    }
    if (!(Number.isInteger(numActions) && numActions > 1)) {
      throw new Error(
          `Expected numActions to be a integer greater than 1, ` +
          `but got ${numActions}`);
    }
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
      filters: 2,
      kernelSize: 10,
      strides: 5,
      activation: 'relu',
      inputShape: [h, w, 1]
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      strides: 2,
      activation: 'relu'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({
      filters: 256,
      kernelSize: 3,
      strides: 1,
      activation: 'relu'
    }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({units: 100, activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.25}));
    model.add(tf.layers.dense({units: numActions}));
    return model;
  }
  copyWeights(destNetwork, srcNetwork) {
    // https://github.com/tensorflow/tfjs/issues/1807:
    // Weight orders are inconsistent when the trainable attribute doesn't
    // match between two `LayersModel`s. The following is a workaround.
    // TODO(cais): Remove the workaround once the underlying issue is fixed.
    let originalDestNetworkTrainable;
    if (destNetwork.trainable !== srcNetwork.trainable) {
      originalDestNetworkTrainable = destNetwork.trainable;
      destNetwork.trainable = srcNetwork.trainable;
    }
    destNetwork.setWeights(srcNetwork.getWeights());
    // Weight orders are inconsistent when the trainable attribute doesn't
    // match between two `LayersModel`s. The following is a workaround.
    // TODO(cais): Remove the workaround once the underlying issue is fixed.
    // `originalDestNetworkTrainable` is null if and only if the `trainable`
    // properties of the two LayersModel instances are the same to begin
    // with, in which case nothing needs to be done below.
    if (originalDestNetworkTrainable != null) {
      destNetwork.trainable = originalDestNetworkTrainable;
    }
  }
  /////////////////////////////////replay-memory/////////////////////////////////
  constructReplayBuffer(maxLen) {
        this.maxLen = maxLen;
        this.buffer = [];
        for (let i = 0; i < maxLen; ++i) {
          this.buffer.push(null);
        }
        this.index = 0;
        this.length = 0;
        this.bufferIndices_ = [];
        for (let i = 0; i < maxLen; ++i) {
          this.bufferIndices_.push(i);
        }
  }
  /**
   * set reward done state and append an item to the replay buffer.
   *
   * @param {any} item The item to append.
   */
  appendItem2ReplayBuffer() {
    //
    this.setReward();
    this.setDone();
    this.setNextState();
    //
    const item = [this.state, this.action, this.reward, this.done, this.nextState]
    this.buffer[this.index] = item;
    this.length = Math.min(this.length + 1, this.maxLen);
    this.index = (this.index + 1) % this.maxLen;
    //
    //if(this.length == this.maxLen){
    //    this.trainOnReplayBatch(this.batchSize, this.gamma, this.optimizer)
    //}
  }
  //
  checkReplayBuffer(){
    return this.
  }
  /**
   * Randomly sample a batch of items from the replay buffer.
   *
   * The sampling is done *without* replacement.
   *
   * @param {number} batchSize Size of the batch.
   * @return {Array<any>} Sampled items.
   */
  sample(batchSize) {
    if (batchSize > this.maxLen) {
      throw new Error(
          `batchSize (${batchSize}) exceeds buffer length (${this.maxLen})`);
    }
    tf.util.shuffle(this.bufferIndices_);
    const out = [];
    for (let i = 0; i < batchSize; ++i) {
      out.push(this.buffer[this.bufferIndices_[i]]);
    }
    return out;
  }
  //
  trainOnReplayBatch(batchSize, gamma, optimizer) {
      // Get a batch of examples from the replay buffer.
      const batch = this.sample(batchSize);
      const lossFunction = () => tf.tidy(() => {
        const stateTensor = getStateTensor(batch.map(example => example[0]), this.game.height, this.game.width);
        const actionTensor = tf.tensor1d(batch.map(example => example[1]), 'int32');
        const qs = this.onlineNetwork.apply(stateTensor, {training: true}).mul(tf.oneHot(actionTensor, NUM_ACTIONS)).sum(-1);
        //
        const rewardTensor = tf.tensor1d(batch.map(example => example[2]));
        const nextStateTensor = this.getStateTensor(batch.map(example => example[4]), this.game.height, this.game.width);
        const nextMaxQTensor =
            this.targetNetwork.predict(nextStateTensor).max(-1);
        const doneMask = tf.scalar(1).sub(
            tf.tensor1d(batch.map(example => example[3])).asType('float32'));
        const targetQs =
            rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma));
        return tf.losses.meanSquaredError(targetQs, qs);
      });
      // Calculate the gradients of the loss function with repsect to the weights
      // of the online DQN.
      const grads = tf.variableGrads(lossFunction);
      // Use the gradients to update the online DQN's weights.
      optimizer.applyGradients(grads.grads);
      tf.dispose(grads);
      // TODO(cais): Return the loss value here?
  }
  //
  constructRewardBuffer(bufferLength){
    this.rewardBuffer = [];
        for (let i = 0; i < bufferLength; ++i) {
          this.rewardBuffer.push(null);
        }
  }
  //
  appendRewardBuffer(x){
    this.rewardBuffer.shift();
    this.rewardBuffer.push(x);
  }
  //
  averageReward() {
      return this.rewardBuffer.reduce((x, prev) => x + prev) / this.buffer.length;
  }
  train() {
      //////////////////////////////////////////////////////////////////////////////////
      const batchSize = this.batchSize;
      const gamma = this.gamma
      const learningRate = this.learningRate
      const cumulativeRewardThreshold = this.cumulativeRewardThreshold
      const maxNumFrames = this.maxNumFrames
      const syncEveryFrames = this.syncEveryFrames
      const savePath = this.savePath
      const logDir = this.logDir
      //
      //const optimizer = this.optimizer
      ////////////////////////////////////////////////////////////////////////////////
      let summaryWriter;
      if (logDir != null) {
        summaryWriter = tf.node.summaryFileWriter(logDir);
      }
              // Moving averager: cumulative reward across 100 most recent 100 episodes.
              //const rewardAverager100 = new MovingAverager(100);
              // Moving averager: fruits eaten across 100 most recent 100 episodes.
              //const eatenAverager100 = new MovingAverager(100);
              const optimizer = tf.train.adam(learningRate);
              let tPrev = new Date().getTime();
              let frameCountPrev = this.frameCount;
              let averageReward100Best = -Infinity;
              while (true) {
                this.trainOnReplayBatch(batchSize, gamma, optimizer);
                //
                const {cumulativeReward, done, fruitsEaten} = this.playStep();
                //
                if (done) {
                  const t = new Date().getTime();
                  const framesPerSecond = (this.frameCount - frameCountPrev) / (t - tPrev) * 1e3;
                  tPrev = t;
                  frameCountPrev = agent.frameCount;
                  //
                  rewardAverager100.append(cumulativeReward);
                  eatenAverager100.append(fruitsEaten);
                  const averageReward100 = rewardAverager100.average();
                  const averageEaten100 = eatenAverager100.average();
                  ///////////////////////////////////////////////////////////////////////////////////
                  console.log(
                      `Frame #${agent.frameCount}: ` +
                      `cumulativeReward100=${averageReward100.toFixed(1)}; ` +
                      `eaten100=${averageEaten100.toFixed(2)} ` +
                      `(epsilon=${agent.epsilon.toFixed(3)}) ` +
                      `(${framesPerSecond.toFixed(1)} frames/s)`);
                  if (summaryWriter != null) {
                    summaryWriter.scalar('cumulativeReward100', averageReward100, agent.frameCount);
                    summaryWriter.scalar('eaten100', averageEaten100, agent.frameCount);
                    summaryWriter.scalar('epsilon', agent.epsilon, agent.frameCount);
                    summaryWriter.scalar('framesPerSecond', framesPerSecond, agent.frameCount);
                  }
                  /////////////////////////////////////////////////////////////////////////////////////
                  if (averageReward100 >= cumulativeRewardThreshold ||agent.frameCount >= maxNumFrames) {
                    // TODO(cais): Save online network.
                    break;
                  }
                  if (averageReward100 > averageReward100Best) {
                    averageReward100Best = averageReward100;
                    if (savePath != null) {
                      if (!fs.existsSync(savePath)) {
                        mkdir('-p', savePath);
                      }
                      await agent.onlineNetwork.save(`file://${savePath}`);
                      console.log(`Saved DQN to ${savePath}`);
                    }
                  }
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////
                if (this.frameCount % syncEveryFrames === 0) {
                  this.copyWeights(this.targetNetwork, this.onlineNetwork);
                  console.log('Sync\'ed weights from online network to target network');
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////
             }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
})("B");