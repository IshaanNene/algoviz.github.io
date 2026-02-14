/* ============================================
   SEARCHING RENDERER — Array blocks with pointer labels
   ============================================ */
const SearchRenderer = {
    canvas: null, ctx: null,
    array: [], states: {}, target: null,
    pointers: { lo: -1, hi: -1, mid: -1 },

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.states = {}; this.pointers = { lo: -1, hi: -1, mid: -1 };
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

    setArray(arr, target) {
        this.array = [...arr]; this.target = target;
        this.states = {}; this.pointers = { lo: -1, hi: -1, mid: -1 };
        this.draw();
    },

    applyStep(step) {
        switch (step.type) {
            case 'check':
                // Clear previous checking highlight but keep eliminated
                for (const [k, v] of Object.entries(this.states)) {
                    if (v === 'checking') delete this.states[k];
                }
                this.states[step.index] = 'checking';
                break;
            case 'found':
                for (const [k, v] of Object.entries(this.states)) {
                    if (v === 'checking') delete this.states[k];
                }
                this.states[step.index] = 'found';
                break;
            case 'not-found':
                for (const [k, v] of Object.entries(this.states)) {
                    if (v === 'checking') delete this.states[k];
                }
                break;
            case 'eliminate':
                for (let i = step.from; i <= step.to; i++) {
                    if (this.states[i] !== 'found') this.states[i] = 'eliminated';
                }
                break;
            case 'set-bounds':
                this.pointers = { lo: step.lo, hi: step.hi, mid: step.mid };
                break;
            case 'jump':
                // Highlight the jump range
                for (let i = step.from; i <= step.to; i++) {
                    if (!this.states[i]) this.states[i] = 'jump-range';
                }
                break;
        }
        this.draw();
    },

    reset(arr, target) {
        this.states = {}; this.pointers = { lo: -1, hi: -1, mid: -1 };
        if (arr) this.array = [...arr];
        if (target !== undefined) this.target = target;
        this.draw();
    },

    _getColor(state) {
        switch (state) {
            case 'checking': return '#FFE66D';
            case 'found': return '#4ECDC4';
            case 'eliminated': return '#D5D5D5';
            case 'jump-range': return '#E8D5F5';
            default: return '#FFFFFF';
        }
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        const n = this.array.length;
        ctx.clearRect(0, 0, w, h);

        if (n === 0) return;

        // Target display
        if (this.target !== null) {
            ctx.fillStyle = '#845EC2'; ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(`Target: ${this.target}`, w / 2, 15);
        }

        const pad = 30;
        const boxW = Math.min(50, (w - pad * 2) / n - 2);
        const boxH = 40;
        const gap = Math.max(1, Math.min(3, (w - pad * 2 - n * boxW) / (n - 1)));
        const totalW = n * boxW + (n - 1) * gap;
        const startX = (w - totalW) / 2;
        const cy = h / 2 - 10;

        for (let i = 0; i < n; i++) {
            const x = startX + i * (boxW + gap);
            const fill = this._getColor(this.states[i]);

            ctx.fillStyle = fill;
            ctx.fillRect(x, cy, boxW, boxH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2;
            ctx.strokeRect(x, cy, boxW, boxH);

            // Value
            ctx.fillStyle = this.states[i] === 'eliminated' ? '#999' : '#1A1A1A';
            ctx.font = `bold ${Math.min(12, boxW * 0.5)}px 'Space Mono', monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.array[i], x + boxW / 2, cy + boxH / 2);

            // Index below
            ctx.fillStyle = '#90A4AE'; ctx.font = `${Math.min(9, boxW * 0.3)}px 'Space Mono', monospace`;
            ctx.fillText(i, x + boxW / 2, cy + boxH + 12);

            // Pointer labels above
            const labels = [];
            if (i === this.pointers.lo) labels.push('lo');
            if (i === this.pointers.hi) labels.push('hi');
            if (i === this.pointers.mid) labels.push('mid');
            if (labels.length > 0) {
                ctx.fillStyle = '#845EC2'; ctx.font = `bold ${Math.min(10, boxW * 0.4)}px 'Space Mono', monospace`;
                ctx.fillText(labels.join('/'), x + boxW / 2, cy - 8);
                // Arrow
                ctx.strokeStyle = '#845EC2'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(x + boxW / 2, cy - 3); ctx.lineTo(x + boxW / 2, cy); ctx.stroke();
            }
        }

        // Found message
        const foundIdx = Object.entries(this.states).find(([, v]) => v === 'found');
        if (foundIdx) {
            ctx.fillStyle = '#4ECDC4'; ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(`✓ Found at index ${foundIdx[0]}!`, w / 2, cy + boxH + 35);
        }

        // Not-found message
        const allEliminated = n > 0 && Object.values(this.states).filter(v => v === 'eliminated').length > 0 && !foundIdx;
        if (allEliminated && !Object.values(this.states).includes('checking')) {
            ctx.fillStyle = '#FF6B6B'; ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('✗ Not found in array', w / 2, cy + boxH + 35);
        }
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null; this.ctx = null; this.array = []; this.states = {};
    }
};
window.SearchRenderer = SearchRenderer;
