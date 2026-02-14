/* ============================================
   ALGORITHM COMPARISON DASHBOARD
   Side-by-side sorting algorithm race
   ============================================ */
const ComparisonView = {
    engines: [], racers: [], originalArray: [], arraySize: 40,
    selectedAlgos: ['bubble', 'merge'],
    isRacing: false, finishedCount: 0, startTime: 0,
    results: [], resizeHandler: null,

    mount(container) {
        const algoList = Object.keys(SortingAlgorithms.info);
        const checkboxes = algoList.map(k =>
            `<label class="racer-checkbox"><input type="checkbox" value="${k}" ${this.selectedAlgos.includes(k) ? 'checked' : ''}> ${SortingAlgorithms.info[k].name}</label>`
        ).join('');

        container.innerHTML = `
      <div class="comparison-view">
        <div class="page-header">
          <h2 class="page-title">Algorithm <span class="title-accent">Race</span></h2>
        </div>
        <div class="toolbar">
          <div class="toolbar-group algo-checkboxes">${checkboxes}</div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Size</label>
            <input type="range" id="cmp-size" class="brutal-range" min="10" max="200" value="${this.arraySize}" style="width:100px">
            <span id="cmp-size-val" class="stat-badge"><span class="stat-value">${this.arraySize}</span></span>
          </div>
          <div class="toolbar-separator"></div>
          <button id="cmp-race" class="brutal-btn primary">🏁 Start Race</button>
          <button id="cmp-reset" class="brutal-btn danger small">Reset</button>
        </div>
        <div class="speed-bar">
          <label class="brutal-label" style="margin:0">Speed</label>
          <input type="range" id="cmp-speed" class="brutal-range" min="1" max="16" value="8" style="width:120px">
          <span id="cmp-speed-val" class="stat-badge"><span class="stat-value">3×</span></span>
        </div>
        <div class="racer-grid" id="racer-grid"></div>
        <div class="results-card hidden" id="results-card"></div>
      </div>`;

        this._generateArray();
        this._buildRacerGrid();
        this._bindEvents();
    },

    _bindEvents() {
        const self = this;

        // Checkboxes
        document.querySelectorAll('.racer-checkbox input').forEach(cb => {
            cb.addEventListener('change', () => {
                self.selectedAlgos = Array.from(document.querySelectorAll('.racer-checkbox input:checked')).map(c => c.value);
                if (!self.isRacing) {
                    self._buildRacerGrid();
                }
            });
        });

        // Size
        const sizeSlider = document.getElementById('cmp-size');
        sizeSlider.addEventListener('input', function () {
            self.arraySize = parseInt(this.value);
            document.getElementById('cmp-size-val').querySelector('.stat-value').textContent = self.arraySize;
        });
        sizeSlider.addEventListener('change', function () {
            self._stopAll();
            self._generateArray(); self._buildRacerGrid();
        });

        // Speed
        const speedValues = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 16];
        document.getElementById('cmp-speed').addEventListener('input', function () {
            const sp = speedValues[parseInt(this.value) - 1] || 1;
            document.getElementById('cmp-speed-val').querySelector('.stat-value').textContent = sp + '×';
            self.engines.forEach(e => e.setSpeed(sp));
        });

        // Race
        document.getElementById('cmp-race').addEventListener('click', () => {
            if (this.isRacing) return;
            if (this.selectedAlgos.length < 2) return;
            this._startRace();
        });

        // Reset
        document.getElementById('cmp-reset').addEventListener('click', () => {
            this._stopAll();
            this._generateArray();
            this._buildRacerGrid();
            document.getElementById('results-card').classList.add('hidden');
        });

        this.resizeHandler = () => {
            this.racers.forEach(r => { if (r.renderer && r.renderer._resize) r.renderer._resize(); });
        };
        window.addEventListener('resize', this.resizeHandler);
    },

    _generateArray() {
        const n = this.arraySize;
        this.originalArray = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    },

    _buildRacerGrid() {
        const grid = document.getElementById('racer-grid');
        if (!grid) return;
        // Kill old engines and their callbacks
        this.engines.forEach(e => { e.stop(); e.onStep = null; e.onComplete = null; e.onReset = null; });
        grid.innerHTML = '';
        this.engines = [];
        this.racers = [];
        this.results = [];

        const count = this.selectedAlgos.length;
        const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Dynamic card height based on rows and available space
        const rows = Math.ceil(count / cols);
        const gridHeight = grid.clientHeight || 500;
        const cardH = Math.max(160, Math.floor(gridHeight / rows));

        this.selectedAlgos.forEach((algo, i) => {
            const info = SortingAlgorithms.info[algo];
            const card = document.createElement('div');
            card.className = 'racer-card';
            card.style.height = cardH + 'px';
            card.innerHTML = `
        <div class="racer-header">
          <span class="racer-name">${info.name}</span>
          <span class="racer-badge">${info.time}</span>
        </div>
        <div class="racer-stats">
          <span class="stat-badge">Comparisons: <span class="stat-value racer-cmp-${i}">0</span></span>
          <span class="stat-badge">Swaps: <span class="stat-value racer-swp-${i}">0</span></span>
          <span class="stat-badge">Steps: <span class="stat-value racer-stp-${i}">0</span></span>
        </div>
        <div class="racer-canvas-wrap"><canvas class="racer-canvas" id="racer-canvas-${i}"></canvas></div>
        <div class="racer-status" id="racer-status-${i}">Ready</div>`;
            grid.appendChild(card);

            // Create renderer for this racer
            const canvas = card.querySelector(`#racer-canvas-${i}`);
            const renderer = this._createRenderer(canvas);
            const arr = [...this.originalArray];
            renderer.setArray(arr);

            const engine = new AlgoEngine();
            engine.baseDelay = 150;

            this.engines.push(engine);
            this.racers.push({ algo, renderer, comparisons: 0, swaps: 0, canvas, index: i });
        });

        // Apply current speed
        const speedValues = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 16];
        const speedIdx = parseInt(document.getElementById('cmp-speed').value) - 1;
        const sp = speedValues[speedIdx] || 1;
        this.engines.forEach(e => e.setSpeed(sp));
    },

    _createRenderer(canvas) {
        // Lightweight inline renderer (same logic as SortingRenderer)
        const r = {
            canvas, ctx: canvas.getContext('2d'), array: [], states: {}, maxValue: 100,
            init() { this._resize(); },
            _resize() {
                if (!this.canvas) return;
                const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1;
                this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr;
                this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px';
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw();
            },
            setArray(arr) { this.array = [...arr]; this.maxValue = Math.max(...arr, 1); this.states = {}; this.draw(); },
            applyStep(step) {
                const ns = {};
                for (const [k, v] of Object.entries(this.states)) if (v === 'sorted') ns[k] = v;
                this.states = ns;
                if (step.array) this.array = [...step.array];
                switch (step.type) {
                    case 'compare': step.indices.forEach(i => { this.states[i] = 'compare'; }); break;
                    case 'swap': step.indices.forEach(i => { this.states[i] = 'swap'; }); break;
                    case 'overwrite': step.indices.forEach(i => { this.states[i] = 'overwrite'; }); break;
                    case 'sorted': step.indices.forEach(i => { this.states[i] = 'sorted'; }); break;
                    case 'partition': step.indices.forEach(i => { this.states[i] = 'partition'; }); break;
                    case 'bucket': step.indices.forEach(i => { this.states[i] = 'bucket'; }); break;
                    case 'merge-split': for (let i = step.indices[0]; i <= step.indices[2]; i++) if (!this.states[i]) this.states[i] = 'compare'; break;
                }
                this.draw();
            },
            reset(arr) { this.states = {}; if (arr) { this.array = [...arr]; this.maxValue = Math.max(...arr, 1); } this.draw(); },
            _getColor(state) {
                switch (state) {
                    case 'compare': return '#845EC2'; case 'swap': return '#FF6B6B';
                    case 'overwrite': return '#FFA552'; case 'sorted': return '#4ECDC4';
                    case 'partition': return '#FFE66D'; case 'bucket': return '#FF8B94';
                    default: return '#1A1A1A';
                }
            },
            draw() {
                if (!this.ctx) return;
                const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
                const n = this.array.length; if (n === 0) { ctx.clearRect(0, 0, w, h); return; }
                const pad = 8, bW = Math.max(1, (w - pad * 2) / n - 0.5);
                const gap = Math.max(0.5, (w - pad * 2 - n * bW) / (n - 1 || 1));
                ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < n; i++) {
                    const x = pad + i * (bW + gap), bH = (this.array[i] / this.maxValue) * (h - pad * 2), y = h - pad - bH;
                    ctx.fillStyle = this._getColor(this.states[i]);
                    ctx.fillRect(x, y, bW, bH);
                }
            }
        };
        r.init();
        return r;
    },

    _startRace() {
        this.isRacing = true;
        this.finishedCount = 0;
        this.results = [];
        this.startTime = performance.now();
        document.getElementById('results-card').classList.add('hidden');
        document.getElementById('cmp-race').disabled = true;

        this.racers.forEach((racer, i) => {
            racer.comparisons = 0; racer.swaps = 0;
            racer.renderer.reset([...this.originalArray]);

            const steps = SortingAlgorithms.run(racer.algo, [...this.originalArray]);
            const engine = this.engines[i];
            engine.loadSteps(steps);

            document.getElementById(`racer-status-${i}`).textContent = 'Racing…';
            document.getElementById(`racer-status-${i}`).style.color = '#845EC2';

            engine.onStep = (step) => {
                if (step.type === 'compare') racer.comparisons++;
                if (step.type === 'swap') racer.swaps++;
                racer.renderer.applyStep(step);
                const cmpEl = document.querySelector(`.racer-cmp-${i}`);
                const swpEl = document.querySelector(`.racer-swp-${i}`);
                const stpEl = document.querySelector(`.racer-stp-${i}`);
                if (cmpEl) cmpEl.textContent = racer.comparisons;
                if (swpEl) swpEl.textContent = racer.swaps;
                if (stpEl) stpEl.textContent = engine.currentStep + 1;
            };

            engine.onComplete = () => {
                const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(2);
                this.finishedCount++;
                this.results.push({
                    algo: racer.algo,
                    name: SortingAlgorithms.info[racer.algo].name,
                    comparisons: racer.comparisons,
                    swaps: racer.swaps,
                    steps: engine.steps.length,
                    time: elapsed,
                    place: this.finishedCount
                });

                const statusEl = document.getElementById(`racer-status-${i}`);
                if (this.finishedCount === 1) {
                    statusEl.textContent = `🏆 #${this.finishedCount} — ${elapsed}s`;
                    statusEl.style.color = '#4ECDC4';
                } else {
                    statusEl.textContent = `#${this.finishedCount} — ${elapsed}s`;
                    statusEl.style.color = '#90A4AE';
                }

                if (this.finishedCount === this.racers.length) {
                    this.isRacing = false;
                    document.getElementById('cmp-race').disabled = false;
                    this._showResults();
                }
            };

            engine.onReset = () => { racer.renderer.reset([...this.originalArray]); };
            engine.play();
        });
    },

    _showResults() {
        const card = document.getElementById('results-card');
        this.results.sort((a, b) => a.place - b.place);

        let rows = this.results.map(r => `
      <tr class="${r.place === 1 ? 'winner-row' : ''}">
        <td>${r.place === 1 ? '🏆' : '#' + r.place}</td>
        <td>${r.name}</td>
        <td>${r.comparisons}</td>
        <td>${r.swaps}</td>
        <td>${r.steps}</td>
        <td>${r.time}s</td>
      </tr>`).join('');

        card.innerHTML = `
      <h3 class="results-title">Race Results</h3>
      <table class="results-table">
        <thead><tr><th>Place</th><th>Algorithm</th><th>Comparisons</th><th>Swaps</th><th>Steps</th><th>Time</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
        card.classList.remove('hidden');
    },

    _stopAll() {
        this.isRacing = false;
        this.engines.forEach(e => e.stop());
        const raceBtn = document.getElementById('cmp-race');
        if (raceBtn) raceBtn.disabled = false;
    },

    unmount() {
        this._stopAll();
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    }
};
window.ComparisonView = ComparisonView;
