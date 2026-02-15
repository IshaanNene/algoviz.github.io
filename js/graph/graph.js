/* ============================================
   PATHFINDING GRID
   2D cell grid for pathfinding visualization
   ============================================ */

const CELL = { EMPTY: 0, WALL: 1, START: 2, TARGET: 3, WEIGHT: 4, BOMB: 5 };
const VIS = { NONE: 0, VISITED: 1, VISITING: 2, PATH: 3 };

class PathGrid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.vis = [];
        this.startRow = Math.floor(rows / 2);
        this.startCol = Math.floor(cols / 4);
        this.targetRow = Math.floor(rows / 2);
        this.targetCol = Math.floor(3 * cols / 4);
        this.bombRow = null;
        this.bombCol = null;
        this._init();
    }

    _init() {
        this.cells = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
        this.vis = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
        this.cells[this.startRow][this.startCol] = CELL.START;
        this.cells[this.targetRow][this.targetCol] = CELL.TARGET;
        if (this.bombRow !== null) this.cells[this.bombRow][this.bombCol] = CELL.BOMB;
    }

    resize(rows, cols) {
        this.rows = rows; this.cols = cols;
        this.startRow = Math.min(this.startRow, rows - 1);
        this.startCol = Math.min(this.startCol, cols - 1);
        this.targetRow = Math.min(this.targetRow, rows - 1);
        this.targetCol = Math.min(this.targetCol, cols - 1);
        this._init();
    }

    isInBounds(r, c) { return r >= 0 && r < this.rows && c >= 0 && c < this.cols; }
    isWalkable(r, c) { return this.isInBounds(r, c) && this.cells[r][c] !== CELL.WALL; }

    setWall(r, c) {
        if (!this.isInBounds(r, c)) return;
        if (this.cells[r][c] === CELL.START || this.cells[r][c] === CELL.TARGET || this.cells[r][c] === CELL.BOMB) return;
        this.cells[r][c] = CELL.WALL;
    }

    clearCell(r, c) {
        if (!this.isInBounds(r, c)) return;
        if (this.cells[r][c] === CELL.START || this.cells[r][c] === CELL.TARGET || this.cells[r][c] === CELL.BOMB) return;
        this.cells[r][c] = CELL.EMPTY;
    }

    toggleWall(r, c) {
        if (!this.isInBounds(r, c)) return;
        if (this.cells[r][c] === CELL.START || this.cells[r][c] === CELL.TARGET || this.cells[r][c] === CELL.BOMB) return;
        this.cells[r][c] = this.cells[r][c] === CELL.WALL ? CELL.EMPTY : CELL.WALL;
    }

    moveStart(r, c) {
        if (!this.isInBounds(r, c) || this.cells[r][c] === CELL.TARGET || this.cells[r][c] === CELL.BOMB) return;
        this.cells[this.startRow][this.startCol] = CELL.EMPTY;
        this.startRow = r; this.startCol = c;
        this.cells[r][c] = CELL.START;
    }

    moveTarget(r, c) {
        if (!this.isInBounds(r, c) || this.cells[r][c] === CELL.START || this.cells[r][c] === CELL.BOMB) return;
        this.cells[this.targetRow][this.targetCol] = CELL.EMPTY;
        this.targetRow = r; this.targetCol = c;
        this.cells[r][c] = CELL.TARGET;
    }

    clearWalls() {
        for (let r = 0; r < this.rows; r++)
            for (let c = 0; c < this.cols; c++)
                if (this.cells[r][c] === CELL.WALL || this.cells[r][c] === CELL.WEIGHT)
                    this.cells[r][c] = CELL.EMPTY;
    }

    clearPath() {
        for (let r = 0; r < this.rows; r++)
            for (let c = 0; c < this.cols; c++)
                this.vis[r][c] = VIS.NONE;
    }

    clearBoard() { this.clearWalls(); this.clearPath(); }

    addBomb() {
        if (this.bombRow !== null) return;
        // Place bomb at center-ish, avoiding start/target
        let r = Math.floor(this.rows / 2), c = Math.floor(this.cols / 2);
        while ((r === this.startRow && c === this.startCol) || (r === this.targetRow && c === this.targetCol) || this.cells[r][c] === CELL.WALL) {
            c++; if (c >= this.cols) { c = 0; r = (r + 1) % this.rows; }
        }
        this.bombRow = r; this.bombCol = c;
        this.cells[r][c] = CELL.BOMB;
    }

    removeBomb() {
        if (this.bombRow === null) return;
        this.cells[this.bombRow][this.bombCol] = CELL.EMPTY;
        this.bombRow = null; this.bombCol = null;
    }

    moveBomb(r, c) {
        if (!this.isInBounds(r, c) || this.cells[r][c] === CELL.START || this.cells[r][c] === CELL.TARGET) return;
        this.cells[this.bombRow][this.bombCol] = CELL.EMPTY;
        this.bombRow = r; this.bombCol = c;
        this.cells[r][c] = CELL.BOMB;
    }

    getNeighbors(r, c) {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const n = [];
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (this.isInBounds(nr, nc) && this.cells[nr][nc] !== CELL.WALL)
                n.push([nr, nc]);
        }
        return n;
    }
}

window.CELL = CELL;
window.VIS = VIS;
window.PathGrid = PathGrid;
