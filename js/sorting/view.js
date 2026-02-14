/* ============================================
   SORTING VIEW
   ============================================ */
const SortingView = {
  engine: null, currentAlgo: 'bubble', originalArray: [], arraySize: 30, resizeHandler: null,

  mount(container) {
    this.engine = new AlgoEngine(); this.engine.baseDelay = 150;
    const algorithms = Object.keys(SortingAlgorithms.info);
    const opts = algorithms.map(k => `<option value="${k}" ${k === this.currentAlgo ? 'selected' : ''}>${SortingAlgorithms.info[k].name}</option>`).join('');
    const info = SortingAlgorithms.info[this.currentAlgo];

    container.innerHTML = `
      <div class="sorting-view">
        <div class="page-header">
          <h2 class="page-title">Sorting <span class="title-accent">Algorithms</span></h2>
          <div class="toolbar-group"><select id="sort-algo-select" class="brutal-select">${opts}</select></div>
        </div>
        <div class="algo-desc" id="sort-algo-desc">
          <span>${info.desc}</span>
          <span class="complexity-badge" id="sort-complexity">Time: ${info.time}</span>
          <span class="complexity-badge" id="sort-space" style="background:var(--green)">Space: ${info.space}</span>
        </div>
        <div class="toolbar">
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Size</label>
            <input type="range" id="sort-size" class="brutal-range" min="5" max="150" value="${this.arraySize}" style="width:120px">
            <span id="sort-size-val" class="stat-badge"><span class="stat-value">${this.arraySize}</span></span>
          </div>
          <div class="toolbar-separator"></div>
          <button id="sort-generate" class="brutal-btn accent">⟳ Generate</button>
          <button id="sort-nearly" class="brutal-btn small">Nearly Sorted</button>
          <button id="sort-reversed" class="brutal-btn small danger">Reversed</button>
          <button id="sort-few-unique" class="brutal-btn small purple">Few Unique</button>
        </div>
        <div class="controls-bar">
          <div class="playback-controls">
            <button id="sort-step-back" class="brutal-btn icon-btn small">⏮</button>
            <button id="sort-play" class="brutal-btn icon-btn primary">▶</button>
            <button id="sort-pause" class="brutal-btn icon-btn accent hidden">⏸</button>
            <button id="sort-stop" class="brutal-btn icon-btn danger">⏹</button>
            <button id="sort-step-fwd" class="brutal-btn icon-btn small">⏭</button>
          </div>
          <div class="timeline">
            <label class="brutal-label" style="margin:0">Step</label>
            <input type="range" id="sort-timeline" class="brutal-range timeline-slider" min="0" max="0" value="0">
            <span id="sort-step-info" class="stat-badge"><span class="stat-value">0/0</span></span>
          </div>
          <div class="speed-control">
            <label class="brutal-label" style="margin:0">Speed</label>
            <input type="range" id="sort-speed" class="brutal-range" min="1" max="16" value="4" style="width:80px">
            <span id="sort-speed-val" class="stat-badge"><span class="stat-value">1×</span></span>
          </div>
          <div class="stats">
            <span class="stat-badge" id="sort-comparisons">Comparisons: <span class="stat-value">0</span></span>
            <span class="stat-badge" id="sort-swaps">Swaps: <span class="stat-value">0</span></span>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#1A1A1A"></div><span>Default</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#845EC2"></div><span>Comparing</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FF6B6B"></div><span>Swapping</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFA552"></div><span>Overwriting</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#4ECDC4"></div><span>Sorted</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFE66D"></div><span>Pivot</span></div>
        </div>
        <div class="canvas-container"><canvas id="sort-canvas"></canvas></div>
      </div>`;

    SortingRenderer.init(document.getElementById('sort-canvas'));
    this._generateArray();
    this._bindEvents();
  },

  _bindEvents() {
    const self = this; let comparisons = 0, swaps = 0;
    document.getElementById('sort-algo-select').addEventListener('change', function () {
      self.currentAlgo = this.value;
      const info = SortingAlgorithms.info[self.currentAlgo];
      document.getElementById('sort-algo-desc').querySelector('span').textContent = info.desc;
      document.getElementById('sort-complexity').textContent = 'Time: ' + info.time;
      document.getElementById('sort-space').textContent = 'Space: ' + info.space;
      self.engine.stop(); self._updatePlayPause(false); SortingRenderer.reset(self.originalArray);
      self.engine.steps = [];  // clear cached steps so Play recomputes for new algo
      document.getElementById('sort-timeline').value = 0;
      document.getElementById('sort-timeline').max = 0;
      self._updateStepInfo(0, 0); self._updateStats(0, 0);
    });
    const sizeSlider = document.getElementById('sort-size');
    sizeSlider.addEventListener('input', function () { self.arraySize = parseInt(this.value); document.getElementById('sort-size-val').querySelector('.stat-value').textContent = self.arraySize; });
    sizeSlider.addEventListener('change', function () { self._generateArray(); });
    document.getElementById('sort-generate').addEventListener('click', () => this._generateArray());
    document.getElementById('sort-nearly').addEventListener('click', () => this._generateArray('nearly'));
    document.getElementById('sort-reversed').addEventListener('click', () => this._generateArray('reversed'));
    document.getElementById('sort-few-unique').addEventListener('click', () => this._generateArray('few-unique'));

    const speedValues = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 16];
    document.getElementById('sort-speed').addEventListener('input', function () {
      const sp = speedValues[parseInt(this.value) - 1] || 1; self.engine.setSpeed(sp);
      document.getElementById('sort-speed-val').querySelector('.stat-value').textContent = sp + '×';
    });

    document.getElementById('sort-play').addEventListener('click', () => {
      if (this.engine.steps.length === 0) {
        const steps = SortingAlgorithms.run(this.currentAlgo, [...this.originalArray]);
        this.engine.loadSteps(steps); document.getElementById('sort-timeline').max = steps.length - 1;
      }
      comparisons = 0; swaps = 0; this.engine.play(); this._updatePlayPause(true);
    });
    document.getElementById('sort-pause').addEventListener('click', () => { this.engine.pause(); this._updatePlayPause(false); });
    document.getElementById('sort-stop').addEventListener('click', () => { this.engine.stop(); comparisons = 0; swaps = 0; this._updateStats(0, 0); this._updatePlayPause(false); SortingRenderer.reset(this.originalArray); document.getElementById('sort-timeline').value = 0; this._updateStepInfo(0, 0); });
    document.getElementById('sort-step-fwd').addEventListener('click', () => { if (this.engine.steps.length === 0) { const steps = SortingAlgorithms.run(this.currentAlgo, [...this.originalArray]); this.engine.loadSteps(steps); document.getElementById('sort-timeline').max = steps.length - 1; } this.engine.stepForward(); });
    document.getElementById('sort-step-back').addEventListener('click', () => { this.engine.stepBackward(); });

    document.getElementById('sort-timeline').addEventListener('input', function () {
      const idx = parseInt(this.value); self.engine.pause(); self._updatePlayPause(false);
      comparisons = 0; swaps = 0;
      for (let i = 0; i <= idx; i++) { const s = self.engine.steps[i]; if (s && s.type === 'compare') comparisons++; if (s && s.type === 'swap') swaps++; }
      self._updateStats(comparisons, swaps); self.engine.jumpToStep(idx);
    });

    this.engine.onStep = (step, index) => {
      if (step.type === 'compare') comparisons++; if (step.type === 'swap') swaps++;
      SortingRenderer.applyStep(step); document.getElementById('sort-timeline').value = index;
      this._updateStepInfo(index + 1, this.engine.steps.length); this._updateStats(comparisons, swaps);
    };
    this.engine.onComplete = () => { this._updatePlayPause(false); };
    this.engine.onReset = () => { comparisons = 0; swaps = 0; SortingRenderer.reset(this.originalArray); this._updateStats(0, 0); };
    this.resizeHandler = () => SortingRenderer._resize();
    window.addEventListener('resize', this.resizeHandler);
  },

  _generateArray(type = 'random') {
    this.engine.stop(); this._updatePlayPause(false);
    const n = this.arraySize; let arr = [];
    switch (type) {
      case 'nearly': arr = Array.from({ length: n }, (_, i) => i + 1); for (let i = 0; i < Math.max(2, Math.floor(n * 0.1)); i++) { const a = Math.floor(Math.random() * n), b = Math.floor(Math.random() * n);[arr[a], arr[b]] = [arr[b], arr[a]]; } break;
      case 'reversed': arr = Array.from({ length: n }, (_, i) => n - i); break;
      case 'few-unique': const vals = [10, 30, 50, 70, 90]; arr = Array.from({ length: n }, () => vals[Math.floor(Math.random() * vals.length)]); break;
      default: arr = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    }
    this.originalArray = [...arr]; SortingRenderer.setArray(arr);
    document.getElementById('sort-timeline').value = 0; document.getElementById('sort-timeline').max = 0;
    this._updateStepInfo(0, 0); this._updateStats(0, 0); this.engine.steps = [];
  },

  _updatePlayPause(p) { document.getElementById('sort-play').classList.toggle('hidden', p); document.getElementById('sort-pause').classList.toggle('hidden', !p); },
  _updateStepInfo(c, t) { const el = document.getElementById('sort-step-info'); if (el) el.querySelector('.stat-value').textContent = `${c}/${t}`; },
  _updateStats(c, s) { const ce = document.getElementById('sort-comparisons'), se = document.getElementById('sort-swaps'); if (ce) ce.querySelector('.stat-value').textContent = c; if (se) se.querySelector('.stat-value').textContent = s; },

  unmount() { if (this.engine) this.engine.stop(); if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler); SortingRenderer.destroy(); }
};
window.SortingView = SortingView;
