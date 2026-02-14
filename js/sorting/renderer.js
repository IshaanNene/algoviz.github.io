/* ============================================
   SORTING RENDERER
   Canvas-based bar chart with color-coded states
   ============================================ */

const SortingRenderer = {
    canvas: null,
    ctx: null,
    array: [],
    states: {},  // index -> 'compare'|'swap'|'sorted'|'overwrite'|'partition'|'bucket'
    maxValue: 100,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.states = {};
        this._resize();
        window.addEventListener('resize', () => this._resize());
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

    setArray(arr) {
        this.array = [...arr];
        this.maxValue = Math.max(...arr, 1);
        this.states = {};
        this.draw();
    },

    /** Apply a step event to update the visual state */
    applyStep(step) {
        // Clear previous highlights except sorted
        const newStates = {};
        for (const [k, v] of Object.entries(this.states)) {
            if (v === 'sorted') newStates[k] = v;
        }
        this.states = newStates;

        // Update array from step if available
        if (step.array) {
            this.array = [...step.array];
        }

        // Apply step-specific highlighting
        switch (step.type) {
            case 'compare':
                step.indices.forEach(i => { this.states[i] = 'compare'; });
                break;
            case 'swap':
                step.indices.forEach(i => { this.states[i] = 'swap'; });
                break;
            case 'overwrite':
                step.indices.forEach(i => { this.states[i] = 'overwrite'; });
                break;
            case 'sorted':
                step.indices.forEach(i => { this.states[i] = 'sorted'; });
                break;
            case 'partition':
                step.indices.forEach(i => { this.states[i] = 'partition'; });
                break;
            case 'bucket':
                step.indices.forEach(i => { this.states[i] = 'bucket'; });
                break;
            case 'merge-split':
                // Highlight the merge range
                for (let i = step.indices[0]; i <= step.indices[2]; i++) {
                    if (!this.states[i]) this.states[i] = 'compare';
                }
                break;
        }

        this.draw();
    },

    reset(arr) {
        this.states = {};
        if (arr) {
            this.array = [...arr];
            this.maxValue = Math.max(...arr, 1);
        }
        this.draw();
    },

    /** Color map for states */
    _getColor(state) {
        switch (state) {
            case 'compare': return '#845EC2';   // purple
            case 'swap': return '#FF6B6B';      // red
            case 'overwrite': return '#FFA552'; // orange
            case 'sorted': return '#4ECDC4';    // teal
            case 'partition': return '#FFE66D'; // yellow
            case 'bucket': return '#FF8B94';    // pink
            default: return '#1A1A1A';          // default dark
        }
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        const n = this.array.length;
        if (n === 0) {
            ctx.clearRect(0, 0, w, h);
            return;
        }

        const padding = 20;
        const barAreaW = w - padding * 2;
        const barAreaH = h - padding * 2;
        const gap = Math.max(1, Math.floor(barAreaW / n * 0.15));
        const barW = Math.max(1, (barAreaW - gap * (n - 1)) / n);

        ctx.clearRect(0, 0, w, h);

        // Draw bars
        for (let i = 0; i < n; i++) {
            const x = padding + i * (barW + gap);
            const barH = (this.array[i] / this.maxValue) * barAreaH;
            const y = h - padding - barH;

            const state = this.states[i];
            const color = this._getColor(state);

            // Bar fill
            ctx.fillStyle = color;
            ctx.fillRect(x, y, barW, barH);

            // Bar border (brutalist style)
            if (barW > 3) {
                ctx.strokeStyle = '#1A1A1A';
                ctx.lineWidth = barW > 8 ? 2 : 1;
                ctx.strokeRect(x, y, barW, barH);
            }

            // Value text if bars are wide enough
            if (barW > 20 && n <= 50) {
                ctx.fillStyle = state === 'sorted' ? '#1A1A1A' : '#fff';
                ctx.font = `bold ${Math.min(12, barW * 0.5)}px 'Space Mono', monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(this.array[i], x + barW / 2, y - 5);
            }
        }

        // Bottom index labels if few enough bars
        if (n <= 30 && barW > 15) {
            ctx.fillStyle = '#888';
            ctx.font = `9px 'Space Mono', monospace`;
            ctx.textAlign = 'center';
            for (let i = 0; i < n; i++) {
                const x = padding + i * (barW + gap) + barW / 2;
                ctx.fillText(i, x, h - 5);
            }
        }
    },

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.array = [];
        this.states = {};
    }
};

window.SortingRenderer = SortingRenderer;
