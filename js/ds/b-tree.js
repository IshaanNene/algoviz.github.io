/* ============================================
   B-TREE VISUALIZATION (Order 3)
   ============================================ */
const BTreeViz = {
    canvas: null, ctx: null, root: null, order: 3, highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.root = null; this.order = 3; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _createNode(leaf = true) { return { keys: [], children: [], leaf }; },

    insert(val) {
        const s = [];
        if (!this.root) { this.root = this._createNode(true); this.root.keys.push(val); s.push({ type: 'insert', val }); }
        else {
            if (this.root.keys.length === 2 * this.order - 1) {
                const newRoot = this._createNode(false);
                newRoot.children.push(this.root);
                this._splitChild(newRoot, 0, s);
                this.root = newRoot;
                this._insertNonFull(this.root, val, s);
            } else { this._insertNonFull(this.root, val, s); }
        }
        s.push({ type: 'done' }); this.draw(); return s;
    },

    _splitChild(parent, i, s) {
        const t = this.order, child = parent.children[i];
        const newNode = this._createNode(child.leaf);
        s.push({ type: 'split', val: child.keys[t - 1] });
        parent.keys.splice(i, 0, child.keys[t - 1]);
        parent.children.splice(i + 1, 0, newNode);
        newNode.keys = child.keys.splice(t, t - 1);
        child.keys.splice(t - 1, 1);
        if (!child.leaf) { newNode.children = child.children.splice(t); }
    },

    _insertNonFull(node, val, s) {
        let i = node.keys.length - 1;
        s.push({ type: 'visit', keys: [...node.keys] });
        if (node.leaf) {
            while (i >= 0 && val < node.keys[i]) { i--; }
            node.keys.splice(i + 1, 0, val);
            s.push({ type: 'insert', val });
        } else {
            while (i >= 0 && val < node.keys[i]) { i--; }
            i++;
            if (node.children[i].keys.length === 2 * this.order - 1) {
                this._splitChild(node, i, s);
                if (val > node.keys[i]) i++;
            }
            this._insertNonFull(node.children[i], val, s);
        }
    },

    search(val) {
        const s = [];
        this._searchNode(this.root, val, s);
        return s;
    },
    _searchNode(node, val, s) {
        if (!node) { s.push({ type: 'not-found' }); return; }
        s.push({ type: 'visit', keys: [...node.keys] });
        let i = 0;
        while (i < node.keys.length && val > node.keys[i]) i++;
        if (i < node.keys.length && val === node.keys[i]) { s.push({ type: 'found', val }); return; }
        if (node.leaf) { s.push({ type: 'not-found' }); return; }
        this._searchNode(node.children[i], val, s);
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit' && step.keys) step.keys.forEach(k => this.highlights[k] = '#845EC2');
        if (step.type === 'insert') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'found') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'split') this.highlights[step.val] = '#FFA552';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.clear(); [10, 20, 5, 6, 12, 30, 7, 17, 3, 1, 25].forEach(v => this.insert(v)); this.draw(); },
    clear() { this.root = null; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (!this.root) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('B-Tree is empty. Insert values to begin.', w / 2, h / 2); return; }
        const positions = [];
        this._layoutBTree(this.root, w / 2, 35, w / 3, 0, positions);
        // Draw edges
        this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 1.5;
        for (const p of positions) {
            if (p.childPositions) {
                for (const cp of p.childPositions) {
                    this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y + 18); this.ctx.lineTo(cp.x, cp.y - 18); this.ctx.stroke();
                }
            }
        }
        // Draw nodes
        for (const p of positions) {
            const nodeW = p.keys.length * 35 + 10;
            const nodeH = 30;
            this.ctx.fillStyle = '#1A1A1A'; this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.roundRect(p.x - nodeW / 2, p.y - nodeH / 2, nodeW, nodeH, 6); this.ctx.fill(); this.ctx.stroke();
            p.keys.forEach((key, i) => {
                const kx = p.x - nodeW / 2 + 15 + i * 35;
                const color = this.highlights[key] || '#fff';
                this.ctx.fillStyle = color; this.ctx.font = 'bold 12px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                this.ctx.fillText(key, kx, p.y);
                if (i < p.keys.length - 1) {
                    this.ctx.strokeStyle = '#444'; this.ctx.beginPath();
                    this.ctx.moveTo(kx + 17, p.y - nodeH / 2 + 4); this.ctx.lineTo(kx + 17, p.y + nodeH / 2 - 4); this.ctx.stroke();
                }
            });
        }
    },
    _layoutBTree(node, x, y, spread, depth, positions) {
        if (!node) return;
        const pos = { x, y, keys: [...node.keys], childPositions: [] };
        positions.push(pos);
        const dy = 65;
        const childCount = node.children.length;
        if (childCount > 0) {
            const totalW = childCount * spread;
            const startX = x - totalW / 2 + spread / 2;
            node.children.forEach((child, i) => {
                const cx = startX + i * spread;
                const cp = { x: cx, y: y + dy };
                pos.childPositions.push(cp);
                this._layoutBTree(child, cx, y + dy, Math.max(50, spread / 2), depth + 1, positions);
            });
        }
    }
};
window.BTreeViz = BTreeViz;
