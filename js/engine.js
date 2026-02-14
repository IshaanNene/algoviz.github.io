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
    this.speed = 1;
    this.animFrameId = null;
    this.lastFrameTime = 0;
    this.onStep = null;
    this.onComplete = null;
    this.onReset = null;
    this.baseDelay = 200;
  }

  loadSteps(steps) {
    this.stop();
    this.steps = steps;
    this.currentStep = -1;
  }

  loadFromGenerator(generator) {
    const steps = [];
    for (const step of generator) steps.push(step);
    this.loadSteps(steps);
  }

  getDelay() { return this.baseDelay / this.speed; }

  play() {
    if (this.steps.length === 0) return;
    if (this.currentStep >= this.steps.length - 1) {
      this.currentStep = -1;
      if (this.onReset) this.onReset();
    }
    this.isPlaying = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this._tick();
  }

  pause() {
    this.isPlaying = false;
    this.isPaused = true;
    if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = -1;
    if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
    if (this.onReset) this.onReset();
  }

  stepForward() {
    if (this.currentStep < this.steps.length - 1) { this.currentStep++; this._emitStep(); }
  }

  stepBackward() {
    if (this.currentStep > 0) { this.currentStep--; this._replayToStep(this.currentStep); }
    else if (this.currentStep === 0) { this.currentStep = -1; if (this.onReset) this.onReset(); }
  }

  jumpToStep(index) {
    if (index < 0) index = 0;
    if (index >= this.steps.length) index = this.steps.length - 1;
    this.currentStep = index;
    this._replayToStep(index);
  }

  setSpeed(speed) { this.speed = Math.max(0.25, Math.min(16, speed)); }

  getState() {
    return {
      currentStep: this.currentStep, totalSteps: this.steps.length,
      isPlaying: this.isPlaying, isPaused: this.isPaused, speed: this.speed,
      progress: this.steps.length > 0 ? (this.currentStep + 1) / this.steps.length : 0
    };
  }

  _tick() {
    if (!this.isPlaying) return;
    this.animFrameId = requestAnimationFrame((timestamp) => {
      if (timestamp - this.lastFrameTime >= this.getDelay()) {
        this.lastFrameTime = timestamp;
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++;
          this._emitStep();
          this._tick();
        } else {
          this.isPlaying = false;
          if (this.onComplete) this.onComplete();
        }
      } else { this._tick(); }
    });
  }

  _emitStep() {
    if (this.onStep && this.currentStep >= 0 && this.currentStep < this.steps.length)
      this.onStep(this.steps[this.currentStep], this.currentStep);
  }

  _replayToStep(targetIndex) {
    if (this.onReset) this.onReset();
    for (let i = 0; i <= targetIndex; i++) {
      this.currentStep = i;
      if (this.onStep) this.onStep(this.steps[i], i);
    }
  }
}

window.AlgoEngine = ExecutionEngine;
