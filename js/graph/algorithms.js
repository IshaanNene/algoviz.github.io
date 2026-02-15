/* ============================================
   PATHFINDING ALGORITHMS + MAZE GENERATORS
   (fixed recursive division + cleaner mazes)
   ============================================ */
const PathAlgorithms = {
    info: {
        'dijkstra': { name: "Dijkstra's Algorithm", desc: "Dijkstra's Algorithm is weighted and guarantees the shortest path!" },
        'astar': { name: 'A* Search', desc: "A* Search uses heuristics to guarantee the shortest path!" },
        'greedy': { name: 'Greedy Best-first Search', desc: "Greedy Best-first Search is not weighted and does not guarantee the shortest path!" },
        'bfs': { name: 'Breadth-first Search', desc: "Breadth-first Search is unweighted and guarantees the shortest path!" },
        'dfs': { name: 'Depth-first Search', desc: "Depth-first Search is unweighted and does not guarantee the shortest path!" },
        'swarm': { name: 'Swarm Algorithm', desc: "Swarm Algorithm is weighted and does not guarantee the shortest path!" },
        'bidirectional': { name: 'Bidirectional BFS', desc: "Bidirectional BFS searches from both start and target simultaneously!" },
    },

    mazes: {
        'recursive-division': 'Recursive Division',
        'recursive-vertical': 'Recursive Division (vertical skew)',
        'recursive-horizontal': 'Recursive Division (horizontal skew)',
        'random': 'Basic Random Maze',
        'stair': 'Simple Stair Pattern',
    },

    /* ==================== PATHFINDING ==================== */

    run(name, grid) {
        // If bomb node exists, run two-phase: Start→Bomb, then Bomb→Target
        if (grid.bombRow !== null) {
            return this._runWithBomb(name, grid);
        }
        return this._runSingle(name, grid);
    },

    _runSingle(name, grid) {
        switch (name) {
            case 'dijkstra': return this._dijkstra(grid);
            case 'astar': return this._astar(grid);
            case 'greedy': return this._greedy(grid);
            case 'bfs': return this._bfs(grid);
            case 'dfs': return this._dfs(grid);
            case 'swarm': return this._swarm(grid);
            case 'bidirectional': return this._bidirectional(grid);
        }
        return { visited: [], path: [] };
    },

    _runWithBomb(name, grid) {
        // Phase 1: Start → Bomb
        const origTarget = { r: grid.targetRow, c: grid.targetCol };
        grid.cells[grid.targetRow][grid.targetCol] = CELL.EMPTY;
        grid.targetRow = grid.bombRow; grid.targetCol = grid.bombCol;
        grid.cells[grid.bombRow][grid.bombCol] = CELL.TARGET;

        const phase1 = this._runSingle(name, grid);

        // Restore bomb, set start to bomb for phase 2
        grid.cells[grid.bombRow][grid.bombCol] = CELL.BOMB;
        grid.targetRow = origTarget.r; grid.targetCol = origTarget.c;
        grid.cells[origTarget.r][origTarget.c] = CELL.TARGET;

        if (phase1.path.length === 0) return phase1; // No route to bomb

        // Phase 2: Bomb → Target
        const origStart = { r: grid.startRow, c: grid.startCol };
        grid.cells[grid.startRow][grid.startCol] = CELL.EMPTY;
        grid.startRow = grid.bombRow; grid.startCol = grid.bombCol;
        grid.cells[grid.bombRow][grid.bombCol] = CELL.START;

        const phase2 = this._runSingle(name, grid);

        // Restore everything
        grid.cells[grid.bombRow][grid.bombCol] = CELL.BOMB;
        grid.startRow = origStart.r; grid.startCol = origStart.c;
        grid.cells[origStart.r][origStart.c] = CELL.START;

        return {
            visited: [...phase1.visited, ...phase2.visited],
            path: [...phase1.path, ...phase2.path]
        };
    },

    /* ---- BFS ---- */
    _bfs(grid) {
        const visited = [], prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        const q = [[grid.startRow, grid.startCol]];
        const seen = new Set([sk]);
        prev[sk] = null;

        while (q.length > 0) {
            const [r, c] = q.shift();
            const k = `${r},${c}`;
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            for (const [nr, nc] of grid.getNeighbors(r, c)) {
                const nk = `${nr},${nc}`;
                if (!seen.has(nk)) {
                    seen.add(nk); prev[nk] = k; q.push([nr, nc]);
                    visited.push({ type: 'visiting', r: nr, c: nc });
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- DFS ---- */
    _dfs(grid) {
        const visited = [], prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        const stack = [[grid.startRow, grid.startCol]];
        const seen = new Set([sk]);
        prev[sk] = null;

        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const k = `${r},${c}`;
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            const neighbors = grid.getNeighbors(r, c);
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const [nr, nc] = neighbors[i];
                const nk = `${nr},${nc}`;
                if (!seen.has(nk)) {
                    seen.add(nk); prev[nk] = k; stack.push([nr, nc]);
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- Dijkstra ---- */
    _dijkstra(grid) {
        const visited = [], dist = {}, prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        dist[sk] = 0; prev[sk] = null;
        // Simple priority queue via sorted array
        const pq = [{ key: sk, d: 0 }];
        const done = new Set();

        while (pq.length > 0) {
            pq.sort((a, b) => a.d - b.d);
            const { key } = pq.shift();
            if (done.has(key)) continue;
            done.add(key);
            const [r, c] = key.split(',').map(Number);
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            for (const [nr, nc] of grid.getNeighbors(r, c)) {
                const nk = `${nr},${nc}`;
                const w = grid.cells[nr][nc] === CELL.WEIGHT ? 10 : 1;
                const alt = dist[key] + w;
                if (dist[nk] === undefined || alt < dist[nk]) {
                    dist[nk] = alt; prev[nk] = key;
                    pq.push({ key: nk, d: alt });
                    visited.push({ type: 'visiting', r: nr, c: nc });
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- A* ---- */
    _astar(grid) {
        const h = (r, c) => Math.abs(r - grid.targetRow) + Math.abs(c - grid.targetCol);
        const visited = [], gScore = {}, prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        gScore[sk] = 0; prev[sk] = null;
        const open = [{ key: sk, f: h(grid.startRow, grid.startCol) }];
        const closed = new Set();

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            const { key } = open.shift();
            if (closed.has(key)) continue;
            closed.add(key);
            const [r, c] = key.split(',').map(Number);
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            for (const [nr, nc] of grid.getNeighbors(r, c)) {
                const nk = `${nr},${nc}`;
                const w = grid.cells[nr][nc] === CELL.WEIGHT ? 10 : 1;
                const tg = gScore[key] + w;
                if (gScore[nk] === undefined || tg < gScore[nk]) {
                    gScore[nk] = tg; prev[nk] = key;
                    open.push({ key: nk, f: tg + h(nr, nc) });
                    visited.push({ type: 'visiting', r: nr, c: nc });
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- Greedy Best-first ---- */
    _greedy(grid) {
        const h = (r, c) => Math.abs(r - grid.targetRow) + Math.abs(c - grid.targetCol);
        const visited = [], prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        prev[sk] = null;
        const open = [{ key: sk, f: h(grid.startRow, grid.startCol) }];
        const closed = new Set();

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            const { key } = open.shift();
            if (closed.has(key)) continue;
            closed.add(key);
            const [r, c] = key.split(',').map(Number);
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            for (const [nr, nc] of grid.getNeighbors(r, c)) {
                const nk = `${nr},${nc}`;
                if (!closed.has(nk) && prev[nk] === undefined) {
                    prev[nk] = key;
                    open.push({ key: nk, f: h(nr, nc) });
                    visited.push({ type: 'visiting', r: nr, c: nc });
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- Swarm ---- */
    _swarm(grid) {
        const h1 = (r, c) => Math.abs(r - grid.targetRow) + Math.abs(c - grid.targetCol);
        const h2 = (r, c) => Math.sqrt((r - grid.targetRow) ** 2 + (c - grid.targetCol) ** 2);
        const visited = [], gScore = {}, prev = {};
        const sk = `${grid.startRow},${grid.startCol}`;
        gScore[sk] = 0; prev[sk] = null;
        const open = [{ key: sk, f: 0 }];
        const closed = new Set();

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            const { key } = open.shift();
            if (closed.has(key)) continue;
            closed.add(key);
            const [r, c] = key.split(',').map(Number);
            visited.push({ type: 'visit', r, c });
            if (r === grid.targetRow && c === grid.targetCol)
                return { visited, path: this._tracePath(prev, grid) };

            for (const [nr, nc] of grid.getNeighbors(r, c)) {
                const nk = `${nr},${nc}`;
                const w = grid.cells[nr][nc] === CELL.WEIGHT ? 10 : 1;
                const tg = gScore[key] + w;
                if (gScore[nk] === undefined || tg < gScore[nk]) {
                    gScore[nk] = tg; prev[nk] = key;
                    open.push({ key: nk, f: tg + h1(nr, nc) * 1.5 + h2(nr, nc) * 0.5 });
                    visited.push({ type: 'visiting', r: nr, c: nc });
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- Bidirectional BFS ---- */
    _bidirectional(grid) {
        const visited = [];
        const prevA = new Map(), prevB = new Map();
        const sk = `${grid.startRow},${grid.startCol}`;
        const tk = `${grid.targetRow},${grid.targetCol}`;
        prevA.set(sk, null); prevB.set(tk, null);
        const qA = [[grid.startRow, grid.startCol]];
        const qB = [[grid.targetRow, grid.targetCol]];

        while (qA.length > 0 || qB.length > 0) {
            if (qA.length > 0) {
                const [r, c] = qA.shift(); const k = `${r},${c}`;
                visited.push({ type: 'visit', r, c });
                if (prevB.has(k)) return { visited, path: this._biTracePath(prevA, prevB, k) };
                for (const [nr, nc] of grid.getNeighbors(r, c)) {
                    const nk = `${nr},${nc}`;
                    if (!prevA.has(nk)) { prevA.set(nk, k); qA.push([nr, nc]); visited.push({ type: 'visiting', r: nr, c: nc }); }
                }
            }
            if (qB.length > 0) {
                const [r, c] = qB.shift(); const k = `${r},${c}`;
                visited.push({ type: 'visit', r, c });
                if (prevA.has(k)) return { visited, path: this._biTracePath(prevA, prevB, k) };
                for (const [nr, nc] of grid.getNeighbors(r, c)) {
                    const nk = `${nr},${nc}`;
                    if (!prevB.has(nk)) { prevB.set(nk, k); qB.push([nr, nc]); visited.push({ type: 'visiting', r: nr, c: nc }); }
                }
            }
        }
        return { visited, path: [] };
    },

    /* ---- Path traceback ---- */
    _tracePath(prev, grid) {
        const path = [];
        let key = `${grid.targetRow},${grid.targetCol}`;
        while (key !== null) {
            const [r, c] = key.split(',').map(Number);
            path.unshift({ type: 'path', r, c });
            key = prev[key] !== undefined ? prev[key] : null;
        }
        return path;
    },

    _biTracePath(prevA, prevB, meetKey) {
        const path = [];
        let k = meetKey;
        while (k !== null && k !== undefined) {
            const [r, c] = k.split(',').map(Number);
            path.unshift({ type: 'path', r, c });
            k = prevA.get(k);
        }
        k = prevB.get(meetKey);
        while (k !== null && k !== undefined) {
            const [r, c] = k.split(',').map(Number);
            path.push({ type: 'path', r, c });
            k = prevB.get(k);
        }
        return path;
    },

    /* ==================== MAZE GENERATORS ==================== */

    generateMaze(name, grid) {
        grid.clearBoard();
        switch (name) {
            case 'recursive-division': return this._recursiveDivision(grid, 'both');
            case 'recursive-vertical': return this._recursiveDivision(grid, 'vertical');
            case 'recursive-horizontal': return this._recursiveDivision(grid, 'horizontal');
            case 'random': return this._randomMaze(grid);
            case 'stair': return this._stairMaze(grid);
        }
        return [];
    },

    /* ---- Recursive Division (clean corridors, no outer border) ---- */
    _recursiveDivision(grid, skew) {
        const steps = [];
        const sr = grid.startRow, sc = grid.startCol;
        const tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);

        const divide = (rMin, rMax, cMin, cMax) => {
            const h = rMax - rMin;  // height span
            const w = cMax - cMin;  // width span
            if (h < 2 || w < 2) return;   // too small to divide

            let horizontal;
            if (skew === 'vertical') horizontal = Math.random() < 0.15;
            else if (skew === 'horizontal') horizontal = Math.random() < 0.85;
            else if (h > w) horizontal = true;
            else if (w > h) horizontal = false;
            else horizontal = Math.random() < 0.5;

            if (horizontal) {
                // Pick wall row (must leave at least 1 row above and below)
                const wallRow = rMin + 1 + Math.floor(Math.random() * (h - 1));
                // Pick gap in the wall
                const gapCol = cMin + Math.floor(Math.random() * (w + 1));

                for (let c = cMin; c <= cMax; c++) {
                    if (c === gapCol || _skip(wallRow, c)) continue;
                    steps.push({ type: 'wall', r: wallRow, c });
                }
                divide(rMin, wallRow - 1, cMin, cMax);
                divide(wallRow + 1, rMax, cMin, cMax);
            } else {
                const wallCol = cMin + 1 + Math.floor(Math.random() * (w - 1));
                const gapRow = rMin + Math.floor(Math.random() * (h + 1));

                for (let r = rMin; r <= rMax; r++) {
                    if (r === gapRow || _skip(r, wallCol)) continue;
                    steps.push({ type: 'wall', r, c: wallCol });
                }
                divide(rMin, rMax, cMin, wallCol - 1);
                divide(rMin, rMax, wallCol + 1, cMax);
            }
        };

        divide(0, grid.rows - 1, 0, grid.cols - 1);
        return steps;
    },

    /* ---- Random Maze ---- */
    _randomMaze(grid) {
        const steps = [];
        const sr = grid.startRow, sc = grid.startCol;
        const tr = grid.targetRow, tc = grid.targetCol;
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (r === sr && c === sc) continue;
                if (r === tr && c === tc) continue;
                if (Math.random() < 0.28) steps.push({ type: 'wall', r, c });
            }
        }
        return steps;
    },

    /* ---- Stair Pattern ---- */
    _stairMaze(grid) {
        const steps = [];
        const sr = grid.startRow, sc = grid.startCol;
        const tr = grid.targetRow, tc = grid.targetCol;
        const _isSpecial = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);

        const spacing = 4;
        let goingDown = true;

        for (let col = spacing; col < grid.cols - spacing; col += spacing) {
            if (goingDown) {
                for (let r = 0; r < grid.rows - spacing; r++) {
                    if (!_isSpecial(r, col)) steps.push({ type: 'wall', r, c: col });
                }
            } else {
                for (let r = spacing; r < grid.rows; r++) {
                    if (!_isSpecial(r, col)) steps.push({ type: 'wall', r, c: col });
                }
            }
            goingDown = !goingDown;
        }
        return steps;
    }
};

window.PathAlgorithms = PathAlgorithms;
