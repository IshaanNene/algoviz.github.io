/* ============================================
   GRID EDITOR — Wall drawing & node placement
   ============================================ */
const GridEditor = {
    canvas: null, grid: null, renderer: null,
    isDrawing: false, drawMode: 'wall', // 'wall' | 'erase'
    draggingStart: false, draggingTarget: false,
    onUpdate: null,

    init(canvas, grid, renderer, onUpdate) {
        this.canvas = canvas; this.grid = grid;
        this.renderer = renderer; this.onUpdate = onUpdate;
        this.isDrawing = false; this.draggingStart = false; this.draggingTarget = false;

        this._onDown = (e) => this._handleDown(e);
        this._onMove = (e) => this._handleMove(e);
        this._onUp = () => this._handleUp();
        canvas.addEventListener('mousedown', this._onDown);
        canvas.addEventListener('mousemove', this._onMove);
        canvas.addEventListener('mouseup', this._onUp);
        canvas.addEventListener('mouseleave', this._onUp);
    },

    _cellAt(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const cellSize = this.renderer.cellSize;
        const c = Math.floor(x / cellSize), r = Math.floor(y / cellSize);
        return { r, c };
    },

    _handleDown(e) {
        const { r, c } = this._cellAt(e);
        if (!this.grid.isInBounds(r, c)) return;

        const cell = this.grid.cells[r][c];
        if (cell === CELL.START) { this.draggingStart = true; return; }
        if (cell === CELL.TARGET) { this.draggingTarget = true; return; }

        this.isDrawing = true;
        this.drawMode = cell === CELL.WALL ? 'erase' : 'wall';
        if (this.drawMode === 'wall') this.grid.setWall(r, c);
        else this.grid.clearCell(r, c);
        this._update();
    },

    _handleMove(e) {
        const { r, c } = this._cellAt(e);
        if (!this.grid.isInBounds(r, c)) return;

        if (this.draggingStart) {
            this.grid.moveStart(r, c); this._update(); return;
        }
        if (this.draggingTarget) {
            this.grid.moveTarget(r, c); this._update(); return;
        }
        if (this.isDrawing) {
            if (this.drawMode === 'wall') this.grid.setWall(r, c);
            else this.grid.clearCell(r, c);
            this._update();
        }
    },

    _handleUp() {
        this.isDrawing = false; this.draggingStart = false; this.draggingTarget = false;
    },

    _update() { if (this.onUpdate) this.onUpdate(); },

    destroy() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this._onDown);
            this.canvas.removeEventListener('mousemove', this._onMove);
            this.canvas.removeEventListener('mouseup', this._onUp);
            this.canvas.removeEventListener('mouseleave', this._onUp);
        }
        this.canvas = null; this.grid = null; this.renderer = null;
    }
};
window.GridEditor = GridEditor;
