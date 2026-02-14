/* ============================================
   LINKED LIST VISUALIZATION
   ============================================ */

const LinkedListViz = {
    canvas: null,
    ctx: null,
    nodes: [],      // [{ value, state }]
    engine: null,
    highlightIndex: -1,
    foundIndex: -1,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
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

    // Operations that generate steps
    insertHead(value) {
        const steps = [];
        steps.push({ type: 'highlight', index: 0 });
        this.nodes.unshift({ value, state: 'new' });
        steps.push({ type: 'insert', index: 0, value, nodes: this.nodes.map(n => ({ ...n })) });
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    insertTail(value) {
        const steps = [];
        // Traverse to end
        for (let i = 0; i < this.nodes.length; i++) {
            steps.push({ type: 'traverse', index: i });
        }
        this.nodes.push({ value, state: 'new' });
        steps.push({ type: 'insert', index: this.nodes.length - 1, value, nodes: this.nodes.map(n => ({ ...n })) });
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    insertAt(index, value) {
        const steps = [];
        index = Math.max(0, Math.min(index, this.nodes.length));
        for (let i = 0; i < index; i++) {
            steps.push({ type: 'traverse', index: i });
        }
        this.nodes.splice(index, 0, { value, state: 'new' });
        steps.push({ type: 'insert', index, value, nodes: this.nodes.map(n => ({ ...n })) });
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    deleteHead() {
        if (this.nodes.length === 0) return [];
        const steps = [];
        steps.push({ type: 'highlight', index: 0 });
        steps.push({ type: 'delete', index: 0 });
        this.nodes.shift();
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    deleteTail() {
        if (this.nodes.length === 0) return [];
        const steps = [];
        for (let i = 0; i < this.nodes.length; i++) {
            steps.push({ type: 'traverse', index: i });
        }
        steps.push({ type: 'delete', index: this.nodes.length - 1 });
        this.nodes.pop();
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    search(value) {
        const steps = [];
        let found = false;
        for (let i = 0; i < this.nodes.length; i++) {
            steps.push({ type: 'traverse', index: i });
            steps.push({ type: 'compare', index: i, value });
            if (this.nodes[i].value === value) {
                steps.push({ type: 'found', index: i });
                found = true;
                break;
            }
        }
        if (!found) {
            steps.push({ type: 'not-found' });
        }
        return steps;
    },

    reverse() {
        const steps = [];
        if (this.nodes.length <= 1) return steps;
        this.nodes.reverse();
        steps.push({ type: 'reverse', nodes: this.nodes.map(n => ({ ...n })) });
        steps.push({ type: 'done', nodes: this.nodes.map(n => ({ ...n, state: 'default' })) });
        return steps;
    },

    applyStep(step) {
        this.highlightIndex = -1;
        this.foundIndex = -1;

        switch (step.type) {
            case 'traverse':
            case 'highlight':
            case 'compare':
                this.highlightIndex = step.index;
                break;
            case 'found':
                this.foundIndex = step.index;
                break;
            case 'insert':
            case 'reverse':
            case 'done':
                if (step.nodes) {
                    this.nodes = step.nodes;
                }
                break;
            case 'delete':
                this.highlightIndex = step.index;
                break;
        }
        this.draw();
    },

    reset() {
        this.highlightIndex = -1;
        this.foundIndex = -1;
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (this.nodes.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillText('Empty linked list — add some nodes!', w / 2, h / 2);
            return;
        }

        const nodeW = 80;
        const nodeH = 45;
        const gap = 50;
        const totalW = this.nodes.length * (nodeW + gap) - gap;
        let startX = Math.max(30, (w - totalW) / 2);
        const startY = h / 2 - nodeH / 2;

        // Draw HEAD label
        ctx.fillStyle = '#845EC2';
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('HEAD', startX + nodeW / 2, startY - 20);

        for (let i = 0; i < this.nodes.length; i++) {
            const x = startX + i * (nodeW + gap);
            const y = startY;
            const node = this.nodes[i];

            let bgColor = '#fff';
            if (i === this.highlightIndex) bgColor = '#FFE66D';
            if (i === this.foundIndex) bgColor = '#A8E6CF';
            if (node.state === 'new') bgColor = '#4ECDC4';

            // Shadow
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(x + 4, y + 4, nodeW, nodeH);

            // Node box
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, nodeW, nodeH);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, nodeW, nodeH);

            // Divider (data | next)
            ctx.beginPath();
            ctx.moveTo(x + nodeW * 0.7, y);
            ctx.lineTo(x + nodeW * 0.7, y + nodeH);
            ctx.stroke();

            // Value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = "bold 16px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.value, x + nodeW * 0.35, y + nodeH / 2);

            // Next pointer dot
            ctx.fillStyle = i < this.nodes.length - 1 ? '#845EC2' : '#FF6B6B';
            ctx.beginPath();
            ctx.arc(x + nodeW * 0.85, y + nodeH / 2, 5, 0, Math.PI * 2);
            ctx.fill();

            // Arrow to next node
            if (i < this.nodes.length - 1) {
                const arrowStartX = x + nodeW;
                const arrowEndX = x + nodeW + gap;
                const arrowY = y + nodeH / 2;

                ctx.strokeStyle = '#845EC2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(arrowStartX, arrowY);
                ctx.lineTo(arrowEndX, arrowY);
                ctx.stroke();

                // Arrowhead
                ctx.fillStyle = '#845EC2';
                ctx.beginPath();
                ctx.moveTo(arrowEndX, arrowY);
                ctx.lineTo(arrowEndX - 8, arrowY - 5);
                ctx.lineTo(arrowEndX - 8, arrowY + 5);
                ctx.closePath();
                ctx.fill();
            } else {
                // NULL
                ctx.fillStyle = '#FF6B6B';
                ctx.font = "bold 9px 'Space Mono', monospace";
                ctx.fillText('NULL', x + nodeW + 25, y + nodeH / 2);
            }

            // Index label
            ctx.fillStyle = '#888';
            ctx.font = "10px 'Space Mono', monospace";
            ctx.fillText(`[${i}]`, x + nodeW / 2, y + nodeH + 18);
        }
    },

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
    }
};

window.LinkedListViz = LinkedListViz;
