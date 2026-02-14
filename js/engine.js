/* ============================================
   EXECUTION ENGINE
   Step-based algorithm execution with
   deterministic playback and timeline scrubbing
   ============================================ */

class ExecutionEngine {
  constructor() {
    this.steps = [];
    this.currentStep = -1;
    this.isPlaying = false;
    this.isPaused = false;
    this.speed = 1;           // 0.25x to 4x
    this.animFrameId = null;
    this.lastFrameTime = 0;
    this.onStep = null;       // callback(step, index)
    this.onComplete = null;   // callback()
    this.onReset = null;      // callback()
    this.baseDelay = 200;     // ms between steps at 1x speed
  }

  /**
   * Load steps from an algorithm generator
   * @param {Array} steps - Array of step objects
   */
  loadSteps(steps) {
    this.stop();
    this.steps = steps;
    this.currentStep = -1;
  }

  /**
   * Run algorithm generator and collect all steps
   * @param {Generator} generator - Algorithm generator yielding step events
   */
  loadFromGenerator(generator) {
    const steps = [];
    for (const step of generator) {
      steps.push(step);
    }
    this.loadSteps(steps);
  }

  /** Get delay based on current speed */
  getDelay() {
    return this.baseDelay / this.speed;
  }

  /** Start or resume playback */
  play() {
    if (this.steps.length === 0) return;
    if (this.currentStep >= this.steps.length - 1) {
      // Already at end, reset first
      this.currentStep = -1;
      if (this.onReset) this.onReset();
    }
    this.isPlaying = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this._tick();
  }

  /** Pause playback */
  pause() {
    this.isPlaying = false;
    this.isPaused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** Stop and reset */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = -1;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onReset) this.onReset();
  }

  /** Step forward one step */
  stepForward() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this._emitStep();
    }
  }

  /** Step backward one step */
  stepBackward() {
    if (this.currentStep > 0) {
      this.currentStep--;
      // For backward, we need to replay from start to current step
      this._replayToStep(this.currentStep);
    } else if (this.currentStep === 0) {
      this.currentStep = -1;
      if (this.onReset) this.onReset();
    }
  }

  /**
   * Jump to a specific step (timeline scrubbing)
   * @param {number} index - Step index to jump to
   */
  jumpToStep(index) {
    if (index < 0) index = 0;
    if (index >= this.steps.length) index = this.steps.length - 1;
    this.currentStep = index;
    this._replayToStep(index);
  }

  /** Set playback speed */
  setSpeed(speed) {
    this.speed = Math.max(0.25, Math.min(4, speed));
  }

  /** Get info about current state */
  getState() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      speed: this.speed,
      progress: this.steps.length > 0 ? (this.currentStep + 1) / this.steps.length : 0
    };
  }

  /** Internal: animation loop */
  _tick() {
    if (!this.isPlaying) return;
    
    this.animFrameId = requestAnimationFrame((timestamp) => {
      const elapsed = timestamp - this.lastFrameTime;
      
      if (elapsed >= this.getDelay()) {
        this.lastFrameTime = timestamp;
        
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++;
          this._emitStep();
          this._tick();
        } else {
          // Reached end
          this.isPlaying = false;
          if (this.onComplete) this.onComplete();
        }
      } else {
        this._tick();
      }
    });
  }

  /** Internal: emit current step */
  _emitStep() {
    if (this.onStep && this.currentStep >= 0 && this.currentStep < this.steps.length) {
      this.onStep(this.steps[this.currentStep], this.currentStep);
    }
  }

  /** Internal: replay all steps up to a given index (for backward/scrubbing) */
  _replayToStep(targetIndex) {
    if (this.onReset) this.onReset();
    for (let i = 0; i <= targetIndex; i++) {
      this.currentStep = i;
      if (this.onStep) {
        this.onStep(this.steps[i], i);
      }
    }
  }
}

// Global engine instance
window.AlgoEngine = ExecutionEngine;
