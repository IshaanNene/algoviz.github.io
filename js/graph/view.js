/* ============================================
   GRAPH VIEW
   Full page: toolbar, editor controls, canvas
   ============================================ */

const GraphView = {
    engine: null,
    graph: null,
    currentAlgo: 'bfs',
    sourceNode: 0,
    targetNode: null,
    resizeHandler: null,

    mount(container) {
        this.engine = new AlgoEngine();
        this.engine.baseDelay = 400;
        this.graph = Graph.createSample();

        const algoOptions = Object.keys(GraphAlgorithms.info).map(k =>
            `<option value="${k}" ${k === this.currentAlgo ? 'selected' : ''}>${GraphAlgorithms.info[k].name}</option>`
        ).join('');

        const info = GraphAlgorithms.info[this.currentAlgo];
        const needsTarget = ['dijkstra', 'bellman-ford', 'astar'].includes(this.currentAlgo);

        container.innerHTML = `
      <div class="graph-view">
        <!-- Header -->
        <div class="page-header">
          <h2 class="page-title">Graph <span class="title-accent">Algorithms</span></h2>
          <div class="toolbar-group">
            <select id="graph-algo-select" class="brutal-select">${algoOptions}</select>
          </div>
        </div>

        <!-- Algorithm Info -->
        <div class="algo-desc" id="graph-algo-desc">
          <span>${info.desc}</span>
          <span class="complexity-badge">${info.time}</span>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Edit Mode</label>
            <button id="graph-mode-node" class="brutal-btn small primary">+ Node</button>
            <button id="graph-mode-edge" class="brutal-btn small accent">+ Edge</button>
            <button id="graph-mode-move" class="brutal-btn small">✥ Move</button>
            <button id="graph-mode-delete" class="brutal-btn small danger">✕ Delete</button>
          </div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <label class="brutal-label" style="margin:0">Source</label>
            <input type="number" id="graph-source" class="brutal-input" style="width:60px;padding:4px 8px" value="0" min="0">
          </div>
          <div class="toolbar-group ${needsTarget ? '' : 'hidden'}" id="graph-target-group">
            <label class="brutal-label" style="margin:0">Target</label>
            <input type="number" id="graph-target" class="brutal-input" style="width:60px;padding:4px 8px" value="7" min="0">
          </div>
          <div class="toolbar-separator"></div>
          <button id="graph-sample" class="brutal-btn small purple">Sample Graph</button>
          <button id="graph-clear" class="brutal-btn small danger">Clear</button>
        </div>

        <!-- Playback Controls -->
        <div class="controls-bar">
          <div class="playback-controls">
            <button id="graph-step-back" class="brutal-btn icon-btn small">⏮</button>
            <button id="graph-play" class="brutal-btn icon-btn primary">▶</button>
            <button id="graph-pause" class="brutal-btn icon-btn accent hidden">⏸</button>
            <button id="graph-stop" class="brutal-btn icon-btn danger">⏹</button>
            <button id="graph-step-fwd" class="brutal-btn icon-btn small">⏭</button>
          </div>
          <div class="timeline">
            <label class="brutal-label" style="margin:0">Step</label>
            <input type="range" id="graph-timeline" class="brutal-range timeline-slider" min="0" max="0" value="0">
            <span id="graph-step-info" class="stat-badge"><span class="stat-value">0/0</span></span>
          </div>
          <div class="speed-control">
            <label class="brutal-label" style="margin:0">Speed</label>
            <input type="range" id="graph-speed" class="brutal-range" min="1" max="10" value="3" style="width:80px">
            <span id="graph-speed-val" class="stat-badge"><span class="stat-value">1×</span></span>
          </div>
          <div class="stats">
            <span class="stat-badge" id="graph-nodes">Nodes: <span class="stat-value">${this.graph.getNodeCount()}</span></span>
            <span class="stat-badge" id="graph-edges">Edges: <span class="stat-value">${this.graph.getEdgeCount()}</span></span>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#fff;border-color:#1A1A1A"></div><span>Unvisited</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FFE66D"></div><span>Visiting</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#4ECDC4"></div><span>Visited</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FF6B6B"></div><span>Path</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#A8E6CF"></div><span>Source</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#FF8B94"></div><span>Target</span></div>
          <div class="legend-item"><div class="legend-color" style="background:#845EC2"></div><span>Relaxed</span></div>
        </div>

        <!-- Canvas -->
        <div class="canvas-container">
          <canvas id="graph-canvas"></canvas>
        </div>
      </div>
    `;

        // Init renderer and editor
        const canvas = document.getElementById('graph-canvas');
        GraphRenderer.init(canvas, this.graph);
        GraphEditor.init(canvas, this.graph);
        GraphEditor.setMode('node');

        GraphEditor.onGraphChange = () => {
            this._updateGraphStats();
            GraphRenderer.draw();
        };

        GraphRenderer.draw();

        this._bindEvents();
    },

    _bindEvents() {
        const self = this;

        // Algorithm select
        document.getElementById('graph-algo-select').addEventListener('change', function () {
            self.currentAlgo = this.value;
            const info = GraphAlgorithms.info[self.currentAlgo];
            document.getElementById('graph-algo-desc').querySelector('span').textContent = info.desc;
            document.getElementById('graph-algo-desc').querySelector('.complexity-badge').textContent = info.time;
            const needsTarget = ['dijkstra', 'bellman-ford', 'astar'].includes(self.currentAlgo);
            document.getElementById('graph-target-group').classList.toggle('hidden', !needsTarget);
            self.engine.stop();
            self._updatePlayPause(false);
            GraphRenderer.resetStates();
        });

        // Edit mode buttons
        const modes = ['node', 'edge', 'move', 'delete'];
        modes.forEach(mode => {
            document.getElementById(`graph-mode-${mode}`).addEventListener('click', function () {
                modes.forEach(m => document.getElementById(`graph-mode-${m}`).classList.remove('primary'));
                this.classList.add('primary');
                GraphEditor.setMode(mode);
            });
        });

        // Source/target inputs
        document.getElementById('graph-source').addEventListener('change', function () {
            self.sourceNode = parseInt(this.value) || 0;
        });
        document.getElementById('graph-target').addEventListener('change', function () {
            self.targetNode = parseInt(this.value);
        });

        // Sample / Clear
        document.getElementById('graph-sample').addEventListener('click', () => {
            this.graph = Graph.createSample();
            GraphEditor.graph = this.graph;
            GraphRenderer.graph = this.graph;
            GraphRenderer.resetStates();
            this.engine.stop();
            this._updatePlayPause(false);
            this._updateGraphStats();
            GraphRenderer.draw();
        });

        document.getElementById('graph-clear').addEventListener('click', () => {
            this.graph.clear();
            GraphRenderer.resetStates();
            this.engine.stop();
            this._updatePlayPause(false);
            this._updateGraphStats();
            GraphRenderer.draw();
        });

        // Speed
        const speedValues = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 8, 16];
        document.getElementById('graph-speed').addEventListener('input', function () {
            const speed = speedValues[parseInt(this.value) - 1] || 1;
            self.engine.setSpeed(speed);
            document.getElementById('graph-speed-val').querySelector('.stat-value').textContent = speed + '×';
        });

        // Playback
        document.getElementById('graph-play').addEventListener('click', () => {
            this.sourceNode = parseInt(document.getElementById('graph-source').value) || 0;
            const needsTarget = ['dijkstra', 'bellman-ford', 'astar'].includes(this.currentAlgo);
            this.targetNode = needsTarget ? (parseInt(document.getElementById('graph-target').value) || 0) : undefined;

            GraphRenderer.resetStates();
            const steps = GraphAlgorithms.run(this.currentAlgo, this.graph, this.sourceNode, this.targetNode);
            this.engine.loadSteps(steps);
            document.getElementById('graph-timeline').max = steps.length - 1;
            this.engine.play();
            this._updatePlayPause(true);
        });

        document.getElementById('graph-pause').addEventListener('click', () => {
            this.engine.pause();
            this._updatePlayPause(false);
        });

        document.getElementById('graph-stop').addEventListener('click', () => {
            this.engine.stop();
            this._updatePlayPause(false);
            GraphRenderer.resetStates();
            document.getElementById('graph-timeline').value = 0;
            this._updateStepInfo(0, 0);
        });

        document.getElementById('graph-step-fwd').addEventListener('click', () => {
            if (this.engine.steps.length === 0) {
                this.sourceNode = parseInt(document.getElementById('graph-source').value) || 0;
                const needsTarget = ['dijkstra', 'bellman-ford', 'astar'].includes(this.currentAlgo);
                this.targetNode = needsTarget ? (parseInt(document.getElementById('graph-target').value) || 0) : undefined;
                GraphRenderer.resetStates();
                const steps = GraphAlgorithms.run(this.currentAlgo, this.graph, this.sourceNode, this.targetNode);
                this.engine.loadSteps(steps);
                document.getElementById('graph-timeline').max = steps.length - 1;
            }
            this.engine.stepForward();
        });

        document.getElementById('graph-step-back').addEventListener('click', () => {
            this.engine.stepBackward();
        });

        // Timeline
        document.getElementById('graph-timeline').addEventListener('input', function () {
            self.engine.pause();
            self._updatePlayPause(false);
            self.engine.jumpToStep(parseInt(this.value));
        });

        // Engine callbacks
        this.engine.onStep = (step, index) => {
            GraphRenderer.applyStep(step);
            document.getElementById('graph-timeline').value = index;
            this._updateStepInfo(index + 1, this.engine.steps.length);
        };

        this.engine.onComplete = () => {
            this._updatePlayPause(false);
        };

        this.engine.onReset = () => {
            GraphRenderer.resetStates();
        };

        this.resizeHandler = () => GraphRenderer._resize();
        window.addEventListener('resize', this.resizeHandler);
    },

    _updatePlayPause(playing) {
        const playBtn = document.getElementById('graph-play');
        const pauseBtn = document.getElementById('graph-pause');
        if (playing) {
            playBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
        } else {
            playBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
    },

    _updateStepInfo(current, total) {
        const el = document.getElementById('graph-step-info');
        if (el) el.querySelector('.stat-value').textContent = `${current}/${total}`;
    },

    _updateGraphStats() {
        const n = document.getElementById('graph-nodes');
        const e = document.getElementById('graph-edges');
        if (n) n.querySelector('.stat-value').textContent = this.graph.getNodeCount();
        if (e) e.querySelector('.stat-value').textContent = this.graph.getEdgeCount();
    },

    unmount() {
        if (this.engine) this.engine.stop();
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
        GraphRenderer.destroy();
        GraphEditor.destroy();
    }
};

window.GraphView = GraphView;
