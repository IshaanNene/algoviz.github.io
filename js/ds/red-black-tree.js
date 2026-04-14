/* ============================================
   RED-BLACK TREE VISUALIZATION
   ============================================ */
const RBTreeViz = {
    canvas: null, ctx: null, root: null, NIL: null, highlights: {},

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.NIL = { val: null, color: 'black', left: null, right: null, parent: null };
        this.root = this.NIL; this.highlights = {}; this._resize();
    },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _node(val) { return { val, color: 'red', left: this.NIL, right: this.NIL, parent: null }; },

    _rotateLeft(x, s) {
        const y = x.right; x.right = y.left;
        if (y.left !== this.NIL) y.left.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x; x.parent = y;
        s.push({ type: 'rotate', node: x.val, dir: 'left' });
    },
    _rotateRight(x, s) {
        const y = x.left; x.left = y.right;
        if (y.right !== this.NIL) y.right.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x; x.parent = y;
        s.push({ type: 'rotate', node: x.val, dir: 'right' });
    },

    _fixInsert(k, s) {
        while (k.parent && k.parent.color === 'red') {
            if (k.parent === (k.parent.parent ? k.parent.parent.left : null)) {
                const u = k.parent.parent ? k.parent.parent.right : this.NIL;
                if (u && u.color === 'red') {
                    k.parent.color = 'black'; u.color = 'black';
                    k.parent.parent.color = 'red'; k = k.parent.parent;
                    s.push({ type: 'recolor', node: k.val });
                } else {
                    if (k === k.parent.right) { k = k.parent; this._rotateLeft(k, s); }
                    k.parent.color = 'black';
                    if (k.parent.parent) { k.parent.parent.color = 'red'; this._rotateRight(k.parent.parent, s); }
                }
            } else {
                const u = k.parent.parent ? k.parent.parent.left : this.NIL;
                if (u && u.color === 'red') {
                    k.parent.color = 'black'; u.color = 'black';
                    k.parent.parent.color = 'red'; k = k.parent.parent;
                    s.push({ type: 'recolor', node: k.val });
                } else {
                    if (k === k.parent.left) { k = k.parent; this._rotateRight(k, s); }
                    k.parent.color = 'black';
                    if (k.parent.parent) { k.parent.parent.color = 'red'; this._rotateLeft(k.parent.parent, s); }
                }
            }
            if (k === this.root) break;
        }
        this.root.color = 'black';
    },

    insert(val) {
        const s = [], n = this._node(val);
        s.push({ type: 'insert', val });
        if (this.root === this.NIL) {
            this.root = n; n.color = 'black';
        } else {
            let curr = this.root, parent = null;
            while (curr !== this.NIL) {
                parent = curr; s.push({ type: 'visit', val: curr.val });
                curr = val < curr.val ? curr.left : curr.right;
            }
            n.parent = parent;
            if (val < parent.val) parent.left = n; else parent.right = n;
            this._fixInsert(n, s);
        }
        s.push({ type: 'done' }); this.draw(); return s;
    },

    search(val) {
        const s = []; let n = this.root;
        while (n !== this.NIL) {
            s.push({ type: 'visit', val: n.val });
            if (val === n.val) { s.push({ type: 'found', val }); return s; }
            n = val < n.val ? n.left : n.right;
        }
        s.push({ type: 'not-found' }); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit') this.highlights[step.val] = '#845EC2';
        if (step.type === 'insert') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'found') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'rotate') this.highlights[step.node] = '#FFA552';
        if (step.type === 'recolor') this.highlights[step.node] = '#FFE66D';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.clear(); [10, 20, 30, 15, 25, 5, 1, 35].forEach(v => this.insert(v)); this.draw(); },
    clear() { this.root = this.NIL; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (this.root === this.NIL) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Red-Black Tree is empty. Insert nodes to begin.', w / 2, h / 2); return; }
        const positions = {}, depth = this._depth(this.root);
        const nodeR = Math.max(14, Math.min(22, w / (Math.pow(2, depth) * 3)));
        this._layout(this.root, w / 2, 35, w / 4, positions, depth);
        // Edges
        this.ctx.lineWidth = 2;
        this._drawEdges(this.root, positions);
        // Nodes
        for (const val in positions) {
            const { x, y, color } = positions[val];
            const highlight = this.highlights[parseInt(val)];
            const fillColor = highlight || (color === 'red' ? '#D32F2F' : '#1A1A1A');
            this.ctx.beginPath(); this.ctx.arc(x, y, nodeR, 0, Math.PI * 2);
            this.ctx.fillStyle = fillColor; this.ctx.fill();
            this.ctx.strokeStyle = color === 'red' ? '#FF6B6B' : '#555'; this.ctx.lineWidth = 2.5; this.ctx.stroke();
            this.ctx.fillStyle = '#fff'; this.ctx.font = `bold ${Math.max(10, nodeR * 0.7)}px Inter`; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(val, x, y);
        }
    },
    _depth(n) { return (!n || n === this.NIL) ? 0 : 1 + Math.max(this._depth(n.left), this._depth(n.right)); },
    _layout(n, x, y, spread, pos, maxD) {
        if (!n || n === this.NIL) return;
        pos[n.val] = { x, y, color: n.color };
        const dy = Math.max(40, Math.min(60, (this.canvas.height / (window.devicePixelRatio || 1) - 70) / maxD));
        if (n.left !== this.NIL) this._layout(n.left, x - spread, y + dy, spread / 2, pos, maxD);
        if (n.right !== this.NIL) this._layout(n.right, x + spread, y + dy, spread / 2, pos, maxD);
    },
    _drawEdges(n, pos) {
        if (!n || n === this.NIL) return;
        if (n.left !== this.NIL && pos[n.left.val]) {
            this.ctx.strokeStyle = n.left.color === 'red' ? '#FF6B6B' : '#555';
            this.ctx.beginPath(); this.ctx.moveTo(pos[n.val].x, pos[n.val].y); this.ctx.lineTo(pos[n.left.val].x, pos[n.left.val].y); this.ctx.stroke();
        }
        if (n.right !== this.NIL && pos[n.right.val]) {
            this.ctx.strokeStyle = n.right.color === 'red' ? '#FF6B6B' : '#555';
            this.ctx.beginPath(); this.ctx.moveTo(pos[n.val].x, pos[n.val].y); this.ctx.lineTo(pos[n.right.val].x, pos[n.right.val].y); this.ctx.stroke();
        }
        this._drawEdges(n.left, pos); this._drawEdges(n.right, pos);
    }
};
window.RBTreeViz = RBTreeViz;
