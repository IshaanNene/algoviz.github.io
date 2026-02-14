/* ============================================
   GRID RENDERER — Pathfinding grid canvas
   Uses the neobrutalist color palette
   ============================================ */
const GridRenderer = {
    canvas: null, ctx: null, grid: null,
    cellSize: 25, resizeHandler: null,

    /* Neobrutalist palette — matches sorting/DS visualizations */
    colors: {
        bg: '#FFFFFF',
        gridFine: 'rgba(100, 181, 246, 0.25)',
        gridMaj: 'rgba(66, 165, 245, 0.45)',
        wall: '#1A1A1A',
        start: '#4ECDC4',   // --teal
        target: '#FF6B6B',   // --red
        visited: '#A8E6CF',   // --green  (same as linked list "visited")
        visiting: '#845EC2',   // --purple (same as linked list "found")
        path: '#FFE66D',   // --yellow (same as sorting "compare")
        weight: '#FFA552',   // --orange
    },

    init(canvas, grid) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.grid = grid;
        this._resize();
        this.resizeHandler = () => this._resize();
        window.addEventListener('resize', this.resizeHandler);
    },

    _resize() {
        if (!this.canvas || !this.grid) return;
        const p = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const w = p.clientWidth, h = p.clientHeight;

        this.cellSize = Math.floor(Math.min(w / this.grid.cols, h / this.grid.rows));
        if (this.cellSize < 10) this.cellSize = 10;

        const newCols = Math.floor(w / this.cellSize);
        const newRows = Math.floor(h / this.cellSize);
        if (newRows !== this.grid.rows || newCols !== this.grid.cols) {
            this.grid.resize(Math.max(newRows, 5), Math.max(newCols, 10));
        }

        this.canvas.width = w * dpr; this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw();
    },

    applyStep(step) {
        if (!this.grid) return;
        switch (step.type) {
            case 'visit': this.grid.vis[step.r][step.c] = VIS.VISITED; break;
            case 'visiting': this.grid.vis[step.r][step.c] = VIS.VISITING; break;
            case 'path': this.grid.vis[step.r][step.c] = VIS.PATH; break;
            case 'wall': this.grid.setWall(step.r, step.c); break;
            case 'clear-cell': this.grid.clearCell(step.r, step.c); break;
        }
        this.draw();
    },

    reset() { if (this.grid) this.grid.clearPath(); this.draw(); },
    resetHighlights() { this.reset(); },

    _cellColor(r, c) {
        const cell = this.grid.cells[r][c];
        const vis = this.grid.vis[r][c];
        if (cell === CELL.START) return this.colors.start;
        if (cell === CELL.TARGET) return this.colors.target;
        if (cell === CELL.WALL) return this.colors.wall;
        if (cell === CELL.WEIGHT) return this.colors.weight;
        if (vis === VIS.PATH) return this.colors.path;
        if (vis === VIS.VISITED) return this.colors.visited;
        if (vis === VIS.VISITING) return this.colors.visiting;
        return null; // transparent/bg
    },

    draw() {
        if (!this.ctx || !this.grid) return;
        const ctx = this.ctx, g = this.grid, cs = this.cellSize;
        const pw = g.cols * cs, ph = g.rows * cs;
        const cw = this.canvas.width / (window.devicePixelRatio || 1);
        const ch = this.canvas.height / (window.devicePixelRatio || 1);

        // White background
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, cw, ch);

        // Draw filled cells
        for (let r = 0; r < g.rows; r++) {
            for (let c = 0; c < g.cols; c++) {
                const color = this._cellColor(r, c);
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(c * cs, r * cs, cs, cs);

                    // Add neobrutalist inner shadow to walls
                    if (g.cells[r][c] === CELL.WALL) {
                        ctx.fillStyle = 'rgba(255,255,255,0.08)';
                        ctx.fillRect(c * cs, r * cs, cs, 2);
                        ctx.fillRect(c * cs, r * cs, 2, cs);
                    }
                }
            }
        }

        // Fine grid lines
        ctx.strokeStyle = this.colors.gridFine;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let c = 0; c <= g.cols; c++) { ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, ph); }
        for (let r = 0; r <= g.rows; r++) { ctx.moveTo(0, r * cs); ctx.lineTo(pw, r * cs); }
        ctx.stroke();

        // Major grid lines (every 5th)
        ctx.strokeStyle = this.colors.gridMaj;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = 0; c <= g.cols; c += 5) { ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, ph); }
        for (let r = 0; r <= g.rows; r += 5) { ctx.moveTo(0, r * cs); ctx.lineTo(pw, r * cs); }
        ctx.stroke();

        // Start icon — bold chevron
        this._drawStartIcon(g.startRow, g.startCol, cs);
        // Target icon — bullseye
        this._drawTargetIcon(g.targetRow, g.targetCol, cs);

        // Subtle prompt
        const hasVis = g.vis.some(row => row.some(v => v !== 0));
        const hasWalls = g.cells.some(row => row.some(v => v === CELL.WALL));
        if (!hasVis && !hasWalls) {
            ctx.fillStyle = 'rgba(100, 130, 160, 0.45)';
            ctx.font = "bold 13px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Pick an algorithm and visualize it!', pw / 2, 18);
        }
    },

    _drawStartIcon(r, c, cs) {
        const ctx = this.ctx;
        const cx = c * cs + cs / 2, cy = r * cs + cs / 2;
        const s = cs * 0.32;
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.5, cy - s);
        ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx - s * 0.5, cy + s);
        ctx.closePath();
        ctx.fill();
    },

    _drawTargetIcon(r, c, cs) {
        const ctx = this.ctx;
        const cx = c * cs + cs / 2, cy = r * cs + cs / 2;
        const s = cs * 0.35;
        ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath(); ctx.arc(cx, cy, s * 0.4, 0, Math.PI * 2); ctx.fill();
    },

    destroy() {
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
        this.canvas = null; this.ctx = null; this.grid = null;
    }
};
window.GridRenderer = GridRenderer;
