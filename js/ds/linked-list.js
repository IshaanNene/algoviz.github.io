/* ============================================
   LINKED LIST VISUALIZATION
   ============================================ */
const LinkedListViz = {
    canvas: null, ctx: null, nodes: [], highlightIndex: -1, foundIndex: -1,

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.nodes = []; this.highlightIndex = -1; this.foundIndex = -1;
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

    applyStep(step) {
        switch (step.type) {
            case 'highlight': this.highlightIndex = step.index; this.foundIndex = -1; break;
            case 'found': this.foundIndex = step.index; this.highlightIndex = -1; break;
            case 'not-found': this.highlightIndex = -1; this.foundIndex = -1; break;
            case 'insert': this.nodes.splice(step.index, 0, step.value); this.highlightIndex = step.index; break;
            case 'delete': this.highlightIndex = step.index; break;
            case 'deleted': this.nodes.splice(step.index, 1); this.highlightIndex = -1; break;
            case 'swap': { const t = this.nodes[step.i]; this.nodes[step.i] = this.nodes[step.j]; this.nodes[step.j] = t; } break;
            case 'state': this.nodes = [...step.nodes]; break;
        }
        this.draw();
    },

    reset() { this.highlightIndex = -1; this.foundIndex = -1; },
    resetHighlights() { this.highlightIndex = -1; this.foundIndex = -1; this.draw(); },

    insertHead(val) { const s = []; s.push({ type: 'insert', index: 0, value: val }); return s; },
    insertTail(val) { const s = []; s.push({ type: 'insert', index: this.nodes.length, value: val }); return s; },
    insertAt(idx, val) { const i = Math.max(0, Math.min(idx, this.nodes.length)); const s = []; for (let j = 0; j < i; j++) s.push({ type: 'highlight', index: j }); s.push({ type: 'insert', index: i, value: val }); return s; },
    deleteHead() { if (this.nodes.length === 0) return []; return [{ type: 'delete', index: 0 }, { type: 'deleted', index: 0 }]; },
    deleteTail() { if (this.nodes.length === 0) return []; const i = this.nodes.length - 1; const s = []; for (let j = 0; j < i; j++) s.push({ type: 'highlight', index: j }); s.push({ type: 'delete', index: i }); s.push({ type: 'deleted', index: i }); return s; },
    search(val) { const s = []; for (let i = 0; i < this.nodes.length; i++) { s.push({ type: 'highlight', index: i }); if (this.nodes[i] === val) { s.push({ type: 'found', index: i }); return s; } } s.push({ type: 'not-found' }); return s; },
    reverse() {
        if (this.nodes.length <= 1) return [];
        const s = [];
        // Step 1: highlight each node being traversed (simulating pointer reversal)
        for (let i = 0; i < this.nodes.length; i++) {
            s.push({ type: 'highlight', index: i });
        }
        // Step 2: show pairwise swaps from outside in
        const n = [...this.nodes];
        let l = 0, r = n.length - 1;
        while (l < r) {
            [n[l], n[r]] = [n[r], n[l]];
            s.push({ type: 'swap', i: l, j: r });
            l++; r--;
        }
        // Step 3: emit final reversed state
        s.push({ type: 'state', nodes: [...n] });
        return s;
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        if (this.nodes.length === 0) {
            ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Empty linked list — add some nodes!', w / 2, h / 2); return;
        }
        const boxW = 70, boxH = 40, gap = 30, total = this.nodes.length * (boxW + gap) - gap;
        let startX = (w - total) / 2, cy = h / 2;

        for (let i = 0; i < this.nodes.length; i++) {
            const x = startX + i * (boxW + gap);
            let fill = '#FFFFFF';
            if (i === this.highlightIndex) fill = '#FFE66D';
            if (i === this.foundIndex) fill = '#4ECDC4';

            ctx.fillStyle = fill; ctx.fillRect(x, cy - boxH / 2, boxW, boxH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.strokeRect(x, cy - boxH / 2, boxW, boxH);
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.nodes[i], x + boxW / 2, cy);

            if (i < this.nodes.length - 1) {
                const ax = x + boxW, ay = cy, bx = x + boxW + gap, by = cy;
                ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
                ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 8, by - 5); ctx.lineTo(bx - 8, by + 5); ctx.closePath(); ctx.fill();
            }
        }
        const lastX = startX + (this.nodes.length - 1) * (boxW + gap) + boxW;
        ctx.fillStyle = '#90A4AE'; ctx.font = "bold 11px 'Space Mono', monospace"; ctx.textAlign = 'left';
        ctx.fillText('NULL', lastX + 10, cy);
    },

    destroy() { if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler); this.canvas = null; this.ctx = null; },
    clear() { this.nodes = []; this.highlightIndex = -1; this.foundIndex = -1; this.draw(); }
};
window.LinkedListViz = LinkedListViz;
