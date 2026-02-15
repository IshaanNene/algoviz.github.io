/* ============================================
   PATHFINDING VIEW
   Neobrutalist toolbar design (matches sorting/DS)
   ============================================ */
const GraphView = {
  engine: null, grid: null, currentAlgo: 'dijkstra', resizeHandler: null,
  isAnimating: false,

  mount(container) {
    this.engine = new AlgoEngine();
    this.engine.baseDelay = 8;
    this.isAnimating = false;

    const algoOpts = Object.keys(PathAlgorithms.info).map(k =>
      `<option value="${k}" ${k === this.currentAlgo ? 'selected' : ''}>${PathAlgorithms.info[k].name}</option>`
    ).join('');

    const mazeOpts = Object.keys(PathAlgorithms.mazes).map(k =>
      `<option value="${k}">${PathAlgorithms.mazes[k]}</option>`
    ).join('');

    const info = PathAlgorithms.info[this.currentAlgo];

    container.innerHTML = `
      <div class="graph-view">
        <div class="page-header">
          <h2 class="page-title">Pathfinding <span class="title-accent">Visualizer</span></h2>
          <div class="toolbar-group">
            <select id="graph-algo-select" class="brutal-select">${algoOpts}</select>
            <select id="maze-select" class="brutal-select">
              <option value="" disabled selected>Mazes & Patterns</option>
              ${mazeOpts}
            </select>
          </div>
        </div>
        <div class="toolbar">
          <button id="graph-visualize" class="brutal-btn primary">Visualize!</button>
          <div class="toolbar-separator"></div>
          <button id="graph-clear-board" class="brutal-btn danger small">Clear Board</button>
          <button id="graph-clear-walls" class="brutal-btn small">Clear Walls</button>
          <button id="graph-clear-path" class="brutal-btn small">Clear Path</button>
          <div class="toolbar-separator"></div>
          <button id="graph-bomb-toggle" class="brutal-btn small">💣 Add Bomb</button>
          <div class="toolbar-separator"></div>
          <span class="brutal-label" style="margin:0">Speed</span>
          <select id="graph-speed" class="brutal-select" style="font-size:0.65rem">
            <option value="slow">Slow</option>
            <option value="medium">Medium</option>
            <option value="fast" selected>Fast</option>
            <option value="instant">Instant</option>
          </select>
        </div>
        <div class="algo-desc" id="graph-algo-desc">
          <span><em>${info.name}</em> — ${info.desc}</span>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#4ECDC4"></div><span>Start Node</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FF6B6B"></div><span>Target Node</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFFFFF"></div><span>Unvisited</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#A8E6CF"></div><span>Visited</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#845EC2;color:#fff"></div><span>Frontier</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFE66D"></div><span>Shortest Path</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#1A1A1A"></div><span>Wall</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FF8B94"></div><span>Bomb Node</span></div>
        </div>
        <div class="canvas-container"><canvas id="graph-canvas"></canvas></div>
      </div>`;

    this.grid = new PathGrid(20, 50);
    const canvas = document.getElementById('graph-canvas');
    GridRenderer.init(canvas, this.grid);
    GridEditor.init(canvas, this.grid, GridRenderer, () => GridRenderer.draw());
    this._bindEvents();
  },

  _bindEvents() {
    const self = this;

    document.getElementById('graph-algo-select').addEventListener('change', function () {
      self.currentAlgo = this.value;
      const info = PathAlgorithms.info[self.currentAlgo];
      const desc = document.getElementById('graph-algo-desc');
      desc.querySelector('span').innerHTML = `<em>${info.name}</em> — ${info.desc}`;
    });

    // Maze generation
    document.getElementById('maze-select').addEventListener('change', function () {
      if (self.isAnimating) return;
      const mazeName = this.value;
      if (!mazeName) return;

      self.grid.clearBoard();
      GridRenderer.draw();

      const steps = PathAlgorithms.generateMaze(mazeName, self.grid);
      if (steps.length === 0) { this.selectedIndex = 0; return; }

      self.isAnimating = true;
      self._disableControls(true);

      self.engine.baseDelay = 4;
      self.engine.loadSteps(steps);
      self.engine.onStep = (step) => { GridRenderer.applyStep(step); };
      self.engine.onComplete = () => {
        self.isAnimating = false;
        self._disableControls(false);
        self._setSpeedFromSelect();
        self._setupAlgoCallbacks();
      };
      self.engine.onReset = () => { };
      self.engine.play();

      this.selectedIndex = 0;
    });

    // Visualize button
    document.getElementById('graph-visualize').addEventListener('click', () => {
      if (this.isAnimating) return;
      this.grid.clearPath();
      GridRenderer.draw();

      const result = PathAlgorithms.run(this.currentAlgo, this.grid);
      const allSteps = [...result.visited, ...result.path];
      if (allSteps.length === 0) return;

      this.isAnimating = true;
      this._disableControls(true);
      this._setSpeedFromSelect();
      this.engine.loadSteps(allSteps);
      this._setupAlgoCallbacks();
      this.engine.play();
    });

    // Speed
    document.getElementById('graph-speed').addEventListener('change', function () {
      self._setSpeedFromSelect();
    });

    // Clear buttons
    document.getElementById('graph-clear-board').addEventListener('click', () => {
      if (this.isAnimating) { this.engine.stop(); this.isAnimating = false; this._disableControls(false); }
      this.grid.clearBoard(); GridRenderer.draw();
    });
    document.getElementById('graph-clear-walls').addEventListener('click', () => {
      if (this.isAnimating) return;
      this.grid.clearWalls(); GridRenderer.draw();
    });
    document.getElementById('graph-clear-path').addEventListener('click', () => {
      if (this.isAnimating) { this.engine.stop(); this.isAnimating = false; this._disableControls(false); }
      this.grid.clearPath(); GridRenderer.draw();
    });

    // Bomb toggle
    document.getElementById('graph-bomb-toggle').addEventListener('click', () => {
      if (this.isAnimating) return;
      if (this.grid.bombRow !== null) {
        this.grid.removeBomb();
        document.getElementById('graph-bomb-toggle').textContent = '💣 Add Bomb';
      } else {
        this.grid.addBomb();
        document.getElementById('graph-bomb-toggle').textContent = '💣 Remove Bomb';
      }
      GridRenderer.draw();
    });

    this._setupAlgoCallbacks();
    this.resizeHandler = () => GridRenderer._resize();
    window.addEventListener('resize', this.resizeHandler);
  },

  _setupAlgoCallbacks() {
    const self = this;
    this.engine.onStep = (step) => { GridRenderer.applyStep(step); };
    this.engine.onComplete = () => { self.isAnimating = false; self._disableControls(false); };
    this.engine.onReset = () => { self.grid.clearPath(); GridRenderer.draw(); };
  },

  _setSpeedFromSelect() {
    const val = document.getElementById('graph-speed').value;
    switch (val) {
      case 'slow': this.engine.baseDelay = 50; break;
      case 'medium': this.engine.baseDelay = 18; break;
      case 'fast': this.engine.baseDelay = 5; break;
      case 'instant': this.engine.baseDelay = 0; break;
    }
  },

  _disableControls(disabled) {
    ['graph-visualize', 'graph-clear-walls', 'maze-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  },

  unmount() {
    if (this.engine) this.engine.stop();
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    GridEditor.destroy(); GridRenderer.destroy();
    this.isAnimating = false;
  }
};
window.GraphView = GraphView;
