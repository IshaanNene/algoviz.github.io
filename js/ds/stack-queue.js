/* ============================================
   STACK & QUEUE VISUALIZATION
   ============================================ */
const StackQueueViz = {
    canvas: null, ctx: null, items: [], mode: 'stack', highlightIndex: -1, peekIndex: -1,

    init(canvas, mode) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.items = []; this.mode = mode || 'stack'; this.highlightIndex = -1; this.peekIndex = -1;
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
            case 'push': case 'enqueue': this.items.push(step.value); this.highlightIndex = this.items.length - 1; this.peekIndex = -1; break;
            case 'pop': this.highlightIndex = this.items.length - 1; break;
            case 'popped': this.items.pop(); this.highlightIndex = -1; break;
            case 'dequeue': this.highlightIndex = 0; break;
            case 'dequeued': this.items.shift(); this.highlightIndex = -1; break;
            case 'peek': this.peekIndex = this.mode === 'stack' ? this.items.length - 1 : 0; break;
        }
        this.draw();
    },

    reset() { this.highlightIndex = -1; this.peekIndex = -1; },
    resetHighlights() { this.highlightIndex = -1; this.peekIndex = -1; this.draw(); },

    push(val) { return [{ type: 'push', value: val }]; },
    pop() { if (this.items.length === 0) return []; return [{ type: 'pop' }, { type: 'popped' }]; },
    enqueue(val) { return [{ type: 'enqueue', value: val }]; },
    dequeue() { if (this.items.length === 0) return []; return [{ type: 'dequeue' }, { type: 'dequeued' }]; },
    peek() { if (this.items.length === 0) return []; return [{ type: 'peek' }]; },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const emptyMsg = this.mode === 'stack' ? 'Empty stack — add some items!' : 'Empty queue — add some items!';
        if (this.items.length === 0) { ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emptyMsg, w / 2, h / 2); return; }

        if (this.mode === 'stack') this._drawStack(ctx, w, h);
        else this._drawQueue(ctx, w, h);
    },

    _drawStack(ctx, w, h) {
        const boxW = 100, boxH = 40, gap = 4, n = this.items.length;
        const totalH = n * (boxH + gap); const startY = (h + totalH) / 2 - boxH - gap;
        const cx = w / 2;

        for (let i = 0; i < n; i++) {
            const y = startY - i * (boxH + gap);
            let fill = '#FFFFFF';
            if (i === this.highlightIndex) fill = '#FFE66D';
            if (i === this.peekIndex) fill = '#4ECDC4';
            ctx.fillStyle = fill; ctx.fillRect(cx - boxW / 2, y, boxW, boxH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.strokeRect(cx - boxW / 2, y, boxW, boxH);
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.items[i], cx, y + boxH / 2);
        }
        ctx.fillStyle = '#845EC2'; ctx.font = "bold 10px 'Space Mono', monospace"; ctx.textAlign = 'left';
        ctx.fillText('TOP →', cx + boxW / 2 + 8, startY - (n - 1) * (boxH + gap) + boxH / 2);
    },

    _drawQueue(ctx, w, h) {
        const boxW = 60, boxH = 50, gap = 6, n = this.items.length;
        const totalW = n * (boxW + gap); const startX = (w - totalW) / 2;
        const cy = h / 2;

        for (let i = 0; i < n; i++) {
            const x = startX + i * (boxW + gap);
            let fill = '#FFFFFF';
            if (i === this.highlightIndex) fill = '#FFE66D';
            if (i === this.peekIndex) fill = '#4ECDC4';
            ctx.fillStyle = fill; ctx.fillRect(x, cy - boxH / 2, boxW, boxH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.strokeRect(x, cy - boxH / 2, boxW, boxH);
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.items[i], x + boxW / 2, cy);
        }
        ctx.fillStyle = '#845EC2'; ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.textAlign = 'center'; ctx.fillText('FRONT', startX + boxW / 2, cy + boxH / 2 + 16);
        ctx.fillText('REAR', startX + (n - 1) * (boxW + gap) + boxW / 2, cy + boxH / 2 + 16);
    },

    destroy() { if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler); this.canvas = null; this.ctx = null; }
};
window.StackQueueViz = StackQueueViz;
