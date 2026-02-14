/* ============================================
   HEAP VISUALIZATION
   Min/Max heap with dual view (tree + array)
   ============================================ */

const HeapViz = {
    canvas: null,
    ctx: null,
    heapArray: [],
    isMinHeap: true,
    highlightIndices: new Set(),
    swapIndices: [],

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.heapArray = [];
        this._resize();
    },

    _resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = parent.clientWidth * dpr;
        this.canvas.height = parent.clientHeight * dpr;
        this.canvas.style.width = parent.clientWidth + 'px';
        this.canvas.style.height = parent.clientHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw();
    },

    setType(isMin) {
        this.isMinHeap = isMin;
        this.heapArray = [];
        this.highlightIndices.clear();
        this.draw();
    },

    _compare(a, b) {
        return this.isMinHeap ? a < b : a > b;
    },

    insert(value) {
        const steps = [];
        this.heapArray.push(value);
        steps.push({ type: 'insert', index: this.heapArray.length - 1, value, array: [...this.heapArray] });

        // Bubble up
        let i = this.heapArray.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            steps.push({ type: 'compare', indices: [i, parent], array: [...this.heapArray] });
            if (this._compare(this.heapArray[i], this.heapArray[parent])) {
                [this.heapArray[i], this.heapArray[parent]] = [this.heapArray[parent], this.heapArray[i]];
                steps.push({ type: 'swap', indices: [i, parent], array: [...this.heapArray] });
                i = parent;
            } else {
                break;
            }
        }
        steps.push({ type: 'done', array: [...this.heapArray] });
        return steps;
    },

    extract() {
        if (this.heapArray.length === 0) return [];
        const steps = [];
        steps.push({ type: 'highlight', indices: [0], array: [...this.heapArray] });

        // Move last to root
        const extracted = this.heapArray[0];
        this.heapArray[0] = this.heapArray[this.heapArray.length - 1];
        this.heapArray.pop();
        steps.push({ type: 'extract', value: extracted, array: [...this.heapArray] });

        if (this.heapArray.length === 0) {
            steps.push({ type: 'done', array: [] });
            return steps;
        }

        // Heapify down
        let i = 0;
        const n = this.heapArray.length;
        while (true) {
            let target = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n) {
                steps.push({ type: 'compare', indices: [target, left], array: [...this.heapArray] });
                if (this._compare(this.heapArray[left], this.heapArray[target])) target = left;
            }
            if (right < n) {
                steps.push({ type: 'compare', indices: [target, right], array: [...this.heapArray] });
                if (this._compare(this.heapArray[right], this.heapArray[target])) target = right;
            }

            if (target !== i) {
                [this.heapArray[i], this.heapArray[target]] = [this.heapArray[target], this.heapArray[i]];
                steps.push({ type: 'swap', indices: [i, target], array: [...this.heapArray] });
                i = target;
            } else break;
        }
        steps.push({ type: 'done', array: [...this.heapArray] });
        return steps;
    },

    buildSample() {
        this.heapArray = [];
        const values = this.isMinHeap
            ? [5, 10, 15, 20, 25, 30, 35]
            : [35, 30, 25, 20, 15, 10, 5];
        // Build heap properly
        for (const v of [15, 25, 5, 30, 10, 35, 20]) {
            this.heapArray.push(v);
            let i = this.heapArray.length - 1;
            while (i > 0) {
                const p = Math.floor((i - 1) / 2);
                if (this._compare(this.heapArray[i], this.heapArray[p])) {
                    [this.heapArray[i], this.heapArray[p]] = [this.heapArray[p], this.heapArray[i]];
                    i = p;
                } else break;
            }
        }
        this.highlightIndices.clear();
        this.swapIndices = [];
        this.draw();
    },

    applyStep(step) {
        this.highlightIndices.clear();
        this.swapIndices = [];
        if (step.array) this.heapArray = [...step.array];
        switch (step.type) {
            case 'compare':
                step.indices.forEach(i => this.highlightIndices.add(i));
                break;
            case 'swap':
                this.swapIndices = step.indices;
                break;
            case 'insert':
                this.highlightIndices.add(step.index);
                break;
            case 'highlight':
                step.indices.forEach(i => this.highlightIndices.add(i));
                break;
        }
        this.draw();
    },

    reset() {
        this.highlightIndices.clear();
        this.swapIndices = [];
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (this.heapArray.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillText(`Empty ${this.isMinHeap ? 'min' : 'max'} heap — insert values!`, w / 2, h / 2);
            return;
        }

        // Split: top 65% tree, bottom 35% array
        const treeH = h * 0.6;
        const arrayH = h * 0.35;
        const arrayY = treeH + 20;

        // Draw separator
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(20, treeH + 10);
        ctx.lineTo(w - 20, treeH + 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#845EC2';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText('TREE VIEW', 20, 25);
        ctx.fillText('ARRAY VIEW', 20, arrayY);

        // Draw tree
        this._drawTree(ctx, w, treeH);

        // Draw array
        this._drawArray(ctx, w, arrayY + 15, arrayH - 25);
    },

    _drawTree(ctx, w, maxH) {
        const n = this.heapArray.length;
        const levels = Math.ceil(Math.log2(n + 1));
        const nodeR = 20;
        const levelH = Math.min(65, (maxH - 60) / levels);

        const positions = [];
        for (let i = 0; i < n; i++) {
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            const spacing = w / (nodesInLevel + 1);
            const x = spacing * (posInLevel + 1);
            const y = 45 + level * levelH;
            positions.push({ x, y });
        }

        // Draw edges
        for (let i = 0; i < n; i++) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n) {
                ctx.strokeStyle = '#1A1A1A';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(positions[i].x, positions[i].y + nodeR);
                ctx.lineTo(positions[left].x, positions[left].y - nodeR);
                ctx.stroke();
            }
            if (right < n) {
                ctx.strokeStyle = '#1A1A1A';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(positions[i].x, positions[i].y + nodeR);
                ctx.lineTo(positions[right].x, positions[right].y - nodeR);
                ctx.stroke();
            }
        }

        // Draw nodes
        for (let i = 0; i < n; i++) {
            let bgColor = '#fff';
            if (this.highlightIndices.has(i)) bgColor = '#FFE66D';
            if (this.swapIndices.includes(i)) bgColor = '#FF6B6B';
            if (i === 0) bgColor = bgColor === '#fff' ? '#A8E6CF' : bgColor;

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.arc(positions[i].x + 3, positions[i].y + 3, nodeR, 0, Math.PI * 2);
            ctx.fill();

            // Node
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(positions[i].x, positions[i].y, nodeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.heapArray[i], positions[i].x, positions[i].y);
        }
    },

    _drawArray(ctx, w, startY, maxH) {
        const n = this.heapArray.length;
        const cellW = Math.min(50, (w - 60) / n);
        const cellH = 40;
        const totalW = n * cellW;
        const startX = (w - totalW) / 2;

        for (let i = 0; i < n; i++) {
            const x = startX + i * cellW;
            const y = startY + 10;

            let bgColor = '#fff';
            if (this.highlightIndices.has(i)) bgColor = '#FFE66D';
            if (this.swapIndices.includes(i)) bgColor = '#FF6B6B';
            if (i === 0) bgColor = bgColor === '#fff' ? '#A8E6CF' : bgColor;

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(x + 2, y + 2, cellW, cellH);

            // Cell
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, cellW, cellH);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellW, cellH);

            // Value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.heapArray[i], x + cellW / 2, y + cellH / 2);

            // Index
            ctx.fillStyle = '#888';
            ctx.font = "9px 'Space Mono', monospace";
            ctx.fillText(i, x + cellW / 2, y + cellH + 14);
        }
    },

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.heapArray = [];
    }
};

window.HeapViz = HeapViz;
