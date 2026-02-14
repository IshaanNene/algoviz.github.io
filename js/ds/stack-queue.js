/* ============================================
   STACK & QUEUE VISUALIZATION
   ============================================ */

const StackQueueViz = {
    canvas: null,
    ctx: null,
    mode: 'stack', // 'stack' | 'queue'
    items: [],
    highlightIndex: -1,
    peekIndex: -1,

    init(canvas, mode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = mode || 'stack';
        this.items = [];
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

    push(value) {
        const steps = [];
        this.items.push(value);
        steps.push({ type: 'push', value, index: this.items.length - 1, items: [...this.items] });
        steps.push({ type: 'done', items: [...this.items] });
        return steps;
    },

    pop() {
        if (this.items.length === 0) return [];
        const steps = [];
        steps.push({ type: 'highlight', index: this.items.length - 1 });
        const val = this.items.pop();
        steps.push({ type: 'pop', value: val, items: [...this.items] });
        steps.push({ type: 'done', items: [...this.items] });
        return steps;
    },

    enqueue(value) {
        const steps = [];
        this.items.push(value);
        steps.push({ type: 'enqueue', value, index: this.items.length - 1, items: [...this.items] });
        steps.push({ type: 'done', items: [...this.items] });
        return steps;
    },

    dequeue() {
        if (this.items.length === 0) return [];
        const steps = [];
        steps.push({ type: 'highlight', index: 0 });
        const val = this.items.shift();
        steps.push({ type: 'dequeue', value: val, items: [...this.items] });
        steps.push({ type: 'done', items: [...this.items] });
        return steps;
    },

    peek() {
        if (this.items.length === 0) return [];
        const steps = [];
        const idx = this.mode === 'stack' ? this.items.length - 1 : 0;
        steps.push({ type: 'peek', index: idx });
        steps.push({ type: 'done', items: [...this.items] });
        return steps;
    },

    applyStep(step) {
        this.highlightIndex = -1;
        this.peekIndex = -1;
        switch (step.type) {
            case 'push':
            case 'enqueue':
                this.items = [...step.items];
                this.highlightIndex = step.index;
                break;
            case 'pop':
            case 'dequeue':
                this.items = [...step.items];
                break;
            case 'highlight':
                this.highlightIndex = step.index;
                break;
            case 'peek':
                this.peekIndex = step.index;
                break;
            case 'done':
                this.items = [...step.items];
                break;
        }
        this.draw();
    },

    reset() {
        this.highlightIndex = -1;
        this.peekIndex = -1;
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (this.items.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillText(`Empty ${this.mode} — add some items!`, w / 2, h / 2);
            return;
        }

        if (this.mode === 'stack') {
            this._drawStack(ctx, w, h);
        } else {
            this._drawQueue(ctx, w, h);
        }
    },

    _drawStack(ctx, w, h) {
        const itemW = 120;
        const itemH = 40;
        const gap = 4;
        const maxVisible = Math.min(this.items.length, Math.floor((h - 80) / (itemH + gap)));
        const startX = w / 2 - itemW / 2;
        const bottomY = h - 60;

        // Draw container
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(startX - 15, bottomY - maxVisible * (itemH + gap) - 20, itemW + 30, maxVisible * (itemH + gap) + 30);
        ctx.setLineDash([]);

        // TOP label
        ctx.fillStyle = '#FF6B6B';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'right';
        const topIdx = this.items.length - 1;

        // Draw items (bottom to top)
        const startIdx = Math.max(0, this.items.length - maxVisible);
        for (let i = startIdx; i < this.items.length; i++) {
            const visualIdx = i - startIdx;
            const x = startX;
            const y = bottomY - (visualIdx + 1) * (itemH + gap);

            let bgColor = '#fff';
            if (i === this.highlightIndex) bgColor = '#FF6B6B';
            if (i === this.peekIndex) bgColor = '#A8E6CF';
            if (i === topIdx && this.highlightIndex === -1 && this.peekIndex === -1) bgColor = '#FFE66D';

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(x + 4, y + 4, itemW, itemH);

            // Item
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, itemW, itemH);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, itemW, itemH);

            // Value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 16px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.items[i], x + itemW / 2, y + itemH / 2);

            // TOP marker
            if (i === topIdx) {
                ctx.fillStyle = '#FF6B6B';
                ctx.font = "bold 10px 'Space Mono', monospace";
                ctx.textAlign = 'left';
                ctx.fillText('← TOP', x + itemW + 10, y + itemH / 2);
            }
        }

        // Labels
        ctx.fillStyle = '#888';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`STACK (${this.items.length} items)`, w / 2, bottomY + 25);
    },

    _drawQueue(ctx, w, h) {
        const itemW = 70;
        const itemH = 50;
        const gap = 10;
        const totalW = this.items.length * (itemW + gap) - gap;
        let startX = Math.max(30, (w - totalW) / 2);
        const startY = h / 2 - itemH / 2;

        // FRONT label
        ctx.fillStyle = '#A8E6CF';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('FRONT', startX + itemW / 2, startY - 25);

        // REAR label
        if (this.items.length > 0) {
            const rearX = startX + (this.items.length - 1) * (itemW + gap);
            ctx.fillStyle = '#845EC2';
            ctx.fillText('REAR', rearX + itemW / 2, startY - 25);
        }

        for (let i = 0; i < this.items.length; i++) {
            const x = startX + i * (itemW + gap);
            const y = startY;

            let bgColor = '#fff';
            if (i === this.highlightIndex) bgColor = '#FF6B6B';
            if (i === this.peekIndex) bgColor = '#A8E6CF';
            if (i === 0) bgColor = bgColor === '#fff' ? '#FFE66D' : bgColor;

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(x + 4, y + 4, itemW, itemH);

            // Item
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, itemW, itemH);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, itemW, itemH);

            // Value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 16px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.items[i], x + itemW / 2, y + itemH / 2);

            // Arrow
            if (i < this.items.length - 1) {
                const ax = x + itemW;
                const ay = y + itemH / 2;
                ctx.strokeStyle = '#845EC2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ax + 2, ay);
                ctx.lineTo(ax + gap - 2, ay);
                ctx.stroke();
                ctx.fillStyle = '#845EC2';
                ctx.beginPath();
                ctx.moveTo(ax + gap - 2, ay);
                ctx.lineTo(ax + gap - 8, ay - 4);
                ctx.lineTo(ax + gap - 8, ay + 4);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.fillStyle = '#888';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`QUEUE (${this.items.length} items)`, w / 2, startY + itemH + 35);
    },

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.items = [];
    }
};

window.StackQueueViz = StackQueueViz;
