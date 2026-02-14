/* ============================================
   GRAPH RENDERER
   Canvas renderer for graph visualization
   ============================================ */

const GraphRenderer = {
    canvas: null,
    ctx: null,
    graph: null,
    nodeStates: {},   // nodeId -> 'unvisited'|'visiting'|'visited'|'path'|'source'|'target'
    edgeStates: {},   // 'from-to' -> 'default'|'relaxed'|'mst'|'path'
    distances: {},    // nodeId -> distance label
    edgeStartNode: null, // For drawing edge-in-progress line

    init(canvas, graph) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.graph = graph;
        this.nodeStates = {};
        this.edgeStates = {};
        this.distances = {};
        this._resize();
        this._resizeHandler = () => this._resize();
        window.addEventListener('resize', this._resizeHandler);
    },

    _resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = parent.clientWidth * dpr;
        this.canvas.height = parent.clientHeight * dpr;
        this.canvas.style.width = parent.clientWidth + 'px';
        this.canvas.style.height = parent.clientHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw();
    },

    resetStates() {
        this.nodeStates = {};
        this.edgeStates = {};
        this.distances = {};
        this.draw();
    },

    applyStep(step) {
        switch (step.type) {
            case 'visit':
                this.nodeStates[step.node] = 'visiting';
                break;
            case 'visited':
                this.nodeStates[step.node] = 'visited';
                break;
            case 'enqueue':
            case 'push':
                this.nodeStates[step.node] = 'visiting';
                break;
            case 'relax':
                this.edgeStates[`${step.from}-${step.to}`] = 'relaxed';
                if (!this.graph.directed) {
                    this.edgeStates[`${step.to}-${step.from}`] = 'relaxed';
                }
                if (step.distance !== undefined) {
                    this.distances[step.to] = step.distance;
                }
                break;
            case 'mst-add':
                this.edgeStates[`${step.from}-${step.to}`] = 'mst';
                if (!this.graph.directed) {
                    this.edgeStates[`${step.to}-${step.from}`] = 'mst';
                }
                this.nodeStates[step.from] = 'visited';
                this.nodeStates[step.to] = 'visited';
                break;
            case 'path':
                if (step.nodes) {
                    step.nodes.forEach(n => { this.nodeStates[n] = 'path'; });
                }
                if (step.edges) {
                    step.edges.forEach(([f, t]) => {
                        this.edgeStates[`${f}-${t}`] = 'path';
                        if (!this.graph.directed) this.edgeStates[`${t}-${f}`] = 'path';
                    });
                }
                break;
            case 'source':
                this.nodeStates[step.node] = 'source';
                break;
            case 'target':
                this.nodeStates[step.node] = 'target';
                break;
            case 'distance':
                this.distances[step.node] = step.distance;
                break;
            case 'consider':
                this.edgeStates[`${step.from}-${step.to}`] = 'relaxed';
                if (!this.graph.directed) this.edgeStates[`${step.to}-${step.from}`] = 'relaxed';
                break;
        }
        this.draw();
    },

    _getNodeColor(state) {
        switch (state) {
            case 'visiting': return '#FFE66D';
            case 'visited': return '#4ECDC4';
            case 'path': return '#FF6B6B';
            case 'source': return '#A8E6CF';
            case 'target': return '#FF8B94';
            default: return '#FFFFFF';
        }
    },

    _getEdgeColor(state) {
        switch (state) {
            case 'relaxed': return '#845EC2';
            case 'mst': return '#4ECDC4';
            case 'path': return '#FF6B6B';
            default: return '#1A1A1A';
        }
    },

    _getEdgeWidth(state) {
        switch (state) {
            case 'relaxed': return 3;
            case 'mst': return 4;
            case 'path': return 5;
            default: return 2;
        }
    },

    draw() {
        if (!this.ctx || !this.graph) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, h);

        // Draw grid dots
        ctx.fillStyle = '#e0e0e0';
        for (let x = 20; x < w; x += 40) {
            for (let y = 20; y < h; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw edges
        for (const edge of this.graph.edges) {
            const from = this.graph.nodes.get(edge.from);
            const to = this.graph.nodes.get(edge.to);
            if (!from || !to) continue;

            const key = `${edge.from}-${edge.to}`;
            const state = this.edgeStates[key] || 'default';
            const color = this._getEdgeColor(state);
            const width = this._getEdgeWidth(state);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();

            // Weight label
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            // Background for weight
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 2;
            const wText = String(edge.weight);
            const tw = ctx.measureText(wText).width;
            ctx.fillRect(mx - tw / 2 - 6, my - 10, tw + 12, 20);
            ctx.strokeRect(mx - tw / 2 - 6, my - 10, tw + 12, 20);

            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 11px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(wText, mx, my);
        }

        // Draw edge in-progress
        if (GraphEditor && GraphEditor.edgeStartNode !== null) {
            const startNode = this.graph.nodes.get(GraphEditor.edgeStartNode);
            if (startNode) {
                ctx.beginPath();
                ctx.moveTo(startNode.x, startNode.y);
                ctx.lineTo(GraphEditor.mousePos.x, GraphEditor.mousePos.y);
                ctx.strokeStyle = '#845EC2';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw nodes
        const nodeRadius = 22;
        for (const [id, node] of this.graph.nodes) {
            const state = this.nodeStates[id];
            const color = this._getNodeColor(state);

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.arc(node.x + 3, node.y + 3, nodeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Node circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y);

            // Distance label (for shortest path algos)
            if (this.distances[id] !== undefined) {
                const dist = this.distances[id] === Infinity ? '∞' : String(this.distances[id]);
                ctx.fillStyle = '#845EC2';
                ctx.font = "bold 10px 'Space Mono', monospace";
                ctx.fillText('d=' + dist, node.x, node.y + nodeRadius + 14);
            }
        }
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null;
        this.ctx = null;
        this.graph = null;
    }
};

window.GraphRenderer = GraphRenderer;
