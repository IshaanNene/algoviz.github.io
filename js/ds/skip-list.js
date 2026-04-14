/* ============================================
   SKIP LIST VISUALIZATION
   ============================================ */
const SkipListViz = {
    canvas: null, ctx: null, maxLevel: 4, head: null, highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.maxLevel = 4; this.head = this._createNode(-Infinity, this.maxLevel); this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _createNode(val, level) { return { val, forward: new Array(level + 1).fill(null) }; },
    _randomLevel() { let l = 0; while (Math.random() < 0.5 && l < this.maxLevel) l++; return l; },

    insert(val) {
        const s = [], update = new Array(this.maxLevel + 1).fill(null);
        let curr = this.head;
        for (let i = this.maxLevel; i >= 0; i--) {
            while (curr.forward[i] && curr.forward[i].val < val) {
                s.push({ type: 'traverse', val: curr.forward[i].val, level: i });
                curr = curr.forward[i];
            }
            update[i] = curr;
        }
        const level = this._randomLevel();
        const newNode = this._createNode(val, level);
        s.push({ type: 'insert', val, level });
        for (let i = 0; i <= level; i++) {
            newNode.forward[i] = update[i].forward[i];
            update[i].forward[i] = newNode;
        }
        s.push({ type: 'done' }); this.draw(); return s;
    },

    search(val) {
        const s = [];
        let curr = this.head;
        for (let i = this.maxLevel; i >= 0; i--) {
            while (curr.forward[i] && curr.forward[i].val < val) {
                s.push({ type: 'traverse', val: curr.forward[i].val, level: i });
                curr = curr.forward[i];
            }
            s.push({ type: 'drop', level: i });
        }
        curr = curr.forward[0];
        if (curr && curr.val === val) { s.push({ type: 'found', val }); }
        else { s.push({ type: 'not-found' }); }
        return s;
    },

    deleteVal(val) {
        const s = [], update = new Array(this.maxLevel + 1).fill(null);
        let curr = this.head;
        for (let i = this.maxLevel; i >= 0; i--) {
            while (curr.forward[i] && curr.forward[i].val < val) curr = curr.forward[i];
            update[i] = curr;
        }
        curr = curr.forward[0];
        if (curr && curr.val === val) {
            s.push({ type: 'delete', val });
            for (let i = 0; i <= this.maxLevel; i++) {
                if (update[i].forward[i] !== curr) break;
                update[i].forward[i] = curr.forward[i];
            }
        } else { s.push({ type: 'not-found' }); }
        s.push({ type: 'done' }); this.draw(); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'traverse') this.highlights[`${step.val}-${step.level}`] = '#845EC2';
        if (step.type === 'insert') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'found') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'delete') this.highlights[step.val] = '#FF6B6B';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.clear(); [3, 6, 7, 9, 12, 17, 19, 21, 25, 26].forEach(v => this.insert(v)); this.draw(); },
    clear() { this.head = this._createNode(-Infinity, this.maxLevel); this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);

        // Collect all nodes
        const nodes = []; let curr = this.head.forward[0];
        while (curr) { nodes.push(curr); curr = curr.forward[0]; }
        if (nodes.length === 0) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Skip List is empty. Insert values to begin.', w / 2, h / 2); return; }

        const cellW = Math.min(55, (w - 120) / (nodes.length + 1));
        const cellH = 28, levelGap = 8;
        const totalH = (this.maxLevel + 1) * (cellH + levelGap);
        const startY = (h - totalH) / 2 + totalH - cellH;
        const startX = 60;
        const colors = ['#845EC2', '#4ECDC4', '#FFA552', '#FF6B6B', '#FFE66D'];

        // Level labels
        for (let l = 0; l <= this.maxLevel; l++) {
            const y = startY - l * (cellH + levelGap);
            this.ctx.fillStyle = '#666'; this.ctx.font = '10px Inter'; this.ctx.textAlign = 'right';
            this.ctx.fillText(`L${l}`, startX - 10, y + cellH / 2 + 4);
        }

        // Draw HEAD
        for (let l = 0; l <= this.maxLevel; l++) {
            const y = startY - l * (cellH + levelGap);
            this.ctx.fillStyle = '#333'; this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 1;
            this.ctx.fillRect(startX, y, 35, cellH);
            this.ctx.strokeRect(startX, y, 35, cellH);
            this.ctx.fillStyle = '#888'; this.ctx.font = '9px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText('HEAD', startX + 17, y + cellH / 2);
        }

        // Draw nodes and connections
        nodes.forEach((node, i) => {
            const x = startX + 40 + (i + 1) * cellW;
            const level = node.forward.length - 1;
            for (let l = 0; l <= level; l++) {
                const y = startY - l * (cellH + levelGap);
                const color = this.highlights[node.val] || this.highlights[`${node.val}-${l}`] || '#1A1A1A';
                this.ctx.fillStyle = color; this.ctx.strokeStyle = colors[l % colors.length]; this.ctx.lineWidth = 2;
                this.ctx.fillRect(x, y, cellW - 6, cellH);
                this.ctx.strokeRect(x, y, cellW - 6, cellH);
                this.ctx.fillStyle = '#fff'; this.ctx.font = 'bold 12px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                this.ctx.fillText(node.val, x + (cellW - 6) / 2, y + cellH / 2);
            }
        });

        // Draw forward pointers (arrows)
        for (let l = 0; l <= this.maxLevel; l++) {
            const y = startY - l * (cellH + levelGap) + cellH / 2;
            this.ctx.strokeStyle = colors[l % colors.length]; this.ctx.lineWidth = 1.5;
            let prevX = startX + 35;
            let c = this.head;
            while (c.forward[l]) {
                const idx = nodes.indexOf(c.forward[l]);
                if (idx >= 0) {
                    const nextX = startX + 40 + (idx + 1) * cellW;
                    this.ctx.beginPath(); this.ctx.moveTo(prevX, y); this.ctx.lineTo(nextX, y); this.ctx.stroke();
                    // Arrow head
                    this.ctx.beginPath(); this.ctx.moveTo(nextX - 5, y - 3); this.ctx.lineTo(nextX, y); this.ctx.lineTo(nextX - 5, y + 3); this.ctx.stroke();
                    prevX = nextX + cellW - 6;
                }
                c = c.forward[l];
            }
        }
    }
};
window.SkipListViz = SkipListViz;
