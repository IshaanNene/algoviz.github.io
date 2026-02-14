/* ============================================
   BINARY TREE VISUALIZATION
   ============================================ */
const BinaryTreeViz = {
    canvas: null, ctx: null, root: null, highlightNode: null, foundNode: null, visitedNodes: new Set(),

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.root = null; this.highlightNode = null; this.foundNode = null; this.visitedNodes = new Set();
        this._resize();
        this._resizeHandler = () => this._resize();
        window.addEventListener('resize', this._resizeHandler);
    },

    _resize() {
        if (!this.canvas) return;
        const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1;
        this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr;
        this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw();
    },

    _insert(node, val) {
        if (!node) return { val, left: null, right: null };
        if (val < node.val) node.left = this._insert(node.left, val);
        else if (val > node.val) node.right = this._insert(node.right, val);
        return node;
    },

    _delete(node, val) {
        if (!node) return null;
        if (val < node.val) node.left = this._delete(node.left, val);
        else if (val > node.val) node.right = this._delete(node.right, val);
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            let min = node.right; while (min.left) min = min.left;
            node.val = min.val; node.right = this._delete(node.right, min.val);
        }
        return node;
    },

    applyStep(step) {
        switch (step.type) {
            case 'visit': this.highlightNode = step.value; this.visitedNodes.add(step.value); break;
            case 'found': this.foundNode = step.value; this.highlightNode = null; break;
            case 'not-found': this.highlightNode = null; break;
            case 'insert-done': this.root = this._insert(this.root, step.value); break;
            case 'delete-done': this.root = this._delete(this.root, step.value); break;
        }
        this.draw();
    },

    reset() { this.highlightNode = null; this.foundNode = null; this.visitedNodes = new Set(); },
    resetHighlights() { this.highlightNode = null; this.foundNode = null; this.visitedNodes = new Set(); this.draw(); },

    insert(val) { const s = []; this._searchSteps(this.root, val, s); s.push({ type: 'insert-done', value: val }); return s; },
    delete(val) { const s = []; this._searchSteps(this.root, val, s); s.push({ type: 'delete-done', value: val }); return s; },
    search(val) { const s = []; this._searchSteps(this.root, val, s); const found = this._find(this.root, val); s.push(found ? { type: 'found', value: val } : { type: 'not-found' }); return s; },

    _find(node, val) { if (!node) return false; if (val === node.val) return true; return val < node.val ? this._find(node.left, val) : this._find(node.right, val); },
    _searchSteps(node, val, s) { if (!node) return; s.push({ type: 'visit', value: node.val }); if (val < node.val) this._searchSteps(node.left, val, s); else if (val > node.val) this._searchSteps(node.right, val, s); },

    inorder() { const s = []; this._inorder(this.root, s); return s; },
    _inorder(node, s) { if (!node) return; this._inorder(node.left, s); s.push({ type: 'visit', value: node.val }); this._inorder(node.right, s); },
    preorder() { const s = []; this._preorder(this.root, s); return s; },
    _preorder(node, s) { if (!node) return; s.push({ type: 'visit', value: node.val }); this._preorder(node.left, s); this._preorder(node.right, s); },
    postorder() { const s = []; this._postorder(this.root, s); return s; },
    _postorder(node, s) { if (!node) return; this._postorder(node.left, s); this._postorder(node.right, s); s.push({ type: 'visit', value: node.val }); },
    levelorder() {
        if (!this.root) return [];
        const s = [], q = [this.root];
        while (q.length) { const n = q.shift(); s.push({ type: 'visit', value: n.val }); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
        return s;
    },

    buildSample() { this.root = null;[50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45].forEach(v => this.root = this._insert(this.root, v)); this.draw(); },
    clear() { this.root = null; this.highlightNode = null; this.foundNode = null; this.visitedNodes = new Set(); this.draw(); },

    _calcPositions(node, depth, x, dx) {
        if (!node) return [];
        const pos = [{ val: node.val, x, y: 50 + depth * 70, left: node.left, right: node.right }];
        return pos.concat(this._calcPositions(node.left, depth + 1, x - dx, dx / 2), this._calcPositions(node.right, depth + 1, x + dx, dx / 2));
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        if (!this.root) { ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Empty BST — insert some values!', w / 2, h / 2); return; }

        const nodes = this._calcPositions(this.root, 0, w / 2, w / 5);
        const nodeMap = {}; nodes.forEach(n => nodeMap[n.val] = n);

        for (const n of nodes) {
            if (n.left) { const c = nodeMap[n.left.val]; if (c) { ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke(); } }
            if (n.right) { const c = nodeMap[n.right.val]; if (c) { ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke(); } }
        }

        const R = 20;
        for (const n of nodes) {
            let fill = '#FFFFFF';
            if (this.visitedNodes.has(n.val)) fill = '#A8E6CF';
            if (n.val === this.highlightNode) fill = '#FFE66D';
            if (n.val === this.foundNode) fill = '#4ECDC4';
            ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 13px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(n.val, n.x, n.y);
        }
    },

    destroy() { if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler); this.canvas = null; this.ctx = null; }
};
window.BinaryTreeViz = BinaryTreeViz;
