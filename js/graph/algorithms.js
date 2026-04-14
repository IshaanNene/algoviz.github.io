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
        'bellman-ford': { name: 'Bellman-Ford', desc: "Relaxes all edges repeatedly. Handles negative weights and guarantees shortest path!" },
        'ida-star': { name: 'IDA*', desc: "Iterative Deepening A* combines depth-first with A*'s heuristic, using minimal memory!" },
        'bidirectional-astar': { name: 'Bidirectional A*', desc: "Searches from both start and target using A* heuristic simultaneously!" },
        'best-first-euclidean': { name: 'Best-First (Euclidean)', desc: "Greedy best-first using Euclidean distance. Creates smoother, circular search patterns!" },
        'jps': { name: 'Jump Point Search', desc: "Optimizes A* on grids by jumping over empty space, dramatically reducing explored nodes!" },
    },

    mazes: {
        'recursive-division': 'Recursive Division',
        'recursive-vertical': 'Recursive Division (vertical skew)',
        'recursive-horizontal': 'Recursive Division (horizontal skew)',
        'random': 'Basic Random Maze',
        'stair': 'Simple Stair Pattern',
        'dfs-backtracker': 'DFS Backtracker',
        'prims': "Randomized Prim's",
        'kruskals': "Randomized Kruskal's",
        'ellers': "Eller's Algorithm",
        'spiral': 'Spiral Pattern',
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
            case 'bellman-ford': return this._bellmanFord(grid);
            case 'ida-star': return this._idaStar(grid);
            case 'bidirectional-astar': return this._bidirectionalAStar(grid);
            case 'best-first-euclidean': return this._bestFirstEuclidean(grid);
            case 'jps': return this._jps(grid);
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
            case 'dfs-backtracker': return this._dfsMaze(grid);
            case 'prims': return this._primsMaze(grid);
            case 'kruskals': return this._kruskalsMaze(grid);
            case 'ellers': return this._ellersMaze(grid);
            case 'spiral': return this._spiralMaze(grid);
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
    },

    /* ---- DFS Backtracker Maze ---- */
    _dfsMaze(grid) {
        const steps = [], R = grid.rows, C = grid.cols;
        const sr = grid.startRow, sc = grid.startCol, tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);
        const passage = Array.from({ length: R }, () => new Array(C).fill(false));
        const sr2 = Math.max(1, sr % 2 === 0 ? sr + 1 : sr), sc2 = Math.max(1, sc % 2 === 0 ? sc + 1 : sc);
        if (sr2 < R && sc2 < C) passage[sr2][sc2] = true;
        const stack = [[sr2, sc2]];
        while (stack.length > 0) {
            const [r, c] = stack[stack.length - 1];
            const nb = [];
            for (const [dr, dc] of [[-2,0],[2,0],[0,-2],[0,2]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 1 && nr < R - 1 && nc >= 1 && nc < C - 1 && !passage[nr][nc]) nb.push([nr, nc, r + dr/2, c + dc/2]);
            }
            if (nb.length > 0) {
                const [nr, nc, wr, wc] = nb[Math.floor(Math.random() * nb.length)];
                passage[nr][nc] = true; passage[wr][wc] = true; stack.push([nr, nc]);
            } else stack.pop();
        }
        passage[sr][sc] = true; passage[tr][tc] = true;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!passage[r][c] && !_skip(r, c)) steps.push({ type: 'wall', r, c });
        return steps;
    },

    /* ---- Randomized Prim's Maze ---- */
    _primsMaze(grid) {
        const steps = [], R = grid.rows, C = grid.cols;
        const sr = grid.startRow, sc = grid.startCol, tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);
        const passage = Array.from({ length: R }, () => new Array(C).fill(false));
        const sr2 = Math.max(1, sr % 2 === 0 ? sr + 1 : sr), sc2 = Math.max(1, sc % 2 === 0 ? sc + 1 : sc);
        passage[sr2][sc2] = true;
        const frontiers = [];
        const addFrontiers = (r, c) => {
            for (const [dr, dc] of [[-2,0],[2,0],[0,-2],[0,2]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 1 && nr < R - 1 && nc >= 1 && nc < C - 1 && !passage[nr][nc]) frontiers.push([nr, nc, r + dr/2, c + dc/2]);
            }
        };
        addFrontiers(sr2, sc2);
        while (frontiers.length > 0) {
            const idx = Math.floor(Math.random() * frontiers.length);
            const [nr, nc, wr, wc] = frontiers[idx]; frontiers.splice(idx, 1);
            if (!passage[nr][nc]) { passage[nr][nc] = true; passage[wr][wc] = true; addFrontiers(nr, nc); }
        }
        passage[sr][sc] = true; passage[tr][tc] = true;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!passage[r][c] && !_skip(r, c)) steps.push({ type: 'wall', r, c });
        return steps;
    },

    /* ---- Randomized Kruskal's Maze ---- */
    _kruskalsMaze(grid) {
        const steps = [], R = grid.rows, C = grid.cols;
        const sr = grid.startRow, sc = grid.startCol, tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);
        const passage = Array.from({ length: R }, () => new Array(C).fill(false));
        const parent = {};
        const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
        const union = (a, b) => { parent[find(a)] = find(b); };
        for (let r = 1; r < R - 1; r += 2) for (let c = 1; c < C - 1; c += 2) { parent[`${r},${c}`] = `${r},${c}`; passage[r][c] = true; }
        const walls = [];
        for (let r = 1; r < R - 1; r += 2) for (let c = 1; c < C - 1; c += 2) {
            if (r + 2 < R) walls.push([r, c, r + 2, c, r + 1, c]);
            if (c + 2 < C) walls.push([r, c, r, c + 2, r, c + 1]);
        }
        for (let i = walls.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [walls[i], walls[j]] = [walls[j], walls[i]]; }
        for (const [r1, c1, r2, c2, wr, wc] of walls) {
            if (find(`${r1},${c1}`) !== find(`${r2},${c2}`)) { union(`${r1},${c1}`, `${r2},${c2}`); passage[wr][wc] = true; }
        }
        passage[sr][sc] = true; passage[tr][tc] = true;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!passage[r][c] && !_skip(r, c)) steps.push({ type: 'wall', r, c });
        return steps;
    },

    /* ---- Eller's Algorithm Maze ---- */
    _ellersMaze(grid) {
        const steps = [], R = grid.rows, C = grid.cols;
        const sr = grid.startRow, sc = grid.startCol, tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);
        const passage = Array.from({ length: R }, () => new Array(C).fill(false));
        const cellCols = []; for (let c = 1; c < C - 1; c += 2) cellCols.push(c);
        const cc = cellCols.length; if (cc === 0) return steps;
        let nextSet = 1, rowSets = new Array(cc).fill(0).map(() => nextSet++);
        for (let ri = 0; ri < Math.floor(R / 2); ri++) {
            const r = ri * 2 + 1; if (r >= R) break;
            for (let ci = 0; ci < cc; ci++) passage[r][cellCols[ci]] = true;
            const isLast = r + 2 >= R;
            for (let ci = 0; ci < cc - 1; ci++) {
                if (rowSets[ci] !== rowSets[ci + 1] && (isLast || Math.random() < 0.5)) {
                    passage[r][cellCols[ci] + 1] = true;
                    const old = rowSets[ci + 1], nw = rowSets[ci];
                    for (let k = 0; k < cc; k++) if (rowSets[k] === old) rowSets[k] = nw;
                }
            }
            if (!isLast) {
                const setMembers = {};
                for (let ci = 0; ci < cc; ci++) { if (!setMembers[rowSets[ci]]) setMembers[rowSets[ci]] = []; setMembers[rowSets[ci]].push(ci); }
                const newSets = new Array(cc).fill(0).map(() => nextSet++);
                for (const s in setMembers) {
                    const members = setMembers[s].sort(() => Math.random() - 0.5);
                    const numDown = Math.max(1, Math.floor(Math.random() * members.length) + 1);
                    for (let i = 0; i < Math.min(numDown, members.length); i++) {
                        const ci = members[i], c = cellCols[ci];
                        passage[r + 1][c] = true; newSets[ci] = parseInt(s);
                    }
                }
                rowSets = newSets;
            }
        }
        passage[sr][sc] = true; passage[tr][tc] = true;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!passage[r][c] && !_skip(r, c)) steps.push({ type: 'wall', r, c });
        return steps;
    },

    /* ---- Spiral Pattern ---- */
    _spiralMaze(grid) {
        const steps = [], R = grid.rows, C = grid.cols;
        const sr = grid.startRow, sc = grid.startCol, tr = grid.targetRow, tc = grid.targetCol;
        const _skip = (r, c) => (r === sr && c === sc) || (r === tr && c === tc);
        let top = 0, bottom = R - 1, left = 0, right = C - 1, layer = 0;
        while (top < bottom && left < right) {
            const gap = 2 + layer * 2;
            for (let c = left; c <= right; c++) if (c % gap !== 0 && !_skip(top, c)) steps.push({ type: 'wall', r: top, c });
            for (let r = top + 1; r <= bottom; r++) if (r % gap !== 0 && !_skip(r, right)) steps.push({ type: 'wall', r, c: right });
            for (let c = right - 1; c >= left; c--) if (c % gap !== 1 && !_skip(bottom, c)) steps.push({ type: 'wall', r: bottom, c });
            for (let r = bottom - 1; r > top; r--) if (r % gap !== 1 && !_skip(r, left)) steps.push({ type: 'wall', r, c: left });
            top += 2; bottom -= 2; left += 2; right -= 2; layer++;
        }
        return steps;
    }
};

window.PathAlgorithms = PathAlgorithms;
