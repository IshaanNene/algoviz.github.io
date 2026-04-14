/* ============================================
   DISJOINT SET (UNION-FIND) VISUALIZATION
   ============================================ */
const UnionFindViz = {
    canvas: null, ctx: null, parent: {}, rank: {}, elements: [], highlights: {},

    init(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.parent = {}; this.rank = {}; this.elements = []; this.highlights = {}; this._resize(); },
    destroy() { this.canvas = null; this.ctx = null; },
    _resize() { if (!this.canvas) return; const p = this.canvas.parentElement, dpr = window.devicePixelRatio || 1; this.canvas.width = p.clientWidth * dpr; this.canvas.height = p.clientHeight * dpr; this.canvas.style.width = p.clientWidth + 'px'; this.canvas.style.height = p.clientHeight + 'px'; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(); },

    makeSet(val) {
        const s = [];
        if (this.parent[val] !== undefined) { s.push({ type: 'exists', val }); return s; }
        this.parent[val] = val; this.rank[val] = 0; this.elements.push(val);
        s.push({ type: 'make-set', val }); s.push({ type: 'done' });
        this.draw(); return s;
    },

    find(val) {
        const s = [];
        if (this.parent[val] === undefined) { s.push({ type: 'not-found' }); return s; }
        let x = val;
        // Find root
        while (this.parent[x] !== x) { s.push({ type: 'visit', val: x }); x = this.parent[x]; }
        s.push({ type: 'found', val: x });
        // Path compression
        let y = val;
        while (this.parent[y] !== x) {
            const next = this.parent[y];
            this.parent[y] = x;
            s.push({ type: 'compress', from: y, to: x });
            y = next;
        }
        s.push({ type: 'done' });
        this.draw(); return s;
    },

    union(a, b) {
        const s = [];
        if (this.parent[a] === undefined || this.parent[b] === undefined) { s.push({ type: 'not-found' }); return s; }
        // Find roots
        let rootA = a; while (this.parent[rootA] !== rootA) rootA = this.parent[rootA];
        let rootB = b; while (this.parent[rootB] !== rootB) rootB = this.parent[rootB];
        s.push({ type: 'roots', a: rootA, b: rootB });
        if (rootA === rootB) { s.push({ type: 'same-set' }); return s; }
        // Union by rank
        if (this.rank[rootA] < this.rank[rootB]) { this.parent[rootA] = rootB; s.push({ type: 'union', from: rootA, to: rootB }); }
        else if (this.rank[rootA] > this.rank[rootB]) { this.parent[rootB] = rootA; s.push({ type: 'union', from: rootB, to: rootA }); }
        else { this.parent[rootB] = rootA; this.rank[rootA]++; s.push({ type: 'union', from: rootB, to: rootA }); }
        s.push({ type: 'done' });
        this.draw(); return s;
    },

    applyStep(step) {
        this.highlights = {};
        if (step.type === 'visit') this.highlights[step.val] = '#845EC2';
        if (step.type === 'found') this.highlights[step.val] = '#4ECDC4';
        if (step.type === 'compress') { this.highlights[step.from] = '#FFA552'; this.highlights[step.to] = '#4ECDC4'; }
        if (step.type === 'union') { this.highlights[step.from] = '#FF6B6B'; this.highlights[step.to] = '#4ECDC4'; }
        if (step.type === 'roots') { this.highlights[step.a] = '#845EC2'; this.highlights[step.b] = '#FFE66D'; }
        if (step.type === 'make-set') this.highlights[step.val] = '#4ECDC4';
        this.draw();
    },
    reset() { this.highlights = {}; this.draw(); },
    resetHighlights() { this.highlights = {}; this.draw(); },

    buildSample() {
        this.clear();
        for (let i = 0; i < 10; i++) { this.parent[i] = i; this.rank[i] = 0; this.elements.push(i); }
        // Create some unions
        this.parent[1] = 0; this.parent[2] = 0; this.rank[0] = 1;
        this.parent[4] = 3; this.parent[5] = 3; this.rank[3] = 1;
        this.parent[7] = 6; this.parent[8] = 6; this.parent[9] = 6; this.rank[6] = 1;
        this.draw();
    },
    clear() { this.parent = {}; this.rank = {}; this.elements = []; this.highlights = {}; this.draw(); },

    draw() {
        if (!this.ctx) return;
        const w = this.canvas.width / (window.devicePixelRatio || 1), h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);
        if (this.elements.length === 0) { this.ctx.fillStyle = '#999'; this.ctx.font = '14px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText('Union-Find is empty. Make sets to begin.', w / 2, h / 2); return; }

        // Group elements by root
        const groups = {};
        for (const el of this.elements) {
            let root = el; while (this.parent[root] !== root) root = this.parent[root];
            if (!groups[root]) groups[root] = [];
            groups[root].push(el);
        }

        const roots = Object.keys(groups).map(Number);
        const nodeR = 18;
        const groupWidth = w / Math.max(roots.length, 1);

        roots.forEach((root, gi) => {
            const members = groups[root];
            const cx = groupWidth * gi + groupWidth / 2;

            // Build tree structure for this group
            const children = {};
            for (const m of members) { children[m] = []; }
            for (const m of members) { if (this.parent[m] !== m && children[this.parent[m]]) children[this.parent[m]].push(m); }

            // Layout tree using BFS from root
            const positions = {};
            const queue = [[root, cx, 40]];
            const levelWidths = {};
            let maxY = 40;

            // Simple layout
            const layoutTree = (node, x, y, spread) => {
                positions[node] = { x, y };
                const ch = children[node] || [];
                const totalW = ch.length * spread;
                let startX = x - totalW / 2 + spread / 2;
                for (const child of ch) {
                    layoutTree(child, startX, y + 55, Math.max(30, spread / 2));
                    startX += spread;
                }
            };
            layoutTree(root, cx, 45, Math.min(60, groupWidth / (members.length + 1)));

            // Draw edges
            this.ctx.strokeStyle = '#555'; this.ctx.lineWidth = 2;
            for (const m of members) {
                if (this.parent[m] !== m && positions[m] && positions[this.parent[m]]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(positions[m].x, positions[m].y);
                    this.ctx.lineTo(positions[this.parent[m]].x, positions[this.parent[m]].y);
                    this.ctx.stroke();
                }
            }

            // Draw nodes
            for (const m of members) {
                if (!positions[m]) continue;
                const { x, y } = positions[m];
                const color = this.highlights[m] || (m === root ? '#2D5F5D' : '#1A1A1A');
                this.ctx.beginPath(); this.ctx.arc(x, y, nodeR, 0, Math.PI * 2);
                this.ctx.fillStyle = color; this.ctx.fill();
                this.ctx.strokeStyle = m === root ? '#4ECDC4' : '#333'; this.ctx.lineWidth = m === root ? 3 : 2; this.ctx.stroke();
                this.ctx.fillStyle = '#fff'; this.ctx.font = 'bold 13px Inter'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                this.ctx.fillText(m, x, y);
            }

            // Group label
            this.ctx.fillStyle = '#666'; this.ctx.font = '10px Inter'; this.ctx.textAlign = 'center';
            this.ctx.fillText(`Set ${root}`, cx, h - 10);
        });
    }
};
window.UnionFindViz = UnionFindViz;
