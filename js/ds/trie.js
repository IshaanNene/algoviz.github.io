/* ============================================
   TRIE (PREFIX TREE) VISUALIZATION
   ============================================ */
const TrieViz = {
    canvas: null, ctx: null,
    root: null,           // { char, children: {}, isEnd: false }
    highlightPath: [],    // array of chars forming the current path
    foundPath: [],
    notFound: false,
    creatingNodes: [],    // chars being created in this step

    init(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.root = { char: '', children: {}, isEnd: false };
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
        this.highlightPath = []; this.foundPath = [];
        this.notFound = false; this.creatingNodes = [];
    },

    _countNodes(node) {
        if (!node) return 0;
        let c = 1;
        for (const ch of Object.values(node.children)) c += this._countNodes(ch);
        return c;
    },

    _isEmpty() {
        return this.root && Object.keys(this.root.children).length === 0;
    },

    /* ---- Operations (generate steps) ---- */

    insert(word) {
        const steps = [];
        word = word.toLowerCase();
        let node = this.root;
        const pathSoFar = [];
        for (let i = 0; i < word.length; i++) {
            const ch = word[i];
            pathSoFar.push(ch);
            if (node.children[ch]) {
                steps.push({ type: 'visit-node', path: [...pathSoFar] });
                node = node.children[ch];
            } else {
                steps.push({ type: 'create-node', path: [...pathSoFar], char: ch });
                node = node; // will be created in applyStep
            }
        }
        steps.push({ type: 'mark-end', path: [...pathSoFar], word });
        steps.push({ type: 'done' });
        return steps;
    },

    search(word) {
        const steps = [];
        word = word.toLowerCase();
        let node = this.root;
        const pathSoFar = [];
        for (let i = 0; i < word.length; i++) {
            const ch = word[i];
            pathSoFar.push(ch);
            if (node.children[ch]) {
                steps.push({ type: 'visit-node', path: [...pathSoFar] });
                node = node.children[ch];
            } else {
                steps.push({ type: 'not-found', path: [...pathSoFar] });
                return steps;
            }
        }
        if (node.isEnd) {
            steps.push({ type: 'found', path: [...pathSoFar], word });
        } else {
            steps.push({ type: 'prefix-only', path: [...pathSoFar], word });
        }
        return steps;
    },

    startsWith(prefix) {
        const steps = [];
        prefix = prefix.toLowerCase();
        let node = this.root;
        const pathSoFar = [];
        for (let i = 0; i < prefix.length; i++) {
            const ch = prefix[i];
            pathSoFar.push(ch);
            if (node.children[ch]) {
                steps.push({ type: 'visit-node', path: [...pathSoFar] });
                node = node.children[ch];
            } else {
                steps.push({ type: 'not-found', path: [...pathSoFar] });
                return steps;
            }
        }
        steps.push({ type: 'prefix-found', path: [...pathSoFar], prefix });
        return steps;
    },

    deleteWord(word) {
        const steps = [];
        word = word.toLowerCase();
        let node = this.root;
        const pathSoFar = [];
        for (let i = 0; i < word.length; i++) {
            const ch = word[i];
            pathSoFar.push(ch);
            if (node.children[ch]) {
                steps.push({ type: 'visit-node', path: [...pathSoFar] });
                node = node.children[ch];
            } else {
                steps.push({ type: 'not-found', path: [...pathSoFar] });
                return steps;
            }
        }
        if (node.isEnd) {
            steps.push({ type: 'delete-word', path: [...pathSoFar], word });
            steps.push({ type: 'done' });
        } else {
            steps.push({ type: 'not-found', path: [...pathSoFar] });
        }
        return steps;
    },

    applyStep(step) {
        this._clearHighlights();
        switch (step.type) {
            case 'visit-node':
                this.highlightPath = step.path;
                break;
            case 'create-node': {
                this.highlightPath = step.path;
                this.creatingNodes = [step.char];
                // Actually create the node in the trie
                let node = this.root;
                for (let i = 0; i < step.path.length - 1; i++) {
                    node = node.children[step.path[i]];
                }
                const ch = step.path[step.path.length - 1];
                if (!node.children[ch]) {
                    node.children[ch] = { char: ch, children: {}, isEnd: false };
                }
                break;
            }
            case 'mark-end': {
                this.foundPath = step.path;
                let node = this.root;
                for (const ch of step.path) {
                    if (node.children[ch]) node = node.children[ch];
                }
                node.isEnd = true;
                break;
            }
            case 'found':
                this.foundPath = step.path;
                break;
            case 'prefix-found':
                this.foundPath = step.path;
                break;
            case 'prefix-only':
                this.highlightPath = step.path;
                break;
            case 'not-found':
                this.highlightPath = step.path;
                this.notFound = true;
                break;
            case 'delete-word': {
                this.highlightPath = step.path;
                // Unmark isEnd
                let node = this.root;
                for (const ch of step.path) {
                    if (node.children[ch]) node = node.children[ch];
                }
                node.isEnd = false;
                // Clean up nodes with no children and not end
                this._cleanup(this.root, step.word, 0);
                break;
            }
            case 'done':
                break;
        }
        this.draw();
    },

    _cleanup(node, word, depth) {
        if (depth === word.length) return !node.isEnd && Object.keys(node.children).length === 0;
        const ch = word[depth];
        if (!node.children[ch]) return false;
        const shouldDelete = this._cleanup(node.children[ch], word, depth + 1);
        if (shouldDelete) delete node.children[ch];
        return !node.isEnd && Object.keys(node.children).length === 0;
    },

    reset() { this._clearHighlights(); },
    resetHighlights() { this._clearHighlights(); this.draw(); },

    buildSample() {
        this.root = { char: '', children: {}, isEnd: false };
        const words = ['cat', 'car', 'card', 'care', 'cart', 'do', 'dog', 'dot', 'done'];
        words.forEach(w => {
            let node = this.root;
            for (const ch of w) {
                if (!node.children[ch]) node.children[ch] = { char: ch, children: {}, isEnd: false };
                node = node.children[ch];
            }
            node.isEnd = true;
        });
        this._clearHighlights();
        this.draw();
    },

    clear() {
        this.root = { char: '', children: {}, isEnd: false };
        this._clearHighlights();
        this.draw();
    },

    /* ---- Drawing ---- */

    _layoutTree(node, depth, xMin, xMax) {
        const result = [];
        const keys = Object.keys(node.children).sort();
        if (keys.length === 0) return result;

        const slotW = (xMax - xMin) / keys.length;
        keys.forEach((ch, i) => {
            const child = node.children[ch];
            const cx = xMin + slotW * i + slotW / 2;
            const cy = 60 + depth * 70;
            result.push({ node: child, char: ch, x: cx, y: cy, depth, parentNode: node });
            const childResults = this._layoutTree(child, depth + 1, xMin + slotW * i, xMin + slotW * (i + 1));
            result.push(...childResults);
        });
        return result;
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (this._isEmpty()) {
            ctx.fillStyle = '#90A4AE'; ctx.font = "14px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Empty trie — insert some words!', w / 2, h / 2);
            return;
        }

        // Layout
        const laid = this._layoutTree(this.root, 0, 40, w - 40);

        // Build position map: path → {x, y}
        const posMap = new Map();
        posMap.set('', { x: w / 2, y: 30 }); // root

        // Build path for each laid node
        const nodePathMap = new Map();
        const buildPaths = (node, path) => {
            for (const [ch, child] of Object.entries(node.children)) {
                const cp = path + ch;
                nodePathMap.set(child, cp);
                buildPaths(child, cp);
            }
        };
        buildPaths(this.root, '');

        laid.forEach(l => {
            const path = nodePathMap.get(l.node) || l.char;
            posMap.set(path, { x: l.x, y: l.y });
        });

        // Draw root
        const rootPos = posMap.get('');
        const R = 18;
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath(); ctx.arc(rootPos.x, rootPos.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('root', rootPos.x, rootPos.y);

        // Draw edges and nodes
        const highlightSet = new Set();
        for (let i = 0; i < this.highlightPath.length; i++) {
            highlightSet.add(this.highlightPath.slice(0, i + 1).join(''));
        }
        const foundSet = new Set();
        for (let i = 0; i < this.foundPath.length; i++) {
            foundSet.add(this.foundPath.slice(0, i + 1).join(''));
        }

        laid.forEach(l => {
            const path = nodePathMap.get(l.node) || '';
            const parentPath = path.slice(0, -1);
            const parentPos = posMap.get(parentPath) || rootPos;
            const childPos = posMap.get(path) || { x: l.x, y: l.y };

            // Edge
            let edgeColor = '#B0BEC5';
            if (foundSet.has(path)) edgeColor = '#4ECDC4';
            else if (highlightSet.has(path)) edgeColor = '#FFE66D';
            ctx.strokeStyle = edgeColor; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(parentPos.x, parentPos.y + R);
            ctx.lineTo(childPos.x, childPos.y - R); ctx.stroke();

            // Edge label
            const mx = (parentPos.x + childPos.x) / 2;
            const my = (parentPos.y + R + childPos.y - R) / 2;
            ctx.fillStyle = '#845EC2'; ctx.font = "bold 10px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(l.char, mx - 10, my);

            // Node
            let fill = '#FFFFFF';
            if (foundSet.has(path)) fill = '#4ECDC4';
            else if (highlightSet.has(path) && this.notFound && path === this.highlightPath.join('')) fill = '#FF8B94';
            else if (highlightSet.has(path)) fill = '#FFE66D';
            else if (this.creatingNodes.includes(l.char) && path === this.highlightPath.join('')) fill = '#A8E6CF';

            ctx.fillStyle = fill;
            ctx.beginPath(); ctx.arc(childPos.x, childPos.y, R, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke();

            // Double border for word-end nodes
            if (l.node.isEnd) {
                ctx.beginPath(); ctx.arc(childPos.x, childPos.y, R - 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#845EC2'; ctx.lineWidth = 2; ctx.stroke();
            }

            // Character
            ctx.fillStyle = '#1A1A1A'; ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(l.char, childPos.x, childPos.y);
        });
    },

    destroy() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this.canvas = null; this.ctx = null;
    }
};
window.TrieViz = TrieViz;
