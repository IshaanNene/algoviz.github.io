/* ============================================
   STRING ALGORITHMS VISUALIZATION
   (Naive, KMP, Rabin-Karp pattern matching)
   ============================================ */
const StringViz = {
    canvas: null, ctx: null,
    text: '', pattern: '',
    currentAlgo: 'naive',
    highlightTextIndices: new Set(),
    highlightPatternIndices: new Set(),
    matchIndices: new Set(),
    mismatchIndex: -1,
    patternOffset: 0,
    foundPositions: [],
    failureTable: [],
    hashInfo: null,

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.text = ''; this.pattern = '';
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

    _clearHighlights() {
        this.highlightTextIndices = new Set();
        this.highlightPatternIndices = new Set();
        this.matchIndices = new Set();
        this.mismatchIndex = -1;
        this.patternOffset = 0;
        this.foundPositions = [];
        this.failureTable = [];
        this.hashInfo = null;
    },

    /* ---- Algorithms ---- */
    info: {
        'naive': { name: 'Naive Search', time: 'O(n×m)', space: 'O(1)', desc: 'Checks every position in text for pattern match.' },
        'kmp': { name: 'KMP Algorithm', time: 'O(n+m)', space: 'O(m)', desc: 'Uses failure function to skip redundant comparisons.' },
        'rabin-karp': { name: 'Rabin-Karp', time: 'O(n+m) avg', space: 'O(1)', desc: 'Uses rolling hash to quickly eliminate non-matching positions.' }
    },

    run(algo, text, pattern) {
        this.text = text; this.pattern = pattern;
        switch (algo) {
            case 'naive': return this._naive(text, pattern);
            case 'kmp': return this._kmp(text, pattern);
            case 'rabin-karp': return this._rabinKarp(text, pattern);
            default: return [];
        }
    },

    _naive(text, pattern) {
        const steps = [];
        const n = text.length, m = pattern.length;
        if (m === 0 || n < m) return steps;

        for (let i = 0; i <= n - m; i++) {
            steps.push({ type: 'shift-pattern', offset: i });
            let matched = true;
            for (let j = 0; j < m; j++) {
                steps.push({ type: 'compare-char', textIdx: i + j, patIdx: j, offset: i });
                if (text[i + j] === pattern[j]) {
                    steps.push({ type: 'match-char', textIdx: i + j, patIdx: j, offset: i });
                } else {
                    steps.push({ type: 'mismatch', textIdx: i + j, patIdx: j, offset: i });
                    matched = false;
                    break;
                }
            }
            if (matched) {
                steps.push({ type: 'pattern-found', offset: i, length: m });
            }
        }
        steps.push({ type: 'done' });
        return steps;
    },

    _computeFailure(pattern) {
        const m = pattern.length;
        const fail = new Array(m).fill(0);
        let k = 0;
        for (let i = 1; i < m; i++) {
            while (k > 0 && pattern[k] !== pattern[i]) k = fail[k - 1];
            if (pattern[k] === pattern[i]) k++;
            fail[i] = k;
        }
        return fail;
    },

    _kmp(text, pattern) {
        const steps = [];
        const n = text.length, m = pattern.length;
        if (m === 0 || n < m) return steps;

        const fail = this._computeFailure(pattern);
        steps.push({ type: 'build-table', table: [...fail] });

        let j = 0;
        for (let i = 0; i < n; i++) {
            steps.push({ type: 'shift-pattern', offset: i - j });
            steps.push({ type: 'compare-char', textIdx: i, patIdx: j, offset: i - j });

            if (text[i] === pattern[j]) {
                steps.push({ type: 'match-char', textIdx: i, patIdx: j, offset: i - j });
                j++;
                if (j === m) {
                    steps.push({ type: 'pattern-found', offset: i - m + 1, length: m });
                    j = fail[j - 1];
                }
            } else {
                steps.push({ type: 'mismatch', textIdx: i, patIdx: j, offset: i - j });
                if (j > 0) {
                    j = fail[j - 1];
                    i--; // re-check this character
                }
            }
        }
        steps.push({ type: 'done' });
        return steps;
    },

    _rabinKarp(text, pattern) {
        const steps = [];
        const n = text.length, m = pattern.length;
        if (m === 0 || n < m) return steps;

        const BASE = 256, MOD = 101;
        let patHash = 0, textHash = 0, h = 1;

        for (let i = 0; i < m - 1; i++) h = (h * BASE) % MOD;
        for (let i = 0; i < m; i++) {
            patHash = (BASE * patHash + pattern.charCodeAt(i)) % MOD;
            textHash = (BASE * textHash + text.charCodeAt(i)) % MOD;
        }

        steps.push({ type: 'hash-compute', patHash, textHash, offset: 0 });

        for (let i = 0; i <= n - m; i++) {
            steps.push({ type: 'shift-pattern', offset: i });
            steps.push({ type: 'hash-compare', patHash, textHash, offset: i });

            if (patHash === textHash) {
                // Verify character by character
                let match = true;
                for (let j = 0; j < m; j++) {
                    steps.push({ type: 'compare-char', textIdx: i + j, patIdx: j, offset: i });
                    if (text[i + j] === pattern[j]) {
                        steps.push({ type: 'match-char', textIdx: i + j, patIdx: j, offset: i });
                    } else {
                        steps.push({ type: 'mismatch', textIdx: i + j, patIdx: j, offset: i });
                        match = false;
                        break;
                    }
                }
                if (match) {
                    steps.push({ type: 'pattern-found', offset: i, length: m });
                }
            }

            // Rolling hash
            if (i < n - m) {
                textHash = (BASE * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % MOD;
                if (textHash < 0) textHash += MOD;
            }
        }
        steps.push({ type: 'done' });
        return steps;
    },

    applyStep(step) {
        // Keep foundPositions and failureTable across steps
        const prevFound = [...this.foundPositions];
        const prevTable = [...this.failureTable];
        this.highlightTextIndices = new Set();
        this.highlightPatternIndices = new Set();
        this.matchIndices = new Set();
        this.mismatchIndex = -1;
        this.hashInfo = null;
        this.foundPositions = prevFound;
        this.failureTable = prevTable;

        switch (step.type) {
            case 'shift-pattern':
                this.patternOffset = step.offset;
                break;
            case 'compare-char':
                this.patternOffset = step.offset;
                this.highlightTextIndices.add(step.textIdx);
                this.highlightPatternIndices.add(step.patIdx);
                break;
            case 'match-char':
                this.patternOffset = step.offset;
                this.matchIndices.add(step.textIdx);
                this.highlightPatternIndices.add(step.patIdx);
                break;
            case 'mismatch':
                this.patternOffset = step.offset;
                this.mismatchIndex = step.textIdx;
                this.highlightPatternIndices.add(step.patIdx);
                break;
            case 'pattern-found':
                this.patternOffset = step.offset;
                this.foundPositions.push(step.offset);
                for (let i = step.offset; i < step.offset + step.length; i++) {
                    this.matchIndices.add(i);
                }
                break;
            case 'build-table':
                this.failureTable = step.table;
                break;
            case 'hash-compute':
            case 'hash-compare':
                this.patternOffset = step.offset;
                this.hashInfo = { patHash: step.patHash, textHash: step.textHash };
                break;
            case 'done':
                break;
        }
        this.draw();
    },

    reset() {
        this._clearHighlights();
    },
    resetHighlights() {
        this._clearHighlights(); this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (!this.text || !this.pattern) {
            ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Enter text and pattern, then select an algorithm to visualize!', w / 2, h / 2);
            return;
        }

        const charW = Math.min(28, (w - 80) / Math.max(this.text.length, 1));
        const charH = 32;
        const startX = Math.max(20, (w - this.text.length * charW) / 2);
        const textY = 60;
        const patternY = textY + charH + 20;

        // Label
        ctx.fillStyle = '#90A4AE'; ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('TEXT', startX, textY - 4);

        // Draw text row
        for (let i = 0; i < this.text.length; i++) {
            const x = startX + i * charW;
            let fill = '#FFFFFF';
            if (this.foundPositions.some(pos => i >= pos && i < pos + this.pattern.length)) fill = '#A8E6CF';
            if (this.matchIndices.has(i)) fill = '#4ECDC4';
            if (this.highlightTextIndices.has(i)) fill = '#FFE66D';
            if (i === this.mismatchIndex) fill = '#FF8B94';

            ctx.fillStyle = fill;
            ctx.fillRect(x, textY, charW, charH);
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2;
            ctx.strokeRect(x, textY, charW, charH);

            ctx.fillStyle = '#1A1A1A'; ctx.font = `bold ${Math.min(14, charW * 0.6)}px 'Space Mono', monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.text[i], x + charW / 2, textY + charH / 2);

            // Index
            ctx.fillStyle = '#90A4AE'; ctx.font = `${Math.min(9, charW * 0.35)}px 'Space Mono', monospace`;
            ctx.fillText(i, x + charW / 2, textY + charH + 10);
        }

        // Draw pattern row (offset by patternOffset)
        ctx.fillStyle = '#90A4AE'; ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('PATTERN', startX, patternY + charH + 30);

        for (let j = 0; j < this.pattern.length; j++) {
            const x = startX + (this.patternOffset + j) * charW;
            let fill = '#FFFFFF';
            if (this.highlightPatternIndices.has(j)) fill = '#FFE66D';
            const textIdx = this.patternOffset + j;
            if (this.matchIndices.has(textIdx) && this.highlightPatternIndices.has(j)) fill = '#4ECDC4';
            if (textIdx === this.mismatchIndex) fill = '#FF8B94';

            ctx.fillStyle = fill;
            ctx.fillRect(x, patternY + charH + 4, charW, charH);
            ctx.strokeStyle = '#845EC2'; ctx.lineWidth = 2.5;
            ctx.strokeRect(x, patternY + charH + 4, charW, charH);

            ctx.fillStyle = '#1A1A1A'; ctx.font = `bold ${Math.min(14, charW * 0.6)}px 'Space Mono', monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.pattern[j], x + charW / 2, patternY + charH + 4 + charH / 2);
        }

        // Draw failure table for KMP
        if (this.failureTable.length > 0) {
            const tableY = patternY + charH * 2 + 50;
            ctx.fillStyle = '#845EC2'; ctx.font = "bold 10px 'Space Mono', monospace";
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('FAILURE TABLE', startX, tableY - 14);

            for (let i = 0; i < this.failureTable.length; i++) {
                const x = startX + i * charW;
                // Pattern char
                ctx.fillStyle = '#E8D5F5';
                ctx.fillRect(x, tableY, charW, charH * 0.8);
                ctx.strokeStyle = '#845EC2'; ctx.lineWidth = 1.5;
                ctx.strokeRect(x, tableY, charW, charH * 0.8);
                ctx.fillStyle = '#1A1A1A'; ctx.font = `bold ${Math.min(11, charW * 0.5)}px 'Space Mono', monospace`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(this.pattern[i], x + charW / 2, tableY + charH * 0.4);

                // Failure value
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x, tableY + charH * 0.8, charW, charH * 0.8);
                ctx.strokeStyle = '#845EC2'; ctx.lineWidth = 1.5;
                ctx.strokeRect(x, tableY + charH * 0.8, charW, charH * 0.8);
                ctx.fillStyle = '#845EC2'; ctx.font = `bold ${Math.min(11, charW * 0.5)}px 'Space Mono', monospace`;
                ctx.fillText(this.failureTable[i], x + charW / 2, tableY + charH * 1.2);
            }
        }

        // Draw hash info for Rabin-Karp
        if (this.hashInfo) {
            const hashY = patternY + charH * 2 + 50;
            ctx.fillStyle = '#845EC2'; ctx.font = "bold 11px 'Space Mono', monospace";
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            const match = this.hashInfo.patHash === this.hashInfo.textHash;
            ctx.fillText(`Pattern Hash: ${this.hashInfo.patHash}  |  Window Hash: ${this.hashInfo.textHash}  |  ${match ? '✓ MATCH — verify chars' : '✗ NO MATCH'}`, startX, hashY);
        }

        // Found positions summary
        if (this.foundPositions.length > 0) {
            const summaryY = h - 30;
            ctx.fillStyle = '#4ECDC4'; ctx.font = "bold 11px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`Found at position(s): ${this.foundPositions.join(', ')}`, w / 2, summaryY);
        }
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null; this.ctx = null;
    },

    clear() {
        this.text = ''; this.pattern = '';
        this._clearHighlights(); this.draw();
    }
};
window.StringViz = StringViz;
