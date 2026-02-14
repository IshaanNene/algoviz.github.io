/* ============================================
   GRAPH DATA STRUCTURE
   Adjacency list, weighted, directed/undirected
   ============================================ */

class Graph {
    constructor(directed = false) {
        this.nodes = new Map();     // id -> { x, y, label }
        this.edges = [];            // [{ from, to, weight }]
        this.directed = directed;
        this.nextId = 0;
    }

    addNode(x, y, label) {
        const id = this.nextId++;
        label = label || String(id);
        this.nodes.set(id, { x, y, label, id });
        return id;
    }

    removeNode(id) {
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    }

    addEdge(from, to, weight = 1) {
        // Don't add duplicate edges
        const exists = this.edges.some(e =>
            (e.from === from && e.to === to) ||
            (!this.directed && e.from === to && e.to === from)
        );
        if (!exists && from !== to) {
            this.edges.push({ from, to, weight });
        }
    }

    removeEdge(from, to) {
        this.edges = this.edges.filter(e => {
            if (this.directed) return !(e.from === from && e.to === to);
            return !((e.from === from && e.to === to) || (e.from === to && e.to === from));
        });
    }

    getNeighbors(id) {
        const neighbors = [];
        for (const e of this.edges) {
            if (e.from === id) neighbors.push({ node: e.to, weight: e.weight });
            if (!this.directed && e.to === id) neighbors.push({ node: e.from, weight: e.weight });
        }
        return neighbors;
    }

    getNodeAt(x, y, radius = 25) {
        for (const [id, node] of this.nodes) {
            const dx = node.x - x;
            const dy = node.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) return id;
        }
        return null;
    }

    getEdgeAt(x, y, threshold = 10) {
        for (const edge of this.edges) {
            const from = this.nodes.get(edge.from);
            const to = this.nodes.get(edge.to);
            if (!from || !to) continue;
            const dist = this._pointToLineDistance(x, y, from.x, from.y, to.x, to.y);
            if (dist <= threshold) return edge;
        }
        return null;
    }

    _pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        param = Math.max(0, Math.min(1, param));
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        return Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
    }

    clear() {
        this.nodes.clear();
        this.edges = [];
        this.nextId = 0;
    }

    getNodeCount() { return this.nodes.size; }
    getEdgeCount() { return this.edges.length; }

    /** Create a sample graph */
    static createSample() {
        const g = new Graph(false);
        const positions = [
            [150, 120], [350, 80], [550, 120], [100, 280],
            [300, 300], [500, 280], [200, 450], [400, 450]
        ];
        positions.forEach(([x, y]) => g.addNode(x, y));
        g.addEdge(0, 1, 4); g.addEdge(0, 3, 2); g.addEdge(1, 2, 5);
        g.addEdge(1, 4, 10); g.addEdge(2, 5, 3); g.addEdge(3, 4, 7);
        g.addEdge(3, 6, 8); g.addEdge(4, 5, 6); g.addEdge(4, 7, 1);
        g.addEdge(5, 7, 9); g.addEdge(6, 7, 2);
        return g;
    }
}

window.Graph = Graph;
