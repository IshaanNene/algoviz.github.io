/* ============================================
   SEARCHING VIEW
   ============================================ */
const SearchView = {
    engine: null, currentAlgo: 'linear', originalArray: [], arraySize: 20,
    target: null, resizeHandler: null,

    mount(container) {
        this.engine = new AlgoEngine(); this.engine.baseDelay = 250;
        const algorithms = Object.keys(SearchAlgorithms.info);
        const opts = algorithms.map(k => `<option value="${k}" ${k === this.currentAlgo ? 'selected' : ''}>${SearchAlgorithms.info[k].name}</option>`).join('');
        const info = SearchAlgorithms.info[this.currentAlgo];

        container.innerHTML = `
      <div class="searching-view">
        <div class="page-header">
          <h2 class="page-title">Searching <span class="title-accent">Algorithms</span></h2>
          <div class="toolbar-group"><select id="search-algo-select" class="brutal-select">${opts}</select></div>
        </div>
        <div class="algo-desc" id="search-algo-desc">
          <span>${info.desc}</span>
          <span class="complexity-badge" id="search-complexity">Time: ${info.time}</span>
          <span class="complexity-badge" id="search-space" style="background:var(--green)">Space: ${info.space}</span>
        </div>
        <div class="toolbar">
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Size</label>
            <input type="range" id="search-size" class="brutal-range" min="5" max="60" value="${this.arraySize}" style="width:100px">
            <span id="search-size-val" class="stat-badge"><span class="stat-value">${this.arraySize}</span></span>
          </div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Target</label>
            <input type="number" id="search-target" class="brutal-input" value="" style="width:70px" placeholder="?">
          </div>
          <div class="toolbar-separator"></div>
          <button id="search-generate" class="brutal-btn accent">⟳ Generate</button>
          <button id="search-random-target" class="brutal-btn small purple">Random Target</button>
        </div>
        <div class="controls-bar">
          <div class="playback-controls">
            <button id="search-step-back" class="brutal-btn icon-btn small">⏮</button>
            <button id="search-play" class="brutal-btn icon-btn primary">▶</button>
            <button id="search-pause" class="brutal-btn icon-btn accent hidden">⏸</button>
            <button id="search-stop" class="brutal-btn icon-btn danger">⏹</button>
            <button id="search-step-fwd" class="brutal-btn icon-btn small">⏭</button>
          </div>
          <div class="timeline">
            <label class="brutal-label" style="margin:0">Step</label>
            <input type="range" id="search-timeline" class="brutal-range timeline-slider" min="0" max="0" value="0">
            <span id="search-step-info" class="stat-badge"><span class="stat-value">0/0</span></span>
          </div>
          <div class="speed-control">
            <label class="brutal-label" style="margin:0">Speed</label>
            <input type="range" id="search-speed" class="brutal-range" min="1" max="8" value="3" style="width:80px">
            <span id="search-speed-val" class="stat-badge"><span class="stat-value">1×</span></span>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#FFFFFF"></div><span>Default</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFE66D"></div><span>Checking</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#D5D5D5"></div><span>Eliminated</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#E8D5F5"></div><span>Jump Range</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#4ECDC4"></div><span>Found</span></div>
        </div>
        <div class="canvas-container"><canvas id="search-canvas"></canvas></div>
      </div>`;

        SearchRenderer.init(document.getElementById('search-canvas'));
        this._generateArray();
        this._bindEvents();
    },

    _bindEvents() {
        const self = this;

        document.getElementById('search-algo-select').addEventListener('change', function () {
            self.currentAlgo = this.value;
            const info = SearchAlgorithms.info[self.currentAlgo];
            document.getElementById('search-algo-desc').querySelector('span').textContent = info.desc;
            document.getElementById('search-complexity').textContent = 'Time: ' + info.time;
            document.getElementById('search-space').textContent = 'Space: ' + info.space;
            self.engine.stop(); self._updatePlayPause(false);
            SearchRenderer.reset(self.originalArray, self.target);
            self.engine.steps = [];
            document.getElementById('search-timeline').value = 0;
            document.getElementById('search-timeline').max = 0;
            self._updateStepInfo(0, 0);
        });

        const sizeSlider = document.getElementById('search-size');
        sizeSlider.addEventListener('input', function () {
            self.arraySize = parseInt(this.value);
            document.getElementById('search-size-val').querySelector('.stat-value').textContent = self.arraySize;
        });
        sizeSlider.addEventListener('change', function () { self._generateArray(); });

        document.getElementById('search-generate').addEventListener('click', () => this._generateArray());
        document.getElementById('search-random-target').addEventListener('click', () => {
            if (this.originalArray.length > 0) {
                this.target = this.originalArray[Math.floor(Math.random() * this.originalArray.length)];
                document.getElementById('search-target').value = this.target;
                SearchRenderer.reset(this.originalArray, this.target);
                this.engine.stop(); this._updatePlayPause(false); this.engine.steps = [];
                document.getElementById('search-timeline').value = 0; document.getElementById('search-timeline').max = 0;
                this._updateStepInfo(0, 0);
            }
        });

        const speedValues = [0.25, 0.5, 1, 1.5, 2, 3, 4, 8];
        document.getElementById('search-speed').addEventListener('input', function () {
            const sp = speedValues[parseInt(this.value) - 1] || 1; self.engine.setSpeed(sp);
            document.getElementById('search-speed-val').querySelector('.stat-value').textContent = sp + '×';
        });

        document.getElementById('search-play').addEventListener('click', () => {
            const ti = document.getElementById('search-target');
            this.target = parseInt(ti.value);
            if (isNaN(this.target)) {
                // pick a random target
                this.target = this.originalArray[Math.floor(Math.random() * this.originalArray.length)];
                ti.value = this.target;
            }
            if (this.engine.steps.length === 0) {
                const arr = [...this.originalArray];
                // Binary, Jump, Exponential need sorted array
                if (this.currentAlgo !== 'linear') arr.sort((a, b) => a - b);
                const steps = SearchAlgorithms.run(this.currentAlgo, arr, this.target);
                this.engine.loadSteps(steps);
                document.getElementById('search-timeline').max = steps.length - 1;
                // Update renderer array to sorted version if needed
                SearchRenderer.setArray(arr, this.target);
            }
            this.engine.play(); this._updatePlayPause(true);
        });

        document.getElementById('search-pause').addEventListener('click', () => { this.engine.pause(); this._updatePlayPause(false); });
        document.getElementById('search-stop').addEventListener('click', () => {
            this.engine.stop(); this._updatePlayPause(false);
            SearchRenderer.reset(this.originalArray, this.target);
            document.getElementById('search-timeline').value = 0; this._updateStepInfo(0, 0);
            this.engine.steps = [];
        });
        document.getElementById('search-step-fwd').addEventListener('click', () => {
            if (this.engine.steps.length === 0) {
                const ti = document.getElementById('search-target');
                this.target = parseInt(ti.value);
                if (isNaN(this.target)) { this.target = this.originalArray[Math.floor(Math.random() * this.originalArray.length)]; ti.value = this.target; }
                const arr = [...this.originalArray];
                if (this.currentAlgo !== 'linear') arr.sort((a, b) => a - b);
                const steps = SearchAlgorithms.run(this.currentAlgo, arr, this.target);
                this.engine.loadSteps(steps);
                document.getElementById('search-timeline').max = steps.length - 1;
                SearchRenderer.setArray(arr, this.target);
            }
            this.engine.stepForward();
        });
        document.getElementById('search-step-back').addEventListener('click', () => { this.engine.stepBackward(); });

        document.getElementById('search-timeline').addEventListener('input', function () {
            self.engine.pause(); self._updatePlayPause(false);
            self.engine.jumpToStep(parseInt(this.value));
        });

        this.engine.onStep = (step, index) => {
            SearchRenderer.applyStep(step);
            document.getElementById('search-timeline').value = index;
            this._updateStepInfo(index + 1, this.engine.steps.length);
        };
        this.engine.onComplete = () => { this._updatePlayPause(false); };
        this.engine.onReset = () => { SearchRenderer.reset(this.originalArray, this.target); };

        this.resizeHandler = () => SearchRenderer._resize();
        window.addEventListener('resize', this.resizeHandler);
    },

    _generateArray() {
        this.engine.stop(); this._updatePlayPause(false);
        const n = this.arraySize;
        const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
        // Always sort for display (searching usually on sorted arrays)
        arr.sort((a, b) => a - b);
        this.originalArray = [...arr];
        // Pick a random target
        this.target = arr[Math.floor(Math.random() * arr.length)];
        document.getElementById('search-target').value = this.target;
        SearchRenderer.setArray(arr, this.target);
        document.getElementById('search-timeline').value = 0;
        document.getElementById('search-timeline').max = 0;
        this._updateStepInfo(0, 0); this.engine.steps = [];
    },

    _updatePlayPause(p) {
        document.getElementById('search-play').classList.toggle('hidden', p);
        document.getElementById('search-pause').classList.toggle('hidden', !p);
    },
    _updateStepInfo(c, t) {
        const el = document.getElementById('search-step-info');
        if (el) el.querySelector('.stat-value').textContent = `${c}/${t}`;
    },

    unmount() {
        if (this.engine) this.engine.stop();
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
        SearchRenderer.destroy();
    }
};
window.SearchView = SearchView;
