/* ============================================
   GRAPH ALGORITHMS
   BFS, DFS, Prim, Kruskal, Dijkstra, 
   Bellman-Ford, A*
   ============================================ */

const GraphAlgorithms = {
    info: {
        'bfs': { name: 'BFS', time: 'O(V+E)', desc: 'Breadth-first search explores level by level using a queue.' },
        'dfs': { name: 'DFS', time: 'O(V+E)', desc: 'Depth-first search explores as deep as possible before backtracking.' },
        'dijkstra': { name: 'Dijkstra', time: 'O((V+E)logV)', desc: 'Finds shortest path from source to all vertices using a priority queue.' },
        'bellman-ford': { name: 'Bellman-Ford', time: 'O(VE)', desc: 'Finds shortest path, handles negative weights, detects negative cycles.' },
        'astar': { name: 'A*', time: 'O(E)', desc: 'Informed search using heuristic to find shortest path to target.' },
        'prim': { name: "Prim's MST", time: 'O((V+E)logV)', desc: 'Grows MST from a source by always picking the minimum weight edge.' },
        'kruskal': { name: "Kruskal's MST", time: 'O(ElogE)', desc: 'Builds MST by sorting edges and adding them if they don\'t form a cycle.' },
    },

    run(name, graph, source, target) {
        switch (name) {
            case 'bfs': return this._bfs(graph, source);
            case 'dfs': return this._dfs(graph, source);
            case 'dijkstra': return this._dijkstra(graph, source, target);
            case 'bellman-ford': return this._bellmanFord(graph, source, target);
            case 'astar': return this._astar(graph, source, target);
            case 'prim': return this._prim(graph, source);
            case 'kruskal': return this._kruskal(graph);
            default: return [];
        }
    },

    _bfs(graph, source) {
        const steps = [];
        const visited = new Set();
        const queue = [source];
        visited.add(source);
        steps.push({ type: 'source', node: source });
        steps.push({ type: 'visit', node: source });

        while (queue.length > 0) {
            const node = queue.shift();
            steps.push({ type: 'visited', node });

            const neighbors = graph.getNeighbors(node);
            for (const { node: neighbor } of neighbors) {
                steps.push({ type: 'consider', from: node, to: neighbor });
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    steps.push({ type: 'enqueue', node: neighbor });
                    steps.push({ type: 'relax', from: node, to: neighbor });
                }
            }
        }
        return steps;
    },

    _dfs(graph, source) {
        const steps = [];
        const visited = new Set();
        steps.push({ type: 'source', node: source });

        const dfsRecurse = (node) => {
            visited.add(node);
            steps.push({ type: 'visit', node });

            const neighbors = graph.getNeighbors(node);
            for (const { node: neighbor } of neighbors) {
                steps.push({ type: 'consider', from: node, to: neighbor });
                if (!visited.has(neighbor)) {
                    steps.push({ type: 'relax', from: node, to: neighbor });
                    dfsRecurse(neighbor);
                }
            }
            steps.push({ type: 'visited', node });
        };

        dfsRecurse(source);
        return steps;
    },

    _dijkstra(graph, source, target) {
        const steps = [];
        const dist = {};
        const prev = {};
        const visited = new Set();
        const pq = []; // Simple array-based priority queue

        for (const [id] of graph.nodes) {
            dist[id] = Infinity;
            prev[id] = null;
        }
        dist[source] = 0;
        pq.push({ node: source, dist: 0 });

        steps.push({ type: 'source', node: source });
        steps.push({ type: 'distance', node: source, distance: 0 });

        while (pq.length > 0) {
            // Extract min
            pq.sort((a, b) => a.dist - b.dist);
            const { node: u } = pq.shift();

            if (visited.has(u)) continue;
            visited.add(u);
            steps.push({ type: 'visit', node: u });

            if (target !== undefined && u === target) {
                // Reconstruct path
                this._reconstructPath(steps, prev, source, target);
                return steps;
            }

            const neighbors = graph.getNeighbors(u);
            for (const { node: v, weight } of neighbors) {
                if (visited.has(v)) continue;
                const alt = dist[u] + weight;
                steps.push({ type: 'consider', from: u, to: v });
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    pq.push({ node: v, dist: alt });
                    steps.push({ type: 'relax', from: u, to: v, distance: alt });
                    steps.push({ type: 'distance', node: v, distance: alt });
                }
            }
            steps.push({ type: 'visited', node: u });
        }

        if (target !== undefined) {
            this._reconstructPath(steps, prev, source, target);
        }
        return steps;
    },

    _bellmanFord(graph, source, target) {
        const steps = [];
        const dist = {};
        const prev = {};

        for (const [id] of graph.nodes) {
            dist[id] = Infinity;
            prev[id] = null;
        }
        dist[source] = 0;
        steps.push({ type: 'source', node: source });
        steps.push({ type: 'distance', node: source, distance: 0 });

        const nodeCount = graph.nodes.size;

        for (let i = 0; i < nodeCount - 1; i++) {
            for (const edge of graph.edges) {
                // Process both directions for undirected
                const pairs = graph.directed
                    ? [[edge.from, edge.to]]
                    : [[edge.from, edge.to], [edge.to, edge.from]];

                for (const [u, v] of pairs) {
                    if (dist[u] === Infinity) continue;
                    steps.push({ type: 'consider', from: u, to: v });
                    const alt = dist[u] + edge.weight;
                    if (alt < dist[v]) {
                        dist[v] = alt;
                        prev[v] = u;
                        steps.push({ type: 'relax', from: u, to: v, distance: alt });
                        steps.push({ type: 'distance', node: v, distance: alt });
                        steps.push({ type: 'visit', node: v });
                    }
                }
            }
        }

        // Mark all as visited
        for (const [id] of graph.nodes) {
            steps.push({ type: 'visited', node: id });
        }

        if (target !== undefined) {
            this._reconstructPath(steps, prev, source, target);
        }
        return steps;
    },

    _astar(graph, source, target) {
        const steps = [];
        if (target === undefined) return steps;

        const targetNode = graph.nodes.get(target);
        if (!targetNode) return steps;

        // Heuristic: Euclidean distance
        const heuristic = (nodeId) => {
            const n = graph.nodes.get(nodeId);
            if (!n) return 0;
            const dx = n.x - targetNode.x;
            const dy = n.y - targetNode.y;
            return Math.sqrt(dx * dx + dy * dy) / 50; // Scale down
        };

        const gScore = {};
        const fScore = {};
        const prev = {};
        const openSet = new Set();
        const closedSet = new Set();

        for (const [id] of graph.nodes) {
            gScore[id] = Infinity;
            fScore[id] = Infinity;
            prev[id] = null;
        }
        gScore[source] = 0;
        fScore[source] = heuristic(source);
        openSet.add(source);

        steps.push({ type: 'source', node: source });
        steps.push({ type: 'target', node: target });
        steps.push({ type: 'distance', node: source, distance: 0 });

        while (openSet.size > 0) {
            // Find node in openSet with lowest fScore
            let current = null;
            let minF = Infinity;
            for (const n of openSet) {
                if (fScore[n] < minF) {
                    minF = fScore[n];
                    current = n;
                }
            }

            if (current === target) {
                this._reconstructPath(steps, prev, source, target);
                return steps;
            }

            openSet.delete(current);
            closedSet.add(current);
            steps.push({ type: 'visit', node: current });

            const neighbors = graph.getNeighbors(current);
            for (const { node: neighbor, weight } of neighbors) {
                if (closedSet.has(neighbor)) continue;
                steps.push({ type: 'consider', from: current, to: neighbor });

                const tentativeG = gScore[current] + weight;
                if (tentativeG < gScore[neighbor]) {
                    prev[neighbor] = current;
                    gScore[neighbor] = tentativeG;
                    fScore[neighbor] = tentativeG + heuristic(neighbor);
                    steps.push({ type: 'relax', from: current, to: neighbor, distance: Math.round(tentativeG) });
                    steps.push({ type: 'distance', node: neighbor, distance: Math.round(tentativeG) });
                    openSet.add(neighbor);
                    steps.push({ type: 'enqueue', node: neighbor });
                }
            }
            steps.push({ type: 'visited', node: current });
        }

        return steps;
    },

    _prim(graph, source) {
        const steps = [];
        const inMST = new Set();
        const edges = [];     // priority queue: [weight, from, to]
        let totalWeight = 0;

        inMST.add(source);
        steps.push({ type: 'source', node: source });
        steps.push({ type: 'visit', node: source });

        // Add edges from source
        for (const { node: neighbor, weight } of graph.getNeighbors(source)) {
            edges.push([weight, source, neighbor]);
        }

        while (edges.length > 0 && inMST.size < graph.nodes.size) {
            edges.sort((a, b) => a[0] - b[0]);
            const [weight, from, to] = edges.shift();

            if (inMST.has(to)) continue;

            steps.push({ type: 'consider', from, to });
            inMST.add(to);
            totalWeight += weight;
            steps.push({ type: 'mst-add', from, to, weight, totalWeight });
            steps.push({ type: 'visit', node: to });

            for (const { node: neighbor, weight: w } of graph.getNeighbors(to)) {
                if (!inMST.has(neighbor)) {
                    edges.push([w, to, neighbor]);
                }
            }
        }

        return steps;
    },

    _kruskal(graph) {
        const steps = [];
        const parent = {};
        const rank = {};

        // Union-Find
        const find = (x) => {
            if (parent[x] !== x) parent[x] = find(parent[x]);
            return parent[x];
        };
        const union = (x, y) => {
            const px = find(x), py = find(y);
            if (px === py) return false;
            if (rank[px] < rank[py]) parent[px] = py;
            else if (rank[px] > rank[py]) parent[py] = px;
            else { parent[py] = px; rank[px]++; }
            return true;
        };

        for (const [id] of graph.nodes) {
            parent[id] = id;
            rank[id] = 0;
        }

        // Sort edges by weight
        const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
        let totalWeight = 0;

        for (const edge of sortedEdges) {
            steps.push({ type: 'consider', from: edge.from, to: edge.to });
            if (union(edge.from, edge.to)) {
                totalWeight += edge.weight;
                steps.push({ type: 'mst-add', from: edge.from, to: edge.to, weight: edge.weight, totalWeight });
            }
        }

        return steps;
    },

    _reconstructPath(steps, prev, source, target) {
        const pathNodes = [];
        const pathEdges = [];
        let current = target;
        while (current !== null && current !== undefined) {
            pathNodes.unshift(current);
            if (prev[current] !== null && prev[current] !== undefined) {
                pathEdges.unshift([prev[current], current]);
            }
            if (current === source) break;
            current = prev[current];
        }
        if (pathNodes.length > 0 && pathNodes[0] === source) {
            steps.push({ type: 'path', nodes: pathNodes, edges: pathEdges });
        }
    }
};

window.GraphAlgorithms = GraphAlgorithms;
