/* ============================================
   DATA STRUCTURES VIEW
   ============================================ */
const DSView = {
    engine: null, currentDS: 'linked-list', resizeHandler: null,

    mount(container) {
        this.engine = new AlgoEngine(); this.engine.baseDelay = 300;

        container.innerHTML = `
      <div class="ds-view">
        <div class="page-header">
          <h2 class="page-title">Data <span class="title-accent">Structures</span></h2>
        </div>
        <div class="tab-bar">
          <button class="tab-item active" data-ds="linked-list">Linked List</button>
          <button class="tab-item" data-ds="stack">Stack</button>
          <button class="tab-item" data-ds="queue">Queue</button>
          <button class="tab-item" data-ds="binary-tree">Binary Tree</button>
          <button class="tab-item" data-ds="heap">Heap</button>
        </div>
        <div class="operation-panel" id="ds-operations"></div>
        <div class="controls-bar">
          <div class="playback-controls">
            <button id="ds-step-back" class="brutal-btn icon-btn small">⏮</button>
            <button id="ds-play" class="brutal-btn icon-btn primary">▶</button>
            <button id="ds-pause" class="brutal-btn icon-btn accent hidden">⏸</button>
            <button id="ds-stop" class="brutal-btn icon-btn danger">⏹</button>
            <button id="ds-step-fwd" class="brutal-btn icon-btn small">⏭</button>
          </div>
          <div class="timeline">
            <label class="brutal-label" style="margin:0">Step</label>
            <input type="range" id="ds-timeline" class="brutal-range timeline-slider" min="0" max="0" value="0">
            <span id="ds-step-info" class="stat-badge"><span class="stat-value">0/0</span></span>
          </div>
          <div class="speed-control">
            <label class="brutal-label" style="margin:0">Speed</label>
            <input type="range" id="ds-speed" class="brutal-range" min="1" max="8" value="3" style="width:80px">
            <span id="ds-speed-val" class="stat-badge"><span class="stat-value">1×</span></span>
          </div>
        </div>
        <div class="canvas-container"><canvas id="ds-canvas"></canvas></div>
      </div>`;

        this._renderOperations();
        this._initCurrentDS();
        this._bindEvents();
    },

    _renderOperations() {
        const panel = document.getElementById('ds-operations');
        switch (this.currentDS) {
            case 'linked-list':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <div class="op-input-group"><input type="number" id="ds-index" class="brutal-input" placeholder="Index" value="0" min="0" style="width:70px"></div>
          <button class="brutal-btn primary small" data-op="insert-head">Insert Head</button>
          <button class="brutal-btn primary small" data-op="insert-tail">Insert Tail</button>
          <button class="brutal-btn accent small" data-op="insert-at">Insert At</button>
          <button class="brutal-btn danger small" data-op="delete-head">Del Head</button>
          <button class="brutal-btn danger small" data-op="delete-tail">Del Tail</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="reverse">Reverse</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'stack':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="push">Push</button>
          <button class="brutal-btn danger small" data-op="pop">Pop</button>
          <button class="brutal-btn accent small" data-op="peek">Peek</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'queue':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="enqueue">Enqueue</button>
          <button class="brutal-btn danger small" data-op="dequeue">Dequeue</button>
          <button class="brutal-btn accent small" data-op="peek">Peek</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'binary-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="delete">Delete</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn accent small" data-op="inorder">Inorder</button>
          <button class="brutal-btn accent small" data-op="preorder">Preorder</button>
          <button class="brutal-btn accent small" data-op="postorder">Postorder</button>
          <button class="brutal-btn accent small" data-op="levelorder">Level-Order</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn green small" data-op="sample">Sample BST</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'heap':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="extract">Extract</button>
          <div class="toolbar-separator"></div>
          <select id="heap-type" class="brutal-select"><option value="min" selected>Min Heap</option><option value="max">Max Heap</option></select>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
        }
    },

    _initCurrentDS() {
        const canvas = document.getElementById('ds-canvas');
        switch (this.currentDS) {
            case 'linked-list': LinkedListViz.init(canvas); break;
            case 'stack': StackQueueViz.init(canvas, 'stack'); break;
            case 'queue': StackQueueViz.init(canvas, 'queue'); break;
            case 'binary-tree': BinaryTreeViz.init(canvas); break;
            case 'heap': HeapViz.init(canvas); break;
        }
    },

    _getViz() {
        switch (this.currentDS) {
            case 'linked-list': return LinkedListViz;
            case 'stack': case 'queue': return StackQueueViz;
            case 'binary-tree': return BinaryTreeViz;
            case 'heap': return HeapViz;
        }
    },

    _executeOp(op) {
        const vi = document.getElementById('ds-value');
        const value = vi ? parseInt(vi.value) || 0 : 0;
        const ii = document.getElementById('ds-index');
        const index = ii ? parseInt(ii.value) || 0 : 0;
        let steps = [];
        this.engine.stop(); this._updatePlayPause(false);
        const viz = this._getViz(); if (viz && viz.reset) viz.reset(); if (viz && viz.resetHighlights) viz.resetHighlights();

        switch (this.currentDS) {
            case 'linked-list':
                switch (op) {
                    case 'insert-head': steps = LinkedListViz.insertHead(value); break;
                    case 'insert-tail': steps = LinkedListViz.insertTail(value); break;
                    case 'insert-at': steps = LinkedListViz.insertAt(index, value); break;
                    case 'delete-head': steps = LinkedListViz.deleteHead(); break;
                    case 'delete-tail': steps = LinkedListViz.deleteTail(); break;
                    case 'search': steps = LinkedListViz.search(value); break;
                    case 'reverse': steps = LinkedListViz.reverse(); break;
                    case 'clear': LinkedListViz.clear(); return;
                } break;
            case 'stack':
                switch (op) {
                    case 'push': steps = StackQueueViz.push(value); break;
                    case 'pop': steps = StackQueueViz.pop(); break;
                    case 'peek': steps = StackQueueViz.peek(); break;
                    case 'clear': StackQueueViz.items = []; StackQueueViz.draw(); return;
                } break;
            case 'queue':
                switch (op) {
                    case 'enqueue': steps = StackQueueViz.enqueue(value); break;
                    case 'dequeue': steps = StackQueueViz.dequeue(); break;
                    case 'peek': steps = StackQueueViz.peek(); break;
                    case 'clear': StackQueueViz.items = []; StackQueueViz.draw(); return;
                } break;
            case 'binary-tree':
                switch (op) {
                    case 'insert': steps = BinaryTreeViz.insert(value); break;
                    case 'delete': steps = BinaryTreeViz.delete(value); break;
                    case 'search': steps = BinaryTreeViz.search(value); break;
                    case 'inorder': steps = BinaryTreeViz.inorder(); break;
                    case 'preorder': steps = BinaryTreeViz.preorder(); break;
                    case 'postorder': steps = BinaryTreeViz.postorder(); break;
                    case 'levelorder': steps = BinaryTreeViz.levelorder(); break;
                    case 'sample': BinaryTreeViz.buildSample(); return;
                    case 'clear': BinaryTreeViz.clear(); return;
                } break;
            case 'heap':
                switch (op) {
                    case 'insert': steps = HeapViz.insert(value); break;
                    case 'extract': steps = HeapViz.extract(); break;
                    case 'sample': HeapViz.buildSample(); return;
                    case 'clear': HeapViz.heapArray = []; HeapViz.draw(); return;
                } break;
        }
        if (steps.length > 0) {
            this.engine.loadSteps(steps); document.getElementById('ds-timeline').max = steps.length - 1; document.getElementById('ds-timeline').value = 0;
            this.engine.play(); this._updatePlayPause(true);
        }
    },

    _bindEvents() {
        const self = this;

        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                self.currentDS = this.dataset.ds; self.engine.stop(); self._updatePlayPause(false);
                self._renderOperations(); self._initCurrentDS(); self._bindOpButtons(); self._bindHeapType();
                document.getElementById('ds-timeline').value = 0; document.getElementById('ds-timeline').max = 0;
                self._updateStepInfo(0, 0);
            });
        });

        this._bindOpButtons(); this._bindHeapType();

        const speedValues = [0.25, 0.5, 1, 1.5, 2, 3, 4, 8];
        document.getElementById('ds-speed').addEventListener('input', function () {
            const sp = speedValues[parseInt(this.value) - 1] || 1; self.engine.setSpeed(sp);
            document.getElementById('ds-speed-val').querySelector('.stat-value').textContent = sp + '×';
        });

        document.getElementById('ds-play').addEventListener('click', () => { if (this.engine.steps.length > 0) { this.engine.play(); this._updatePlayPause(true); } });
        document.getElementById('ds-pause').addEventListener('click', () => { this.engine.pause(); this._updatePlayPause(false); });
        document.getElementById('ds-stop').addEventListener('click', () => { this.engine.stop(); this._updatePlayPause(false); document.getElementById('ds-timeline').value = 0; this._updateStepInfo(0, 0); });
        document.getElementById('ds-step-fwd').addEventListener('click', () => { this.engine.stepForward(); });
        document.getElementById('ds-step-back').addEventListener('click', () => { this.engine.stepBackward(); });

        document.getElementById('ds-timeline').addEventListener('input', function () { self.engine.pause(); self._updatePlayPause(false); self.engine.jumpToStep(parseInt(this.value)); });

        this.engine.onStep = (step, index) => { const viz = this._getViz(); if (viz && viz.applyStep) viz.applyStep(step); document.getElementById('ds-timeline').value = index; this._updateStepInfo(index + 1, this.engine.steps.length); };
        this.engine.onComplete = () => { this._updatePlayPause(false); };
        this.engine.onReset = () => { const viz = this._getViz(); if (viz && viz.reset) viz.reset(); if (viz && viz.resetHighlights) viz.resetHighlights(); };
        this.resizeHandler = () => { const viz = this._getViz(); if (viz && viz._resize) viz._resize(); };
        window.addEventListener('resize', this.resizeHandler);
    },

    _bindOpButtons() { document.querySelectorAll('[data-op]').forEach(btn => { btn.addEventListener('click', () => this._executeOp(btn.dataset.op)); }); },
    _bindHeapType() { const ht = document.getElementById('heap-type'); if (ht) ht.addEventListener('change', function () { HeapViz.setType(this.value === 'min'); }); },
    _updatePlayPause(p) { document.getElementById('ds-play').classList.toggle('hidden', p); document.getElementById('ds-pause').classList.toggle('hidden', !p); },
    _updateStepInfo(c, t) { const el = document.getElementById('ds-step-info'); if (el) el.querySelector('.stat-value').textContent = `${c}/${t}`; },

    unmount() { if (this.engine) this.engine.stop(); if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler); const viz = this._getViz(); if (viz && viz.destroy) viz.destroy(); }
};
window.DSView = DSView;
