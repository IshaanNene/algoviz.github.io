/* ============================================
   SEGMENT TREE VISUALIZATION
   ============================================ */
const SegmentTreeViz = {
    canvas: null, ctx: null, tree: [], n: 0, arr: [], highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.tree = []; this.n = 0; this.arr = []; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    build(arr) {
        const s = [];
        this.arr = [...arr]; this.n = arr.length;
        this.tree = new Array(4 * this.n).fill(0);
        this._build(1, 0, this.n - 1, s);
        s.push({ type: 'done' }); this.draw(); return s;
    },
    _build(node, start, end, s) {
        if (start === end) { this.tree[node] = this.arr[start]; s.push({ type: 'build', node, val: this.tree[node], range: [start, end] }); return; }
        const mid = Math.floor((start + end) / 2);
        this._build(2 * node, start, mid, s);
        this._build(2 * node + 1, mid + 1, end, s);
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
        s.push({ type: 'build', node, val: this.tree[node], range: [start, end] });
    },

    update(idx, val) {
        const s = [];
        if (idx < 0 || idx >= this.n) return s;
        this.arr[idx] = val;
        this._update(1, 0, this.n - 1, idx, val, s);
        s.push({ type: 'done' }); this.draw(); return s;
    },
    _update(node, start, end, idx, val, s) {
        s.push({ type: 'visit', node, range: [start, end] });
        if (start === end) { this.tree[node] = val; s.push({ type: 'update', node, val }); return; }
        const mid = Math.floor((start + end) / 2);
        if (idx <= mid) this._update(2 * node, start, mid, idx, val, s);
        else this._update(2 * node + 1, mid + 1, end, idx, val, s);
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
        s.push({ type: 'update', node, val: this.tree[node] });
    },

    query(l, r) {
        const s = [];
        if (l < 0 || r >= this.n || l > r) return s;
        const result = this._query(1, 0, this.n - 1, l, r, s);
        s.push({ type: 'result', val: result }); s.push({ type: 'done' }); return s;
    },
    _query(node, start, end, l, r, s) {
        s.push({ type: 'visit', node, range: [start, end] });
        if (r < start || end < l) { s.push({ type: 'skip', node }); return 0; }
        if (l <= start && end <= r) { s.push({ type: 'include', node, val: this.tree[node] }); return this.tree[node]; }
        const mid = Math.floor((start + end) / 2);
        return this._query(2 * node, start, mid, l, r, s) + this._query(2 * node + 1, mid + 1, end, l, r, s);
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit') this.highlights[step.node] = '#845EC2';
        if (step.type === 'build') this.highlights[step.node] = '#4ECDC4';
        if (step.type === 'update') this.highlights[step.node] = '#FFA552';
        if (step.type === 'include') this.highlights[step.node] = '#4ECDC4';
        if (step.type === 'skip') this.highlights[step.node] = '#666';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },

    buildSample() { this.build([1, 3, 5, 7, 9, 11, 2, 4]); },
    clear() { this.tree = []; this.n = 0; this.arr = []; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (this.n === 0) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Segment Tree is empty. Build to begin.', w / 2, h / 2); return; }

        const depth = Math.ceil(Math.log2(this.n)) + 1;
        const nodeR = Math.max(12, Math.min(20, w / (Math.pow(2, depth) * 2.5)));
        const positions = {};
        this._layoutST(1, 0, this.n - 1, w / 2, 30, w / 4, positions, depth);

        // Edges
        this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 1.5;
        this._drawSTEdges(1, 0, this.n - 1, positions);

        // Nodes
        for (const key in positions) {
            const node = parseInt(key);
            const { x, y, range } = positions[key];
            if (node >= this.tree.length || this.tree[node] === undefined) continue;
            const color = this.highlights[node] || '#1A1A1A';
            this.ctx.beginPath(); this.ctx.arc(x, y, nodeR, 0, Math.PI * 2);
            this.ctx.fillStyle = color; this.ctx.fill(); this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2; this.ctx.stroke();
            this.ctx.fillStyle = '#fff'; this.ctx.font = `bold ${Math.max(9, nodeR * 0.7)}px Inter`; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.tree[node], x, y);
            this.ctx.fillStyle = '#888'; this.ctx.font = '8px Inter';
            this.ctx.fillText(`[${range[0]}-${range[1]}]`, x, y + nodeR + 8);
        }

        // Original array at bottom
        const cellW = Math.min(40, (w - 40) / this.n);
        const startX = (w - this.n * cellW) / 2;
        this.ctx.fillStyle = '#888'; this.ctx.font = '10px Inter'; this.ctx.textAlign = 'center';
        this.ctx.fillText('Array:', startX - 25, h - 15);
        this.arr.forEach((v, i) => {
            const x = startX + i * cellW + cellW / 2;
            this.ctx.fillStyle = '#2A2A2A'; this.ctx.fillRect(startX + i * cellW + 1, h - 30, cellW - 2, 20);
            this.ctx.fillStyle = '#fff'; this.ctx.font = '10px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(v, x, h - 20);
        });
    },
    _layoutST(node, start, end, x, y, spread, pos, maxD) {
        pos[node] = { x, y, range: [start, end] };
        if (start === end) return;
        const mid = Math.floor((start + end) / 2);
        const dy = Math.max(35, Math.min(55, (this.canvas.height / (window.devicePixelRatio || 1) - 90) / maxD));
        this._layoutST(2 * node, start, mid, x - spread, y + dy, spread / 2, pos, maxD);
        this._layoutST(2 * node + 1, mid + 1, end, x + spread, y + dy, spread / 2, pos, maxD);
    },
    _drawSTEdges(node, start, end, pos) {
        if (start === end) return;
        const mid = Math.floor((start + end) / 2);
        if (pos[node] && pos[2 * node]) { this.ctx.beginPath(); this.ctx.moveTo(pos[node].x, pos[node].y); this.ctx.lineTo(pos[2 * node].x, pos[2 * node].y); this.ctx.stroke(); }
        if (pos[node] && pos[2 * node + 1]) { this.ctx.beginPath(); this.ctx.moveTo(pos[node].x, pos[node].y); this.ctx.lineTo(pos[2 * node + 1].x, pos[2 * node + 1].y); this.ctx.stroke(); }
        this._drawSTEdges(2 * node, start, mid, pos);
        this._drawSTEdges(2 * node + 1, mid + 1, end, pos);
    }
};
window.SegmentTreeViz = SegmentTreeViz;
