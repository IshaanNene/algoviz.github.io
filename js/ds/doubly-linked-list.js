/* ============================================
   DOUBLY LINKED LIST VISUALIZATION
   ============================================ */
const DoublyLinkedListViz = {
    canvas: null, ctx: null, head: null, tail: null, size: 0, highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.head = null; this.tail = null; this.size = 0; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _node(val) { return { val, prev: null, next: null }; },

    insertHead(val) {
        const s = [], n = this._node(val);
        s.push({ type: 'create', val, pos: 'head' });
        if (!this.head) { this.head = this.tail = n; }
        else { n.next = this.head; this.head.prev = n; this.head = n; }
        this.size++; s.push({ type: 'done' }); this.draw(); return s;
    },
    insertTail(val) {
        const s = [], n = this._node(val);
        s.push({ type: 'create', val, pos: 'tail' });
        if (!this.tail) { this.head = this.tail = n; }
        else { n.prev = this.tail; this.tail.next = n; this.tail = n; }
        this.size++; s.push({ type: 'done' }); this.draw(); return s;
    },
    deleteHead() {
        const s = [];
        if (!this.head) { s.push({ type: 'empty' }); return s; }
        s.push({ type: 'delete', val: this.head.val, pos: 'head' });
        if (this.head === this.tail) { this.head = this.tail = null; }
        else { this.head = this.head.next; this.head.prev = null; }
        this.size--; s.push({ type: 'done' }); this.draw(); return s;
    },
    deleteTail() {
        const s = [];
        if (!this.tail) { s.push({ type: 'empty' }); return s; }
        s.push({ type: 'delete', val: this.tail.val, pos: 'tail' });
        if (this.head === this.tail) { this.head = this.tail = null; }
        else { this.tail = this.tail.prev; this.tail.next = null; }
        this.size--; s.push({ type: 'done' }); this.draw(); return s;
    },
    search(val) {
        const s = []; let n = this.head, i = 0;
        while (n) {
            s.push({ type: 'visit', index: i, val: n.val });
            if (n.val === val) { s.push({ type: 'found', index: i }); return s; }
            n = n.next; i++;
        }
        s.push({ type: 'not-found' }); return s;
    },
    reverse() {
        const s = []; let curr = this.head;
        while (curr) {
            s.push({ type: 'visit', val: curr.val });
            [curr.prev, curr.next] = [curr.next, curr.prev];
            s.push({ type: 'swap', val: curr.val });
            curr = curr.prev;
        }
        [this.head, this.tail] = [this.tail, this.head];
        s.push({ type: 'done' }); this.draw(); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit') this.highlights[step.index !== undefined ? step.index : -1] = '#845EC2';
        if (step.type === 'create') this.highlights[-1] = '#4ECDC4';
        if (step.type === 'delete') this.highlights[-1] = '#FF6B6B';
        if (step.type === 'found') this.highlights[step.index] = '#4ECDC4';
        if (step.type === 'swap') this.highlights[-1] = '#FFA552';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.clear(); [10, 20, 30, 40, 50].forEach(v => this.insertTail(v)); this.draw(); },
    clear() { this.head = null; this.tail = null; this.size = 0; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (!this.head) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Doubly Linked List is empty.', w / 2, h / 2); return; }

        const nodeW = 60, nodeH = 36, gap = 30;
        const totalW = this.size * (nodeW + gap) - gap;
        let x = Math.max(20, (w - totalW) / 2), y = h / 2 - nodeH / 2;
        let n = this.head, i = 0;

        while (n) {
            const color = this.highlights[i] || '#1A1A1A';
            // Node box
            this.ctx.fillStyle = color; this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.roundRect(x, y, nodeW, nodeH, 6); this.ctx.fill(); this.ctx.stroke();
            // Value
            this.ctx.fillStyle = '#fff'; this.ctx.font = 'bold 14px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(n.val, x + nodeW / 2, y + nodeH / 2);

            // Forward arrow
            if (n.next) {
                const ax = x + nodeW, ay = y + nodeH / 2 - 5;
                this.ctx.strokeStyle = '#4ECDC4'; this.ctx.lineWidth = 2;
                this.ctx.beginPath(); this.ctx.moveTo(ax, ay); this.ctx.lineTo(ax + gap, ay); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.moveTo(ax + gap - 6, ay - 4); this.ctx.lineTo(ax + gap, ay); this.ctx.lineTo(ax + gap - 6, ay + 4); this.ctx.stroke();
            }
            // Backward arrow
            if (n.prev) {
                const ax = x, ay = y + nodeH / 2 + 5;
                this.ctx.strokeStyle = '#FF6B6B'; this.ctx.lineWidth = 2;
                this.ctx.beginPath(); this.ctx.moveTo(ax, ay); this.ctx.lineTo(ax - gap, ay); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.moveTo(ax - gap + 6, ay - 4); this.ctx.lineTo(ax - gap, ay); this.ctx.lineTo(ax - gap + 6, ay + 4); this.ctx.stroke();
            }

            x += nodeW + gap; n = n.next; i++;
        }

        // Head/Tail labels
        const startX = Math.max(20, (w - totalW) / 2);
        this.ctx.fillStyle = '#4ECDC4'; this.ctx.font = 'bold 11px Inter'; this.ctx.textAlign = 'center';
        this.ctx.fillText('HEAD', startX + nodeW / 2, y - 10);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillText('TAIL', startX + (this.size - 1) * (nodeW + gap) + nodeW / 2, y - 10);
    }
};
window.DoublyLinkedListViz = DoublyLinkedListViz;
