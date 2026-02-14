/* ============================================
   HEAP VISUALIZATION (Min/Max)
   ============================================ */
const HeapViz = {
    canvas: null, ctx: null, heapArray: [], isMinHeap: true,
    highlightIndices: new Set(), swapIndices: new Set(),

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.heapArray = []; this.isMinHeap = true; this.highlightIndices = new Set(); this.swapIndices = new Set();
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

    setType(isMin) { this.isMinHeap = isMin; this.heapArray = []; this.draw(); },

    _compare(a, b) { return this.isMinHeap ? a < b : a > b; },

    _bubbleUp(arr, i, steps) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            steps.push({ type: 'compare', indices: [i, p], array: [...arr] });
            if (this._compare(arr[i], arr[p])) {
                [arr[i], arr[p]] = [arr[p], arr[i]];
                steps.push({ type: 'swap', indices: [i, p], array: [...arr] });
                i = p;
            } else break;
        }
    },

    _bubbleDown(arr, i, steps) {
        const n = arr.length;
        while (true) {
            let target = i; const l = 2 * i + 1, r = 2 * i + 2;
            if (l < n) { steps.push({ type: 'compare', indices: [l, target], array: [...arr] }); if (this._compare(arr[l], arr[target])) target = l; }
            if (r < n) { steps.push({ type: 'compare', indices: [r, target], array: [...arr] }); if (this._compare(arr[r], arr[target])) target = r; }
            if (target === i) break;
            [arr[i], arr[target]] = [arr[target], arr[i]];
            steps.push({ type: 'swap', indices: [i, target], array: [...arr] });
            i = target;
        }
    },

    insert(val) {
        const arr = [...this.heapArray], steps = [];
        arr.push(val);
        steps.push({ type: 'insert', index: arr.length - 1, array: [...arr] });
        this._bubbleUp(arr, arr.length - 1, steps);
        steps.push({ type: 'done', array: [...arr] });
        return steps;
    },

    extract() {
        if (this.heapArray.length === 0) return [];
        const arr = [...this.heapArray], steps = [];
        steps.push({ type: 'extract', index: 0, array: [...arr] });
        arr[0] = arr[arr.length - 1]; arr.pop();
        steps.push({ type: 'move-last', array: [...arr] });
        if (arr.length > 0) this._bubbleDown(arr, 0, steps);
        steps.push({ type: 'done', array: [...arr] });
        return steps;
    },

    applyStep(step) {
        this.highlightIndices = new Set(); this.swapIndices = new Set();
        switch (step.type) {
            case 'compare': step.indices.forEach(i => this.highlightIndices.add(i)); break;
            case 'swap': step.indices.forEach(i => this.swapIndices.add(i)); break;
            case 'insert': this.highlightIndices.add(step.index); break;
            case 'extract': this.highlightIndices.add(step.index); break;
        }
        if (step.array) this.heapArray = [...step.array];
        this.draw();
    },

    reset() { this.highlightIndices = new Set(); this.swapIndices = new Set(); },
    resetHighlights() { this.highlightIndices = new Set(); this.swapIndices = new Set(); this.draw(); },

    buildSample() {
        this.heapArray = this.isMinHeap ? [5, 10, 15, 20, 25, 30, 35] : [35, 30, 25, 20, 15, 10, 5];
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        if (this.heapArray.length === 0) {
            ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`Empty ${this.isMinHeap ? 'min' : 'max'} heap — insert some values!`, w / 2, h / 2); return;
        }
        this._drawTree(ctx, w, h * 0.65);
        this._drawArray(ctx, w, h * 0.65, h);
    },

    _drawTree(ctx, w, h) {
        const n = this.heapArray.length, R = 20;
        const depth = Math.floor(Math.log2(n)) + 1;
        const levelH = Math.min(60, (h - 40) / depth);

        const pos = [];
        for (let i = 0; i < n; i++) {
            const d = Math.floor(Math.log2(i + 1));
            const levelStart = (1 << d) - 1, levelCount = Math.min(1 << d, n - levelStart);
            const idx = i - levelStart;
            const spacing = w / (levelCount + 1);
            pos.push({ x: spacing * (idx + 1), y: 30 + d * levelH });
        }

        for (let i = 0; i < n; i++) {
            const l = 2 * i + 1, r = 2 * i + 2;
            if (l < n) { ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[l].x, pos[l].y); ctx.stroke(); }
            if (r < n) { ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[r].x, pos[r].y); ctx.stroke(); }
        }

        for (let i = 0; i < n; i++) {
            let fill = '#FFFFFF';
            if (this.highlightIndices.has(i)) fill = '#FFE66D';
            if (this.swapIndices.has(i)) fill = '#FF8B94';
            ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(pos[i].x, pos[i].y, R, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 13px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.heapArray[i], pos[i].x, pos[i].y);
        }
    },

    _drawArray(ctx, w, startY, h) {
        const n = this.heapArray.length, boxW = Math.min(50, (w - 40) / n), boxH = 35;
        const total = n * boxW; const startX = (w - total) / 2; const cy = startY + (h - startY) / 2;

        ctx.fillStyle = '#90A4AE'; ctx.font = "bold 10px 'Space Mono', monospace"; ctx.textAlign = 'center';
        ctx.fillText('Array representation:', w / 2, cy - boxH / 2 - 10);

        for (let i = 0; i < n; i++) {
            const x = startX + i * boxW;
            let fill = '#FFFFFF';
            if (this.highlightIndices.has(i)) fill = '#FFE66D';
            if (this.swapIndices.has(i)) fill = '#FF8B94';
            ctx.fillStyle = fill; ctx.fillRect(x, cy - boxH / 2, boxW, boxH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2; ctx.strokeRect(x, cy - boxH / 2, boxW, boxH);
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 12px 'Space Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.heapArray[i], x + boxW / 2, cy);
            ctx.fillStyle = '#90A4AE'; ctx.font = "9px 'Space Mono', monospace";
            ctx.fillText(i, x + boxW / 2, cy + boxH / 2 + 12);
        }
    },

    destroy() { if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler); this.canvas = null; this.ctx = null; }
};
window.HeapViz = HeapViz;
