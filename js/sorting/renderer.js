/* ============================================
   SORTING RENDERER — Canvas bar chart
   ============================================ */
const SortingRenderer = {
    canvas: null, ctx: null, array: [], states: {}, maxValue: 100,

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.states = {};
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

    setArray(arr) { this.array = [...arr]; this.maxValue = Math.max(...arr, 1); this.states = {}; this.draw(); },

    applyStep(step) {
        const ns = {};
        for (const [k, v] of Object.entries(this.states)) if (v === 'sorted') ns[k] = v;
        this.states = ns;
        if (step.array) this.array = [...step.array];
        switch (step.type) {
            case 'compare': step.indices.forEach(i => { this.states[i] = 'compare'; }); break;
            case 'swap': step.indices.forEach(i => { this.states[i] = 'swap'; }); break;
            case 'overwrite': step.indices.forEach(i => { this.states[i] = 'overwrite'; }); break;
            case 'sorted': step.indices.forEach(i => { this.states[i] = 'sorted'; }); break;
            case 'partition': step.indices.forEach(i => { this.states[i] = 'partition'; }); break;
            case 'bucket': step.indices.forEach(i => { this.states[i] = 'bucket'; }); break;
            case 'merge-split': for (let i = step.indices[0]; i <= step.indices[2]; i++) if (!this.states[i]) this.states[i] = 'compare'; break;
        }
        this.draw();
    },

    reset(arr) { this.states = {}; if (arr) { this.array = [...arr]; this.maxValue = Math.max(...arr, 1); } this.draw(); },

    _getColor(state) {
        switch (state) {
            case 'compare': return '#845EC2';
            case 'swap': return '#FF6B6B';
            case 'overwrite': return '#FFA552';
            case 'sorted': return '#4ECDC4';
            case 'partition': return '#FFE66D';
            case 'bucket': return '#FF8B94';
            default: return '#1A1A1A';
        }
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        const n = this.array.length; if (n === 0) { ctx.clearRect(0, 0, w, h); return; }
        const pad = 20, bW = Math.max(1, (w - pad * 2 - Math.max(1, Math.floor((w - pad * 2) / n * 0.15)) * (n - 1)) / n);
        const gap = Math.max(1, Math.floor((w - pad * 2) / n * 0.15));
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
            const x = pad + i * (bW + gap), bH = (this.array[i] / this.maxValue) * (h - pad * 2), y = h - pad - bH;
            ctx.fillStyle = this._getColor(this.states[i]);
            ctx.fillRect(x, y, bW, bH);
            if (bW > 3) { ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = bW > 8 ? 2 : 1; ctx.strokeRect(x, y, bW, bH); }
            if (bW > 20 && n <= 50) {
                ctx.fillStyle = this.states[i] === 'sorted' ? '#1A1A1A' : '#fff';
                ctx.font = `bold ${Math.min(12, bW * 0.5)}px 'Space Mono', monospace`;
                ctx.textAlign = 'center'; ctx.fillText(this.array[i], x + bW / 2, y - 5);
            }
        }
        if (n <= 30 && bW > 15) {
            ctx.fillStyle = '#888'; ctx.font = "9px 'Space Mono', monospace"; ctx.textAlign = 'center';
            for (let i = 0; i < n; i++) ctx.fillText(i, pad + i * (bW + gap) + bW / 2, h - 5);
        }
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null; this.ctx = null; this.array = []; this.states = {};
    }
};
window.SortingRenderer = SortingRenderer;
