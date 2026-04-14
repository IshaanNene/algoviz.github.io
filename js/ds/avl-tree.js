/* ============================================
   AVL TREE VISUALIZATION
   ============================================ */
const AVLTreeViz = {
    canvas: null, ctx: null, root: null, highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.root = null; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _node(val) { return { val, left: null, right: null, height: 1 }; },
    _height(n) { return n ? n.height : 0; },
    _balance(n) { return n ? this._height(n.left) - this._height(n.right) : 0; },
    _updateH(n) { if (n) n.height = 1 + Math.max(this._height(n.left), this._height(n.right)); },

    _rotateRight(y, s) {
        const x = y.left, t2 = x.right;
        s.push({ type: 'rotate', node: y.val, dir: 'right' });
        x.right = y; y.left = t2;
        this._updateH(y); this._updateH(x);
        return x;
    },
    _rotateLeft(x, s) {
        const y = x.right, t2 = y.left;
        s.push({ type: 'rotate', node: x.val, dir: 'left' });
        y.left = x; x.right = t2;
        this._updateH(x); this._updateH(y);
        return y;
    },

    _insertNode(node, val, s) {
        if (!node) { s.push({ type: 'insert', val }); return this._node(val); }
        s.push({ type: 'visit', val: node.val });
        if (val < node.val) node.left = this._insertNode(node.left, val, s);
        else if (val > node.val) node.right = this._insertNode(node.right, val, s);
        else return node;
        this._updateH(node);
        const bal = this._balance(node);
        if (bal > 1 && val < node.left.val) return this._rotateRight(node, s);
        if (bal < -1 && val > node.right.val) return this._rotateLeft(node, s);
        if (bal > 1 && val > node.left.val) { node.left = this._rotateLeft(node.left, s); return this._rotateRight(node, s); }
        if (bal < -1 && val < node.right.val) { node.right = this._rotateRight(node.right, s); return this._rotateLeft(node, s); }
        return node;
    },

    _minNode(n) { let c = n; while (c.left) c = c.left; return c; },

    _deleteNode(node, val, s) {
        if (!node) return null;
        s.push({ type: 'visit', val: node.val });
        if (val < node.val) node.left = this._deleteNode(node.left, val, s);
        else if (val > node.val) node.right = this._deleteNode(node.right, val, s);
        else {
            s.push({ type: 'delete', val: node.val });
            if (!node.left || !node.right) { node = node.left || node.right; }
            else { const t = this._minNode(node.right); node.val = t.val; node.right = this._deleteNode(node.right, t.val, s); }
        }
        if (!node) return null;
        this._updateH(node);
        const bal = this._balance(node);
        if (bal > 1 && this._balance(node.left) >= 0) return this._rotateRight(node, s);
        if (bal > 1 && this._balance(node.left) < 0) { node.left = this._rotateLeft(node.left, s); return this._rotateRight(node, s); }
        if (bal < -1 && this._balance(node.right) <= 0) return this._rotateLeft(node, s);
        if (bal < -1 && this._balance(node.right) > 0) { node.right = this._rotateRight(node.right, s); return this._rotateLeft(node, s); }
        return node;
    },

    insert(val) { const s = []; this.root = this._insertNode(this.root, val, s); s.push({ type: 'done' }); this.draw(); return s; },
    delete(val) { const s = []; this.root = this._deleteNode(this.root, val, s); s.push({ type: 'done' }); this.draw(); return s; },
    search(val) {
        const s = []; let n = this.root;
        while (n) { s.push({ type: 'visit', val: n.val }); if (val === n.val) { s.push({ type: 'found', val }); return s; } n = val < n.val ? n.left : n.right; }
        s.push({ type: 'not-found' }); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit') this.highlights[step.val] = '#845EC2';
        if (step.type === 'insert') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'found') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'delete') this.highlights[step.val] = '#FF6B6B';
        if (step.type === 'rotate') this.highlights[step.node] = '#FFA552';
        if (step.type === 'not-found') {}
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },

    buildSample() { this.root = null; [30, 20, 40, 10, 25, 35, 50, 5, 15].forEach(v => this.root = this._insertNode(this.root, v, [])); this.draw(); },
    clear() { this.root = null; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (!this.root) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('AVL Tree is empty. Insert nodes to begin.', w / 2, h / 2); return; }
        const positions = {}; const depth = this._depth(this.root);
        const nodeR = Math.max(14, Math.min(22, w / (Math.pow(2, depth) * 3)));
        this._layout(this.root, w / 2, 35, w / 4, positions, depth);
        // Draw edges
        this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 2;
        this._drawEdges(this.root, positions);
        // Draw nodes
        for (const val in positions) {
            const { x, y } = positions[val];
            const color = this.highlights[parseInt(val)] || '#1A1A1A';
            this.ctx.beginPath(); this.ctx.arc(x, y, nodeR, 0, Math.PI * 2);
            this.ctx.fillStyle = color; this.ctx.fill(); this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2; this.ctx.stroke();
            this.ctx.fillStyle = '#fff'; this.ctx.font = `bold ${Math.max(10, nodeR * 0.7)}px Inter`; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(val, x, y);
            // Balance factor
            const node = this._findNode(this.root, parseInt(val));
            if (node) {
                const bf = this._balance(node);
                this.ctx.font = '9px Inter'; this.ctx.fillStyle = Math.abs(bf) > 1 ? '#FF6B6B' : '#888';
                this.ctx.fillText('bf:' + bf, x, y - nodeR - 6);
            }
        }
    },
    _depth(n) { return n ? 1 + Math.max(this._depth(n.left), this._depth(n.right)) : 0; },
    _findNode(n, val) { if (!n) return null; if (n.val === val) return n; return val < n.val ? this._findNode(n.left, val) : this._findNode(n.right, val); },
    _layout(n, x, y, spread, pos, maxD) {
        if (!n) return;
        pos[n.val] = { x, y };
        const dy = Math.max(40, Math.min(60, (this.canvas.height / (window.devicePixelRatio || 1) - 70) / maxD));
        if (n.left) this._layout(n.left, x - spread, y + dy, spread / 2, pos, maxD);
        if (n.right) this._layout(n.right, x + spread, y + dy, spread / 2, pos, maxD);
    },
    _drawEdges(n, pos) {
        if (!n) return;
        if (n.left && pos[n.left.val]) { this.ctx.beginPath(); this.ctx.moveTo(pos[n.val].x, pos[n.val].y); this.ctx.lineTo(pos[n.left.val].x, pos[n.left.val].y); this.ctx.stroke(); }
        if (n.right && pos[n.right.val]) { this.ctx.beginPath(); this.ctx.moveTo(pos[n.val].x, pos[n.val].y); this.ctx.lineTo(pos[n.right.val].x, pos[n.right.val].y); this.ctx.stroke(); }
        this._drawEdges(n.left, pos); this._drawEdges(n.right, pos);
    }
};
window.AVLTreeViz = AVLTreeViz;
