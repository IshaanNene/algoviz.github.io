/* ============================================
   GRAPH VISUALIZATION (Adjacency List)
   ============================================ */
const GraphViz = {
    canvas: null, ctx: null, nodes: {}, edges: [], nextId: 0, highlights: {}, edgeHighlights: {},
    dragging: null, dragOffsetX: 0, dragOffsetY: 0,

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.nodes = {}; this.edges = []; this.nextId = 0;
        this.highlights = {}; this.edgeHighlights = {};
        this.dragging = null;
        this._resize();
        this._bindMouse();
    },
    destroy() { this.canvas = null; this.ctx = null; this._unbindMouse(); },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    addNode(label) {
        const s = [];
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        const id = this.nextId++;
        this.nodes[id] = { label: label || String(id), x: 60 + Math.random() * (w - 120), y: 60 + Math.random() * (h - 120) };
        s.push({ type: 'add-node', id }); s.push({ type: 'done' }); this.draw(); return s;
    },
    addEdge(fromLabel, toLabel, weight) {
        const s = [];
        const fromId = Object.keys(this.nodes).find(id => this.nodes[id].label == fromLabel);
        const toId = Object.keys(this.nodes).find(id => this.nodes[id].label == toLabel);
        if (fromId === undefined || toId === undefined) { s.push({ type: 'not-found' }); return s; }
        this.edges.push({ from: parseInt(fromId), to: parseInt(toId), weight: weight || 1 });
        s.push({ type: 'add-edge', from: fromLabel, to: toLabel }); s.push({ type: 'done' }); this.draw(); return s;
    },
    removeNode(label) {
        const s = [];
        const id = Object.keys(this.nodes).find(id => this.nodes[id].label == label);
        if (id === undefined) { s.push({ type: 'not-found' }); return s; }
        const nid = parseInt(id);
        delete this.nodes[nid];
        this.edges = this.edges.filter(e => e.from !== nid && e.to !== nid);
        s.push({ type: 'remove-node', label }); s.push({ type: 'done' }); this.draw(); return s;
    },

    bfs(startLabel) {
        const s = [];
        const startId = Object.keys(this.nodes).find(id => this.nodes[id].label == startLabel);
        if (startId === undefined) { s.push({ type: 'not-found' }); return s; }
        const visited = new Set(), queue = [parseInt(startId)];
        visited.add(parseInt(startId));
        while (queue.length > 0) {
            const curr = queue.shift();
            s.push({ type: 'visit', id: curr });
            for (const e of this.edges) {
                const neighbor = e.from === curr ? e.to : (e.to === curr ? e.from : null);
                if (neighbor !== null && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    s.push({ type: 'discover', id: neighbor, edge: `${curr}-${neighbor}` });
                }
            }
        }
        s.push({ type: 'done' }); return s;
    },
    dfs(startLabel) {
        const s = [];
        const startId = Object.keys(this.nodes).find(id => this.nodes[id].label == startLabel);
        if (startId === undefined) { s.push({ type: 'not-found' }); return s; }
        const visited = new Set(), stack = [parseInt(startId)];
        while (stack.length > 0) {
            const curr = stack.pop();
            if (visited.has(curr)) continue;
            visited.add(curr);
            s.push({ type: 'visit', id: curr });
            for (const e of this.edges) {
                const neighbor = e.from === curr ? e.to : (e.to === curr ? e.from : null);
                if (neighbor !== null && !visited.has(neighbor)) {
                    stack.push(neighbor);
                    s.push({ type: 'discover', id: neighbor, edge: `${curr}-${neighbor}` });
                }
            }
        }
        s.push({ type: 'done' }); return s;
    },

    applyStep(step) {
        this.highlights = {}; this.edgeHighlights = {};
        if (step.type === 'visit') this.highlights[step.id] = '#4ECDC4';
        if (step.type === 'discover') { this.highlights[step.id] = '#845EC2'; if (step.edge) this.edgeHighlights[step.edge] = '#845EC2'; }
        if (step.type === 'add-node') this.highlights[step.id] = '#4ECDC4';
        if (step.type === 'add-edge') {}
        this.draw();
    },
    reset() { this.highlights = {}; this.edgeHighlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.edgeHighlights = {}; this.draw(); },

    buildSample() {
        this.clear();
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const positions = [
            [w * 0.3, h * 0.25], [w * 0.7, h * 0.25], [w * 0.15, h * 0.6],
            [w * 0.5, h * 0.5], [w * 0.85, h * 0.6], [w * 0.5, h * 0.8]
        ];
        labels.forEach((l, i) => { const id = this.nextId++; this.nodes[id] = { label: l, x: positions[i][0], y: positions[i][1] }; });
        this.edges = [
            { from: 0, to: 1, weight: 1 }, { from: 0, to: 2, weight: 1 }, { from: 0, to: 3, weight: 1 },
            { from: 1, to: 4, weight: 1 }, { from: 3, to: 5, weight: 1 }, { from: 2, to: 5, weight: 1 }, { from: 4, to: 3, weight: 1 }
        ];
        this.draw();
    },
    clear() { this.nodes = {}; this.edges = []; this.nextId = 0; this.highlights = {}; this.edgeHighlights = {}; this.draw(); },

    _bindMouse() {
        const self = this;
        this._onDown = (e) => {
            const rect = self.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            for (const id in self.nodes) {
                const n = self.nodes[id];
                if (Math.hypot(mx - n.x, my - n.y) < 22) { self.dragging = parseInt(id); self.dragOffsetX = mx - n.x; self.dragOffsetY = my - n.y; break; }
            }
        };
        this._onMove = (e) => {
            if (self.dragging === null) return;
            const rect = self.canvas.getBoundingClientRect();
            self.nodes[self.dragging].x = e.clientX - rect.left - self.dragOffsetX;
            self.nodes[self.dragging].y = e.clientY - rect.top - self.dragOffsetY;
            self.draw();
        };
        this._onUp = () => { self.dragging = null; };
        this.canvas.addEventListener('mousedown', this._onDown);
        this.canvas.addEventListener('mousemove', this._onMove);
        this.canvas.addEventListener('mouseup', this._onUp);
    },
    _unbindMouse() {
        if (this.canvas && this._onDown) { this.canvas.removeEventListener('mousedown', this._onDown); this.canvas.removeEventListener('mousemove', this._onMove); this.canvas.removeEventListener('mouseup', this._onUp); }
    },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (Object.keys(this.nodes).length === 0) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Graph is empty. Add nodes to begin.', w / 2, h / 2); return; }

        // Draw edges
        for (const e of this.edges) {
            const from = this.nodes[e.from], to = this.nodes[e.to];
            if (!from || !to) continue;
            const ek1 = `${e.from}-${e.to}`, ek2 = `${e.to}-${e.from}`;
            const color = this.edgeHighlights[ek1] || this.edgeHighlights[ek2] || '#555';
            this.ctx.strokeStyle = color; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.moveTo(from.x, from.y); this.ctx.lineTo(to.x, to.y); this.ctx.stroke();
            // Weight label
            if (e.weight > 1) {
                const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
                this.ctx.fillStyle = '#FFA552'; this.ctx.font = 'bold 10px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                this.ctx.fillText(e.weight, mx, my - 8);
            }
            // Arrowhead
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const nx = to.x - 22 * Math.cos(angle), ny = to.y - 22 * Math.sin(angle);
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(nx, ny);
            this.ctx.lineTo(nx - 8 * Math.cos(angle - 0.4), ny - 8 * Math.sin(angle - 0.4));
            this.ctx.lineTo(nx - 8 * Math.cos(angle + 0.4), ny - 8 * Math.sin(angle + 0.4));
            this.ctx.fill();
        }

        // Draw nodes
        for (const id in this.nodes) {
            const n = this.nodes[id];
            const color = this.highlights[parseInt(id)] || '#1A1A1A';
            this.ctx.beginPath(); this.ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = color; this.ctx.fill();
            this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 2; this.ctx.stroke();
            this.ctx.fillStyle = '#fff'; this.ctx.font = 'bold 14px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(n.label, n.x, n.y);
        }

        // Instructions
        this.ctx.fillStyle = '#666'; this.ctx.font = '10px Inter'; this.ctx.textAlign = 'left';
        this.ctx.fillText('Drag nodes to reposition', 10, h - 10);
    }
};
window.GraphViz = GraphViz;
