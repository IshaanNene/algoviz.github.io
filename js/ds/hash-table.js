/* ============================================
   HASH TABLE VISUALIZATION (Chaining)
   ============================================ */
const HashTableViz = {
    canvas: null, ctx: null,
    buckets: [],       // Array of arrays (chains)
    numBuckets: 8,
    size: 0,
    highlightBucket: -1,
    highlightChainIdx: -1,
    foundBucket: -1,
    foundChainIdx: -1,
    hashingKey: null,

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.buckets = Array.from({ length: this.numBuckets }, () => []);
        this.size = 0;
        this._clearHighlights();
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

    _hash(key) {
        let h = 0;
        const s = String(key);
        for (let i = 0; i < s.length; i++) {
            h = (h * 31 + s.charCodeAt(i)) | 0;
        }
        return Math.abs(h) % this.numBuckets;
    },

    _clearHighlights() {
        this.highlightBucket = -1; this.highlightChainIdx = -1;
        this.foundBucket = -1; this.foundChainIdx = -1;
        this.hashingKey = null;
    },

    /* ---- Operations (generate steps) ---- */

    insert(key, value) {
        const steps = [];
        const bucketIdx = this._hash(key);
        steps.push({ type: 'hash', key, bucketIdx });
        steps.push({ type: 'probe-bucket', bucketIdx });

        // Check if key already exists in chain
        const chain = this.buckets[bucketIdx];
        for (let i = 0; i < chain.length; i++) {
            steps.push({ type: 'chain-traverse', bucketIdx, chainIdx: i });
            if (chain[i].key === key) {
                // Update existing
                steps.push({ type: 'update', bucketIdx, chainIdx: i, key, value });
                steps.push({ type: 'done', action: 'update' });
                return steps;
            }
        }
        steps.push({ type: 'insert-done', bucketIdx, key, value });
        steps.push({ type: 'done', action: 'insert' });
        return steps;
    },

    get(key) {
        const steps = [];
        const bucketIdx = this._hash(key);
        steps.push({ type: 'hash', key, bucketIdx });
        steps.push({ type: 'probe-bucket', bucketIdx });

        const chain = this.buckets[bucketIdx];
        for (let i = 0; i < chain.length; i++) {
            steps.push({ type: 'chain-traverse', bucketIdx, chainIdx: i });
            if (chain[i].key === key) {
                steps.push({ type: 'found', bucketIdx, chainIdx: i });
                return steps;
            }
        }
        steps.push({ type: 'not-found', key });
        return steps;
    },

    remove(key) {
        const steps = [];
        const bucketIdx = this._hash(key);
        steps.push({ type: 'hash', key, bucketIdx });
        steps.push({ type: 'probe-bucket', bucketIdx });

        const chain = this.buckets[bucketIdx];
        for (let i = 0; i < chain.length; i++) {
            steps.push({ type: 'chain-traverse', bucketIdx, chainIdx: i });
            if (chain[i].key === key) {
                steps.push({ type: 'delete-done', bucketIdx, chainIdx: i });
                steps.push({ type: 'done', action: 'delete' });
                return steps;
            }
        }
        steps.push({ type: 'not-found', key });
        return steps;
    },

    applyStep(step) {
        this._clearHighlights();
        switch (step.type) {
            case 'hash':
                this.hashingKey = step.key;
                this.highlightBucket = step.bucketIdx;
                break;
            case 'probe-bucket':
                this.highlightBucket = step.bucketIdx;
                break;
            case 'chain-traverse':
                this.highlightBucket = step.bucketIdx;
                this.highlightChainIdx = step.chainIdx;
                break;
            case 'found':
                this.foundBucket = step.bucketIdx;
                this.foundChainIdx = step.chainIdx;
                break;
            case 'not-found':
                break;
            case 'update':
                this.buckets[step.bucketIdx][step.chainIdx].value = step.value;
                this.foundBucket = step.bucketIdx;
                this.foundChainIdx = step.chainIdx;
                break;
            case 'insert-done':
                this.buckets[step.bucketIdx].push({ key: step.key, value: step.value });
                this.size++;
                this.foundBucket = step.bucketIdx;
                this.foundChainIdx = this.buckets[step.bucketIdx].length - 1;
                break;
            case 'delete-done':
                this.buckets[step.bucketIdx].splice(step.chainIdx, 1);
                this.size--;
                this.highlightBucket = step.bucketIdx;
                break;
            case 'done':
                break;
        }
        this.draw();
    },

    reset() { this._clearHighlights(); },
    resetHighlights() { this._clearHighlights(); this.draw(); },

    buildSample() {
        this.buckets = Array.from({ length: this.numBuckets }, () => []);
        this.size = 0;
        const samples = [
            ['apple', 5], ['banana', 12], ['cherry', 3], ['date', 8],
            ['elderberry', 15], ['fig', 1], ['grape', 9], ['honeydew', 7]
        ];
        samples.forEach(([k, v]) => {
            const idx = this._hash(k);
            this.buckets[idx].push({ key: k, value: v });
            this.size++;
        });
        this._clearHighlights();
        this.draw();
    },

    clear() {
        this.buckets = Array.from({ length: this.numBuckets }, () => []);
        this.size = 0;
        this._clearHighlights();
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const bucketW = 70, bucketH = 36, gap = 6;
        const nodeW = 90, nodeH = 36, nodeGap = 12;
        const startX = 40, startY = 30;
        const totalH = this.numBuckets * (bucketH + gap);

        // If empty
        if (this.size === 0 && this.highlightBucket === -1) {
            ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Empty hash table — insert some key-value pairs!', w / 2, h / 2);
            // Still draw the empty buckets
        }

        // Draw load factor
        const loadFactor = (this.size / this.numBuckets).toFixed(2);
        ctx.fillStyle = '#90A4AE'; ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(`Size: ${this.size}  |  Buckets: ${this.numBuckets}  |  Load Factor: ${loadFactor}`, startX, startY - 22);

        for (let i = 0; i < this.numBuckets; i++) {
            const y = startY + i * (bucketH + gap);

            // Bucket rectangle
            let bucketFill = '#FFFFFF';
            if (i === this.highlightBucket) bucketFill = '#FFE66D';
            if (i === this.foundBucket) bucketFill = '#4ECDC4';

            ctx.fillStyle = bucketFill;
            ctx.fillRect(startX, y, bucketW, bucketH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5;
            ctx.strokeRect(startX, y, bucketW, bucketH);

            // Bucket index
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 12px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`[${i}]`, startX + bucketW / 2, y + bucketH / 2);

            // Draw chain
            const chain = this.buckets[i];
            let cx = startX + bucketW;

            if (chain.length > 0) {
                // Arrow from bucket to first node
                const arrowStartX = cx;
                const arrowEndX = cx + nodeGap;
                const arrowY = y + bucketH / 2;
                ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(arrowStartX, arrowY); ctx.lineTo(arrowEndX, arrowY); ctx.stroke();
                ctx.fillStyle = '#1A1A1A'; ctx.beginPath();
                ctx.moveTo(arrowEndX, arrowY); ctx.lineTo(arrowEndX - 6, arrowY - 4); ctx.lineTo(arrowEndX - 6, arrowY + 4); ctx.closePath(); ctx.fill();
            }

            for (let j = 0; j < chain.length; j++) {
                const nx = cx + nodeGap + j * (nodeW + nodeGap);
                const ny = y;
                const entry = chain[j];

                // Node fill
                let nodeFill = '#FFFFFF';
                if (i === this.highlightBucket && j === this.highlightChainIdx) nodeFill = '#FFE66D';
                if (i === this.foundBucket && j === this.foundChainIdx) nodeFill = '#4ECDC4';

                ctx.fillStyle = nodeFill;
                ctx.fillRect(nx, ny, nodeW, nodeH);
                ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2;
                ctx.strokeRect(nx, ny, nodeW, nodeH);

                // Key:Value text
                const label = `${entry.key}:${entry.value}`;
                const maxLen = 10;
                const display = label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;
                ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 10px 'Space Mono', monospace";
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(display, nx + nodeW / 2, ny + nodeH / 2);

                // Arrow to next node
                if (j < chain.length - 1) {
                    const ax = nx + nodeW, ay = ny + nodeH / 2;
                    const bx = nx + nodeW + nodeGap, by = ay;
                    ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
                    ctx.fillStyle = '#1A1A1A'; ctx.beginPath();
                    ctx.moveTo(bx, by); ctx.lineTo(bx - 6, by - 4); ctx.lineTo(bx - 6, by + 4); ctx.closePath(); ctx.fill();
                } else {
                    // NULL terminator
                    ctx.fillStyle = '#90A4AE'; ctx.font = "bold 9px 'Space Mono', monospace";
                    ctx.textAlign = 'left';
                    ctx.fillText('∅', nx + nodeW + 5, ny + nodeH / 2);
                }
            }

            if (chain.length === 0) {
                // Show null for empty bucket
                ctx.fillStyle = '#90A4AE'; ctx.font = "bold 9px 'Space Mono', monospace";
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText('∅', cx + 8, y + bucketH / 2);
            }
        }

        // Show hashing key info
        if (this.hashingKey !== null) {
            const infoY = startY + totalH + 10;
            ctx.fillStyle = '#845EC2'; ctx.font = "bold 12px 'Space Mono', monospace";
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(`hash("${this.hashingKey}") → bucket [${this.highlightBucket}]`, startX, infoY);
        }
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null; this.ctx = null;
    }
};
window.HashTableViz = HashTableViz;
