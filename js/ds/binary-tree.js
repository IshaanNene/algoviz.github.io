/* ============================================
   BINARY TREE VISUALIZATION
   BST with insert, delete, search, traversals
   ============================================ */

const BinaryTreeViz = {
    canvas: null,
    ctx: null,
    root: null,
    highlightNode: null,
    foundNode: null,
    visitedNodes: new Set(),
    traversalOrder: [],

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.root = null;
        this._resize();
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

    _createNode(value) {
        return { value, left: null, right: null };
    },

    insert(value) {
        const steps = [];
        if (!this.root) {
            this.root = this._createNode(value);
            steps.push({ type: 'insert', value, path: [] });
            steps.push({ type: 'done' });
            return steps;
        }
        let current = this.root;
        const path = [];
        while (current) {
            path.push(current.value);
            steps.push({ type: 'compare', node: current.value, value });
            if (value < current.value) {
                if (!current.left) {
                    current.left = this._createNode(value);
                    steps.push({ type: 'insert', value, path: [...path] });
                    break;
                }
                current = current.left;
            } else if (value > current.value) {
                if (!current.right) {
                    current.right = this._createNode(value);
                    steps.push({ type: 'insert', value, path: [...path] });
                    break;
                }
                current = current.right;
            } else {
                // Duplicate
                steps.push({ type: 'duplicate', value });
                break;
            }
        }
        steps.push({ type: 'done' });
        return steps;
    },

    search(value) {
        const steps = [];
        let current = this.root;
        while (current) {
            steps.push({ type: 'compare', node: current.value, value });
            if (value === current.value) {
                steps.push({ type: 'found', node: current.value });
                return steps;
            }
            if (value < current.value) current = current.left;
            else current = current.right;
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    delete(value) {
        const steps = [];
        this.root = this._deleteNode(this.root, value, steps);
        steps.push({ type: 'done' });
        return steps;
    },

    _deleteNode(node, value, steps) {
        if (!node) {
            steps.push({ type: 'not-found' });
            return null;
        }
        steps.push({ type: 'compare', node: node.value, value });
        if (value < node.value) {
            node.left = this._deleteNode(node.left, value, steps);
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value, steps);
        } else {
            steps.push({ type: 'delete', node: node.value });
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            // Find inorder successor
            let successor = node.right;
            while (successor.left) successor = successor.left;
            steps.push({ type: 'successor', node: successor.value });
            node.value = successor.value;
            node.right = this._deleteNode(node.right, successor.value, steps);
        }
        return node;
    },

    // Traversals
    inorder() {
        const steps = [];
        this._inorder(this.root, steps);
        return steps;
    },
    _inorder(node, steps) {
        if (!node) return;
        this._inorder(node.left, steps);
        steps.push({ type: 'visit', node: node.value });
        this._inorder(node.right, steps);
    },

    preorder() {
        const steps = [];
        this._preorder(this.root, steps);
        return steps;
    },
    _preorder(node, steps) {
        if (!node) return;
        steps.push({ type: 'visit', node: node.value });
        this._preorder(node.left, steps);
        this._preorder(node.right, steps);
    },

    postorder() {
        const steps = [];
        this._postorder(this.root, steps);
        return steps;
    },
    _postorder(node, steps) {
        if (!node) return;
        this._postorder(node.left, steps);
        this._postorder(node.right, steps);
        steps.push({ type: 'visit', node: node.value });
    },

    levelorder() {
        const steps = [];
        if (!this.root) return steps;
        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift();
            steps.push({ type: 'visit', node: node.value });
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        return steps;
    },

    applyStep(step) {
        this.highlightNode = null;
        this.foundNode = null;
        switch (step.type) {
            case 'compare':
                this.highlightNode = step.node;
                break;
            case 'found':
            case 'successor':
                this.foundNode = step.node;
                break;
            case 'visit':
                this.visitedNodes.add(step.node);
                this.highlightNode = step.node;
                this.traversalOrder.push(step.node);
                break;
            case 'insert':
            case 'delete':
                this.highlightNode = step.value || step.node;
                break;
        }
        this.draw();
    },

    resetHighlights() {
        this.highlightNode = null;
        this.foundNode = null;
        this.visitedNodes.clear();
        this.traversalOrder = [];
        this.draw();
    },

    clear() {
        this.root = null;
        this.resetHighlights();
    },

    buildSample() {
        this.clear();
        [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45].forEach(v => {
            // Direct insert without steps
            this.root = this._directInsert(this.root, v);
        });
        this.draw();
    },

    _directInsert(node, value) {
        if (!node) return this._createNode(value);
        if (value < node.value) node.left = this._directInsert(node.left, value);
        else if (value > node.value) node.right = this._directInsert(node.right, value);
        return node;
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        if (!this.root) {
            ctx.fillStyle = '#888';
            ctx.font = "bold 14px 'Space Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillText('Empty tree — insert some values!', w / 2, h / 2);
            return;
        }

        // Calculate positions
        const positions = new Map();
        this._calcPositions(this.root, w / 2, 50, w / 4, positions);

        // Draw edges first
        this._drawEdges(ctx, this.root, positions);

        // Draw nodes
        this._drawNodes(ctx, this.root, positions);

        // Draw traversal order
        if (this.traversalOrder.length > 0) {
            ctx.fillStyle = '#845EC2';
            ctx.font = "bold 12px 'Space Mono', monospace";
            ctx.textAlign = 'left';
            ctx.fillText('Order: ' + this.traversalOrder.join(' → '), 20, h - 20);
        }
    },

    _calcPositions(node, x, y, spread, positions) {
        if (!node) return;
        positions.set(node.value, { x, y });
        this._calcPositions(node.left, x - spread, y + 70, spread / 2, positions);
        this._calcPositions(node.right, x + spread, y + 70, spread / 2, positions);
    },

    _drawEdges(ctx, node, positions) {
        if (!node) return;
        const pos = positions.get(node.value);
        if (node.left) {
            const leftPos = positions.get(node.left.value);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + 20);
            ctx.lineTo(leftPos.x, leftPos.y - 20);
            ctx.stroke();
            this._drawEdges(ctx, node.left, positions);
        }
        if (node.right) {
            const rightPos = positions.get(node.right.value);
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + 20);
            ctx.lineTo(rightPos.x, rightPos.y - 20);
            ctx.stroke();
            this._drawEdges(ctx, node.right, positions);
        }
    },

    _drawNodes(ctx, node, positions) {
        if (!node) return;
        const pos = positions.get(node.value);
        const r = 22;

        let bgColor = '#fff';
        if (this.visitedNodes.has(node.value)) bgColor = '#4ECDC4';
        if (node.value === this.highlightNode) bgColor = '#FFE66D';
        if (node.value === this.foundNode) bgColor = '#A8E6CF';

        // Shadow
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(pos.x + 3, pos.y + 3, r, 0, Math.PI * 2);
        ctx.fill();

        // Circle
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Value
        ctx.fillStyle = '#1A1A1A';
        ctx.font = "bold 14px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.value, pos.x, pos.y);

        this._drawNodes(ctx, node.left, positions);
        this._drawNodes(ctx, node.right, positions);
    },

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.root = null;
    }
};

window.BinaryTreeViz = BinaryTreeViz;
