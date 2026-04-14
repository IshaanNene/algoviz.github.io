/* ============================================
   BLOOM FILTER VISUALIZATION
   ============================================ */
const BloomFilterViz = {
    canvas: null, ctx: null, bits: [], size: 32, hashCount: 3, insertedItems: [], highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.size = 32; this.hashCount = 3; this.bits = new Array(this.size).fill(0); this.insertedItems = []; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    _hash(str, seed) {
        let h = seed;
        for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; h = (h * 2654435761) | 0; }
        return Math.abs(h) % this.size;
    },
    _getHashes(key) {
        const hashes = [];
        for (let i = 0; i < this.hashCount; i++) hashes.push(this._hash(String(key), (i + 1) * 31));
        return hashes;
    },

    insert(key) {
        const s = [], hashes = this._getHashes(key);
        s.push({ type: 'hash', key, hashes });
        for (const h of hashes) { this.bits[h] = 1; s.push({ type: 'set-bit', index: h }); }
        this.insertedItems.push(String(key));
        s.push({ type: 'done' }); this.draw(); return s;
    },

    check(key) {
        const s = [], hashes = this._getHashes(key);
        s.push({ type: 'hash', key, hashes });
        let found = true;
        for (const h of hashes) {
            s.push({ type: 'check-bit', index: h, value: this.bits[h] });
            if (!this.bits[h]) found = false;
        }
        if (found) s.push({ type: 'probably-in', key });
        else s.push({ type: 'definitely-not', key });
        return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'hash') { for (const h of step.hashes) this.highlights[h] = '#845EC2'; }
        if (step.type === 'set-bit') this.highlights[step.index] = '#4ECDC4';
        if (step.type === 'check-bit') this.highlights[step.index] = step.value ? '#4ECDC4' : '#FF6B6B';
        if (step.type === 'probably-in') {}
        if (step.type === 'definitely-not') {}
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },
    buildSample() { this.clear(); ['apple', 'banana', 'cherry', 'date', 'elderberry'].forEach(w => this.insert(w)); this.draw(); },
    clear() { this.bits = new Array(this.size).fill(0); this.insertedItems = []; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);

        // Title
        this.ctx.fillStyle = '#888'; this.ctx.font = 'bold 12px Inter'; this.ctx.textAlign = 'center';
        this.ctx.fillText(`Bloom Filter — ${this.size} bits, ${this.hashCount} hash functions`, w / 2, 20);

        // Bit array
        const cellS = Math.min(30, (w - 40) / this.size);
        const startX = (w - this.size * cellS) / 2, byArY = 50;

        for (let i = 0; i < this.size; i++) {
            const x = startX + i * cellS;
            let color = this.bits[i] ? '#4ECDC4' : '#2A2A2A';
            if (this.highlights[i]) color = this.highlights[i];
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x + 1, byArY, cellS - 2, cellS - 2);
            this.ctx.strokeStyle = '#444'; this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, byArY, cellS - 2, cellS - 2);
            this.ctx.fillStyle = this.bits[i] ? '#000' : '#666';
            this.ctx.font = `${Math.max(8, cellS * 0.4)}px Inter`; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.bits[i], x + cellS / 2, byArY + (cellS - 2) / 2);
        }

        // Index labels
        this.ctx.fillStyle = '#666'; this.ctx.font = '8px Inter';
        for (let i = 0; i < this.size; i += 4) {
            this.ctx.fillText(i, startX + i * cellS + cellS / 2, byArY + cellS + 10);
        }

        // Stats
        const filledBits = this.bits.filter(b => b).length;
        const fillRate = (filledBits / this.size * 100).toFixed(1);
        const fpRate = Math.pow(filledBits / this.size, this.hashCount) * 100;
        const statsY = byArY + cellS + 30;
        this.ctx.fillStyle = '#aaa'; this.ctx.font = '12px Inter'; this.ctx.textAlign = 'center';
        this.ctx.fillText(`Bits set: ${filledBits}/${this.size} (${fillRate}%)  |  Est. false positive rate: ${fpRate.toFixed(1)}%`, w / 2, statsY);

        // Inserted items
        if (this.insertedItems.length > 0) {
            this.ctx.fillStyle = '#888'; this.ctx.font = '11px Inter';
            this.ctx.fillText('Inserted: ' + this.insertedItems.join(', '), w / 2, statsY + 22);
        }
    }
};
window.BloomFilterViz = BloomFilterViz;
