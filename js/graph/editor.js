/* ============================================
   GRAPH EDITOR
   Interactive Canvas-based graph editor
   ============================================ */

const GraphEditor = {
    canvas: null,
    graph: null,
    mode: 'node',             // 'node' | 'edge' | 'move' | 'delete'
    draggingNode: null,
    edgeStartNode: null,
    onGraphChange: null,
    mousePos: { x: 0, y: 0 },

    init(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;
        this._bindEvents();
    },

    setMode(mode) {
        this.mode = mode;
        this.edgeStartNode = null;
        const container = this.canvas.parentElement;
        container.classList.remove('dragging', 'edge-mode');
        if (mode === 'move') container.classList.add('dragging');
        if (mode === 'edge') container.classList.add('edge-mode');
    },

    _getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    _bindEvents() {
        const self = this;

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = self._getCanvasCoords(e);
            const nodeId = self.graph.getNodeAt(pos.x, pos.y);

            switch (self.mode) {
                case 'node':
                    if (nodeId === null) {
                        self.graph.addNode(pos.x, pos.y);
                        if (self.onGraphChange) self.onGraphChange();
                    }
                    break;
                case 'edge':
                    if (nodeId !== null) {
                        if (self.edgeStartNode === null) {
                            self.edgeStartNode = nodeId;
                        } else {
                            self._promptWeight(self.edgeStartNode, nodeId);
                            self.edgeStartNode = null;
                        }
                    }
                    break;
                case 'move':
                    if (nodeId !== null) {
                        self.draggingNode = nodeId;
                    }
                    break;
                case 'delete':
                    if (nodeId !== null) {
                        self.graph.removeNode(nodeId);
                        if (self.onGraphChange) self.onGraphChange();
                    } else {
                        const edge = self.graph.getEdgeAt(pos.x, pos.y);
                        if (edge) {
                            self.graph.removeEdge(edge.from, edge.to);
                            if (self.onGraphChange) self.onGraphChange();
                        }
                    }
                    break;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            self.mousePos = self._getCanvasCoords(e);
            if (self.draggingNode !== null) {
                const node = self.graph.nodes.get(self.draggingNode);
                if (node) {
                    node.x = self.mousePos.x;
                    node.y = self.mousePos.y;
                    if (self.onGraphChange) self.onGraphChange();
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            self.draggingNode = null;
        });

        this.canvas.addEventListener('mouseleave', () => {
            self.draggingNode = null;
        });
    },

    _promptWeight(from, to) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'weight-modal';
        modal.innerHTML = `
      <div class="modal-content">
        <h3>Edge Weight</h3>
        <input type="number" class="brutal-input" id="weight-input" value="1" min="1" max="99" autofocus>
        <div class="modal-actions">
          <button class="brutal-btn primary" id="weight-ok">Add Edge</button>
          <button class="brutal-btn danger" id="weight-cancel">Cancel</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);

        const input = document.getElementById('weight-input');
        input.focus();
        input.select();

        const cleanup = () => modal.remove();

        document.getElementById('weight-ok').addEventListener('click', () => {
            const weight = parseInt(input.value) || 1;
            this.graph.addEdge(from, to, weight);
            if (this.onGraphChange) this.onGraphChange();
            cleanup();
        });

        document.getElementById('weight-cancel').addEventListener('click', cleanup);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const weight = parseInt(input.value) || 1;
                this.graph.addEdge(from, to, weight);
                if (this.onGraphChange) this.onGraphChange();
                cleanup();
            }
            if (e.key === 'Escape') cleanup();
        });
    },

    destroy() {
        this.canvas = null;
        this.graph = null;
    }
};

window.GraphEditor = GraphEditor;
