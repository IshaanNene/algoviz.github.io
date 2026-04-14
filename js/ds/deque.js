/* ============================================
   DEQUE (DOUBLE-ENDED QUEUE) VISUALIZATION
   ============================================ */
const DequeViz = {
    canvas: null, ctx: null, items: [], highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.items = []; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    pushFront(val) { const s = []; this.items.unshift(val); s.push({ type: 'push-front', val, index: 0 }); s.push({ type: 'done' }); this.draw(); return s; },
    pushBack(val) { const s = []; this.items.push(val); s.push({ type: 'push-back', val, index: this.items.length - 1 }); s.push({ type: 'done' }); this.draw(); return s; },
    popFront() {
        const s = [];
        if (this.items.length === 0) { s.push({ type: 'empty' }); return s; }
        const val = this.items.shift();
        s.push({ type: 'pop-front', val, index: 0 }); s.push({ type: 'done' }); this.draw(); return s;
    },
    popBack() {
        const s = [];
        if (this.items.length === 0) { s.push({ type: 'empty' }); return s; }
        const val = this.items.pop();
        s.push({ type: 'pop-back', val, index: this.items.length }); s.push({ type: 'done' }); this.draw(); return s;
    },
    peekFront() {
        const s = [];
        if (this.items.length === 0) { s.push({ type: 'empty' }); return s; }
        s.push({ type: 'peek', val: this.items[0], index: 0 }); return s;
    },
    peekBack() {
        const s = [];
        if (this.items.length === 0) { s.push({ type: 'empty' }); return s; }
        s.push({ type: 'peek', val: this.items[this.items.length - 1], index: this.items.length - 1 }); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'push-front' || step.type === 'push-back') this.highlights[step.index] = '#4ECDC4';
        if (step.type === 'pop-front' || step.type === 'pop-back') this.highlights[step.index] = '#FF6B6B';
        if (step.type === 'peek') this.highlights[step.index] = '#845EC2';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.items = [10, 20, 30, 40, 50]; this.draw(); },
    clear() { this.items = []; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (this.items.length === 0) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Deque is empty.', w / 2, h / 2); return; }

        const cellW = Math.min(60, (w - 100) / this.items.length), cellH = 40;
        const totalW = this.items.length * cellW;
        const startX = (w - totalW) / 2, y = h / 2 - cellH / 2;

        // Draw cells
        this.items.forEach((val, i) => {
            const x = startX + i * cellW;
            const color = this.highlights[i] || '#1A1A1A';
            this.ctx.fillStyle = color; this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.roundRect(x + 1, y, cellW - 2, cellH, 4); this.ctx.fill(); this.ctx.stroke();
            this.ctx.fillStyle = '#fff'; this.ctx.font = 'bold 14px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(val, x + cellW / 2, y + cellH / 2);
        });

        // Front/Back labels
        this.ctx.font = 'bold 11px Inter';
        this.ctx.fillStyle = '#4ECDC4'; this.ctx.textAlign = 'center';
        this.ctx.fillText('◀ FRONT', startX + cellW / 2, y - 12);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillText('BACK ▶', startX + totalW - cellW / 2, y - 12);

        // Arrows on sides
        this.ctx.strokeStyle = '#4ECDC4'; this.ctx.lineWidth = 2;
        const ax = startX - 15; const ay = y + cellH / 2;
        this.ctx.beginPath(); this.ctx.moveTo(ax - 20, ay - 8); this.ctx.lineTo(ax, ay); this.ctx.lineTo(ax - 20, ay + 8); this.ctx.stroke();
        this.ctx.fillStyle = '#4ECDC4'; this.ctx.font = '9px Inter'; this.ctx.textAlign = 'right';
        this.ctx.fillText('push', ax - 22, ay - 3); this.ctx.fillText('pop', ax - 22, ay + 10);

        const bx = startX + totalW + 15;
        this.ctx.strokeStyle = '#FF6B6B';
        this.ctx.beginPath(); this.ctx.moveTo(bx + 20, ay - 8); this.ctx.lineTo(bx, ay); this.ctx.lineTo(bx + 20, ay + 8); this.ctx.stroke();
        this.ctx.fillStyle = '#FF6B6B'; this.ctx.textAlign = 'left';
        this.ctx.fillText('push', bx + 22, ay - 3); this.ctx.fillText('pop', bx + 22, ay + 10);

        // Size
        this.ctx.fillStyle = '#888'; this.ctx.font = '11px Inter'; this.ctx.textAlign = 'center';
        this.ctx.fillText(`Size: ${this.items.length}`, w / 2, y + cellH + 25);
    }
};
window.DequeViz = DequeViz;
