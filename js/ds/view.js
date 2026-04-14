/* ============================================
   DATA STRUCTURES VIEW
   ============================================ */
const DSView = {
    engine: null, currentDS: 'linked-list', resizeHandler: null,

    mount(container) {
        this.engine = new AlgoEngine(); this.engine.baseDelay = 300;

        container.innerHTML = `
      <div class="ds-view">
        <div class="page-header">
          <h2 class="page-title">Data <span class="title-accent">Structures</span></h2>
        </div>
        <div class="tab-bar">
          <button class="tab-item active" data-ds="linked-list">Linked List</button>
          <button class="tab-item" data-ds="stack">Stack</button>
          <button class="tab-item" data-ds="queue">Queue</button>
          <button class="tab-item" data-ds="binary-tree">Binary Tree</button>
          <button class="tab-item" data-ds="heap">Heap</button>
          <button class="tab-item" data-ds="hash-table">Hash Table</button>
          <button class="tab-item" data-ds="trie">Trie</button>
          <button class="tab-item" data-ds="strings">Strings</button>
          <button class="tab-item" data-ds="avl-tree">AVL Tree</button>
          <button class="tab-item" data-ds="rb-tree">RB Tree</button>
          <button class="tab-item" data-ds="union-find">Union-Find</button>
          <button class="tab-item" data-ds="segment-tree">Seg Tree</button>
          <button class="tab-item" data-ds="bloom-filter">Bloom Filter</button>
          <button class="tab-item" data-ds="skip-list">Skip List</button>
          <button class="tab-item" data-ds="b-tree">B-Tree</button>
          <button class="tab-item" data-ds="graph-ds">Graph</button>
          <button class="tab-item" data-ds="doubly-ll">Doubly LL</button>
          <button class="tab-item" data-ds="deque">Deque</button>
        </div>
        <div class="operation-panel" id="ds-operations"></div>
        <div class="controls-bar">
          <div class="playback-controls">
            <button id="ds-step-back" class="brutal-btn icon-btn small">⏮</button>
            <button id="ds-play" class="brutal-btn icon-btn primary">▶</button>
            <button id="ds-pause" class="brutal-btn icon-btn accent hidden">⏸</button>
            <button id="ds-stop" class="brutal-btn icon-btn danger">⏹</button>
            <button id="ds-step-fwd" class="brutal-btn icon-btn small">⏭</button>
          </div>
          <div class="timeline">
            <label class="brutal-label" style="margin:0">Step</label>
            <input type="range" id="ds-timeline" class="brutal-range timeline-slider" min="0" max="0" value="0">
            <span id="ds-step-info" class="stat-badge"><span class="stat-value">0/0</span></span>
          </div>
          <div class="speed-control">
            <label class="brutal-label" style="margin:0">Speed</label>
            <input type="range" id="ds-speed" class="brutal-range" min="1" max="8" value="3" style="width:80px">
            <span id="ds-speed-val" class="stat-badge"><span class="stat-value">1×</span></span>
          </div>
        </div>
        <div class="canvas-container"><canvas id="ds-canvas"></canvas></div>
      </div>`;

        this._renderOperations();
        this._initCurrentDS();
        this._bindEvents();
    },

    _renderOperations() {
        const panel = document.getElementById('ds-operations');
        switch (this.currentDS) {
            case 'linked-list':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <div class="op-input-group"><input type="number" id="ds-index" class="brutal-input" placeholder="Index" value="0" min="0" style="width:70px"></div>
          <button class="brutal-btn primary small" data-op="insert-head">Insert Head</button>
          <button class="brutal-btn primary small" data-op="insert-tail">Insert Tail</button>
          <button class="brutal-btn accent small" data-op="insert-at">Insert At</button>
          <button class="brutal-btn danger small" data-op="delete-head">Del Head</button>
          <button class="brutal-btn danger small" data-op="delete-tail">Del Tail</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="reverse">Reverse</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'stack':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="push">Push</button>
          <button class="brutal-btn danger small" data-op="pop">Pop</button>
          <button class="brutal-btn accent small" data-op="peek">Peek</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'queue':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="enqueue">Enqueue</button>
          <button class="brutal-btn danger small" data-op="dequeue">Dequeue</button>
          <button class="brutal-btn accent small" data-op="peek">Peek</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'binary-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="delete">Delete</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn accent small" data-op="inorder">Inorder</button>
          <button class="brutal-btn accent small" data-op="preorder">Preorder</button>
          <button class="brutal-btn accent small" data-op="postorder">Postorder</button>
          <button class="brutal-btn accent small" data-op="levelorder">Level-Order</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn green small" data-op="sample">Sample BST</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'heap':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="extract">Extract</button>
          <div class="toolbar-separator"></div>
          <select id="heap-type" class="brutal-select"><option value="min" selected>Min Heap</option><option value="max">Max Heap</option></select>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'hash-table':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-key" class="brutal-input" placeholder="Key" value="apple" style="width:100px"></div>
          <div class="op-input-group"><input type="text" id="ds-ht-value" class="brutal-input" placeholder="Value" value="42" style="width:80px"></div>
          <button class="brutal-btn primary small" data-op="ht-insert">Insert</button>
          <button class="brutal-btn purple small" data-op="ht-get">Get</button>
          <button class="brutal-btn danger small" data-op="ht-delete">Delete</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'trie':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-word" class="brutal-input" placeholder="Word" value="cat" style="width:120px"></div>
          <button class="brutal-btn primary small" data-op="trie-insert">Insert</button>
          <button class="brutal-btn purple small" data-op="trie-search">Search</button>
          <button class="brutal-btn accent small" data-op="trie-prefix">Prefix</button>
          <button class="brutal-btn danger small" data-op="trie-delete">Delete</button>
          <div class="toolbar-separator"></div>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'strings':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-text" class="brutal-input" placeholder="Text" value="ABABDABACDABABCABAB" style="width:200px"></div>
          <div class="op-input-group"><input type="text" id="ds-pattern" class="brutal-input" placeholder="Pattern" value="ABABCABAB" style="width:130px"></div>
          <select id="string-algo" class="brutal-select">
            <option value="naive" selected>Naive</option>
            <option value="kmp">KMP</option>
            <option value="rabin-karp">Rabin-Karp</option>
          </select>
          <button class="brutal-btn primary small" data-op="string-run">Run</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'avl-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="delete">Delete</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'rb-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'union-find':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Element" value="0"></div>
          <div class="op-input-group"><input type="number" id="ds-value2" class="brutal-input" placeholder="Element 2" value="1" style="width:80px"></div>
          <button class="brutal-btn primary small" data-op="make-set">Make Set</button>
          <button class="brutal-btn accent small" data-op="find">Find</button>
          <button class="brutal-btn purple small" data-op="union">Union</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'segment-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-arr" class="brutal-input" placeholder="Array (comma-sep)" value="1,3,5,7,9,11" style="width:180px"></div>
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Index" value="0" style="width:60px"></div>
          <div class="op-input-group"><input type="number" id="ds-value2" class="brutal-input" placeholder="Val/R" value="5" style="width:60px"></div>
          <button class="brutal-btn primary small" data-op="st-build">Build</button>
          <button class="brutal-btn accent small" data-op="st-update">Update</button>
          <button class="brutal-btn purple small" data-op="st-query">Query(L,R)</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'bloom-filter':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-word" class="brutal-input" placeholder="Key" value="hello" style="width:120px"></div>
          <button class="brutal-btn primary small" data-op="bf-insert">Insert</button>
          <button class="brutal-btn purple small" data-op="bf-check">Check</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'skip-list':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="15"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn danger small" data-op="delete">Delete</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'b-tree':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="15"></div>
          <button class="brutal-btn primary small" data-op="insert">Insert</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'graph-ds':
                panel.innerHTML = `
          <div class="op-input-group"><input type="text" id="ds-label" class="brutal-input" placeholder="Node" value="A" style="width:60px"></div>
          <div class="op-input-group"><input type="text" id="ds-label2" class="brutal-input" placeholder="To" value="B" style="width:60px"></div>
          <button class="brutal-btn primary small" data-op="g-add-node">Add Node</button>
          <button class="brutal-btn accent small" data-op="g-add-edge">Add Edge</button>
          <button class="brutal-btn danger small" data-op="g-remove">Remove Node</button>
          <button class="brutal-btn purple small" data-op="g-bfs">BFS</button>
          <button class="brutal-btn purple small" data-op="g-dfs">DFS</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'doubly-ll':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="insert-head">Insert Head</button>
          <button class="brutal-btn primary small" data-op="insert-tail">Insert Tail</button>
          <button class="brutal-btn danger small" data-op="delete-head">Del Head</button>
          <button class="brutal-btn danger small" data-op="delete-tail">Del Tail</button>
          <button class="brutal-btn purple small" data-op="search">Search</button>
          <button class="brutal-btn green small" data-op="reverse">Reverse</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
            case 'deque':
                panel.innerHTML = `
          <div class="op-input-group"><input type="number" id="ds-value" class="brutal-input" placeholder="Value" value="42"></div>
          <button class="brutal-btn primary small" data-op="push-front">Push Front</button>
          <button class="brutal-btn primary small" data-op="push-back">Push Back</button>
          <button class="brutal-btn danger small" data-op="pop-front">Pop Front</button>
          <button class="brutal-btn danger small" data-op="pop-back">Pop Back</button>
          <button class="brutal-btn accent small" data-op="peek-front">Peek Front</button>
          <button class="brutal-btn accent small" data-op="peek-back">Peek Back</button>
          <button class="brutal-btn green small" data-op="sample">Sample</button>
          <button class="brutal-btn small" data-op="clear">Clear</button>`;
                break;
        }
    },

    _initCurrentDS() {
        const canvas = document.getElementById('ds-canvas');
        switch (this.currentDS) {
            case 'linked-list': LinkedListViz.init(canvas); break;
            case 'stack': StackQueueViz.init(canvas, 'stack'); break;
            case 'queue': StackQueueViz.init(canvas, 'queue'); break;
            case 'binary-tree': BinaryTreeViz.init(canvas); break;
            case 'heap': HeapViz.init(canvas); break;
            case 'hash-table': HashTableViz.init(canvas); break;
            case 'trie': TrieViz.init(canvas); break;
            case 'strings': StringViz.init(canvas); break;
            case 'avl-tree': AVLTreeViz.init(canvas); break;
            case 'rb-tree': RBTreeViz.init(canvas); break;
            case 'union-find': UnionFindViz.init(canvas); break;
            case 'segment-tree': SegmentTreeViz.init(canvas); break;
            case 'bloom-filter': BloomFilterViz.init(canvas); break;
            case 'skip-list': SkipListViz.init(canvas); break;
            case 'b-tree': BTreeViz.init(canvas); break;
            case 'graph-ds': GraphViz.init(canvas); break;
            case 'doubly-ll': DoublyLinkedListViz.init(canvas); break;
            case 'deque': DequeViz.init(canvas); break;
        }
    },

    _getViz() {
        switch (this.currentDS) {
            case 'linked-list': return LinkedListViz;
            case 'stack': case 'queue': return StackQueueViz;
            case 'binary-tree': return BinaryTreeViz;
            case 'heap': return HeapViz;
            case 'hash-table': return HashTableViz;
            case 'trie': return TrieViz;
            case 'strings': return StringViz;
            case 'avl-tree': return AVLTreeViz;
            case 'rb-tree': return RBTreeViz;
            case 'union-find': return UnionFindViz;
            case 'segment-tree': return SegmentTreeViz;
            case 'bloom-filter': return BloomFilterViz;
            case 'skip-list': return SkipListViz;
            case 'b-tree': return BTreeViz;
            case 'graph-ds': return GraphViz;
            case 'doubly-ll': return DoublyLinkedListViz;
            case 'deque': return DequeViz;
        }
    },

    _executeOp(op) {
        const vi = document.getElementById('ds-value');
        const value = vi ? parseInt(vi.value) || 0 : 0;
        const ii = document.getElementById('ds-index');
        const index = ii ? parseInt(ii.value) || 0 : 0;
        let steps = [];
        this.engine.stop(); this._updatePlayPause(false);
        const viz = this._getViz(); if (viz && viz.reset) viz.reset(); if (viz && viz.resetHighlights) viz.resetHighlights();

        switch (this.currentDS) {
            case 'linked-list':
                switch (op) {
                    case 'insert-head': steps = LinkedListViz.insertHead(value); break;
                    case 'insert-tail': steps = LinkedListViz.insertTail(value); break;
                    case 'insert-at': steps = LinkedListViz.insertAt(index, value); break;
                    case 'delete-head': steps = LinkedListViz.deleteHead(); break;
                    case 'delete-tail': steps = LinkedListViz.deleteTail(); break;
                    case 'search': steps = LinkedListViz.search(value); break;
                    case 'reverse': steps = LinkedListViz.reverse(); break;
                    case 'clear': LinkedListViz.clear(); return;
                } break;
            case 'stack':
                switch (op) {
                    case 'push': steps = StackQueueViz.push(value); break;
                    case 'pop': steps = StackQueueViz.pop(); break;
                    case 'peek': steps = StackQueueViz.peek(); break;
                    case 'clear': StackQueueViz.items = []; StackQueueViz.draw(); return;
                } break;
            case 'queue':
                switch (op) {
                    case 'enqueue': steps = StackQueueViz.enqueue(value); break;
                    case 'dequeue': steps = StackQueueViz.dequeue(); break;
                    case 'peek': steps = StackQueueViz.peek(); break;
                    case 'clear': StackQueueViz.items = []; StackQueueViz.draw(); return;
                } break;
            case 'binary-tree':
                switch (op) {
                    case 'insert': steps = BinaryTreeViz.insert(value); break;
                    case 'delete': steps = BinaryTreeViz.delete(value); break;
                    case 'search': steps = BinaryTreeViz.search(value); break;
                    case 'inorder': steps = BinaryTreeViz.inorder(); break;
                    case 'preorder': steps = BinaryTreeViz.preorder(); break;
                    case 'postorder': steps = BinaryTreeViz.postorder(); break;
                    case 'levelorder': steps = BinaryTreeViz.levelorder(); break;
                    case 'sample': BinaryTreeViz.buildSample(); return;
                    case 'clear': BinaryTreeViz.clear(); return;
                } break;
            case 'heap':
                switch (op) {
                    case 'insert': steps = HeapViz.insert(value); break;
                    case 'extract': steps = HeapViz.extract(); break;
                    case 'sample': HeapViz.buildSample(); return;
                    case 'clear': HeapViz.heapArray = []; HeapViz.draw(); return;
                } break;
            case 'hash-table': {
                const ki = document.getElementById('ds-key');
                const htKey = ki ? ki.value || '' : '';
                const hvi = document.getElementById('ds-ht-value');
                const htVal = hvi ? hvi.value || '' : '';
                switch (op) {
                    case 'ht-insert': steps = HashTableViz.insert(htKey, htVal); break;
                    case 'ht-get': steps = HashTableViz.get(htKey); break;
                    case 'ht-delete': steps = HashTableViz.remove(htKey); break;
                    case 'sample': HashTableViz.buildSample(); return;
                    case 'clear': HashTableViz.clear(); return;
                } break;
            }
            case 'trie': {
                const wi = document.getElementById('ds-word');
                const word = wi ? wi.value || '' : '';
                switch (op) {
                    case 'trie-insert': steps = TrieViz.insert(word); break;
                    case 'trie-search': steps = TrieViz.search(word); break;
                    case 'trie-prefix': steps = TrieViz.startsWith(word); break;
                    case 'trie-delete': steps = TrieViz.deleteWord(word); break;
                    case 'sample': TrieViz.buildSample(); return;
                    case 'clear': TrieViz.clear(); return;
                } break;
            }
            case 'strings': {
                const ti = document.getElementById('ds-text');
                const pi = document.getElementById('ds-pattern');
                const ai = document.getElementById('string-algo');
                const text = ti ? ti.value || '' : '';
                const pattern = pi ? pi.value || '' : '';
                const algo = ai ? ai.value : 'naive';
                switch (op) {
                    case 'string-run': steps = StringViz.run(algo, text, pattern); break;
                    case 'clear': StringViz.clear(); return;
                } break;
            }
            case 'avl-tree':
                switch (op) {
                    case 'insert': steps = AVLTreeViz.insert(value); break;
                    case 'delete': steps = AVLTreeViz.delete(value); break;
                    case 'search': steps = AVLTreeViz.search(value); break;
                    case 'sample': AVLTreeViz.buildSample(); return;
                    case 'clear': AVLTreeViz.clear(); return;
                } break;
            case 'rb-tree':
                switch (op) {
                    case 'insert': steps = RBTreeViz.insert(value); break;
                    case 'search': steps = RBTreeViz.search(value); break;
                    case 'sample': RBTreeViz.buildSample(); return;
                    case 'clear': RBTreeViz.clear(); return;
                } break;
            case 'union-find': {
                const v2i = document.getElementById('ds-value2');
                const val2 = v2i ? parseInt(v2i.value) || 0 : 0;
                switch (op) {
                    case 'make-set': steps = UnionFindViz.makeSet(value); break;
                    case 'find': steps = UnionFindViz.find(value); break;
                    case 'union': steps = UnionFindViz.union(value, val2); break;
                    case 'sample': UnionFindViz.buildSample(); return;
                    case 'clear': UnionFindViz.clear(); return;
                } break;
            }
            case 'segment-tree': {
                const arrI = document.getElementById('ds-arr');
                const v2i2 = document.getElementById('ds-value2');
                const val2 = v2i2 ? parseInt(v2i2.value) || 0 : 0;
                switch (op) {
                    case 'st-build': { const arr = (arrI ? arrI.value : '1,3,5,7').split(',').map(Number).filter(n => !isNaN(n)); steps = SegmentTreeViz.build(arr); break; }
                    case 'st-update': steps = SegmentTreeViz.update(value, val2); break;
                    case 'st-query': steps = SegmentTreeViz.query(value, val2); break;
                    case 'sample': SegmentTreeViz.buildSample(); return;
                    case 'clear': SegmentTreeViz.clear(); return;
                } break;
            }
            case 'bloom-filter': {
                const wi = document.getElementById('ds-word');
                const word = wi ? wi.value || '' : '';
                switch (op) {
                    case 'bf-insert': steps = BloomFilterViz.insert(word); break;
                    case 'bf-check': steps = BloomFilterViz.check(word); break;
                    case 'sample': BloomFilterViz.buildSample(); return;
                    case 'clear': BloomFilterViz.clear(); return;
                } break;
            }
            case 'skip-list':
                switch (op) {
                    case 'insert': steps = SkipListViz.insert(value); break;
                    case 'delete': steps = SkipListViz.deleteVal(value); break;
                    case 'search': steps = SkipListViz.search(value); break;
                    case 'sample': SkipListViz.buildSample(); return;
                    case 'clear': SkipListViz.clear(); return;
                } break;
            case 'b-tree':
                switch (op) {
                    case 'insert': steps = BTreeViz.insert(value); break;
                    case 'search': steps = BTreeViz.search(value); break;
                    case 'sample': BTreeViz.buildSample(); return;
                    case 'clear': BTreeViz.clear(); return;
                } break;
            case 'graph-ds': {
                const li = document.getElementById('ds-label');
                const l2i = document.getElementById('ds-label2');
                const label = li ? li.value || '' : '';
                const label2 = l2i ? l2i.value || '' : '';
                switch (op) {
                    case 'g-add-node': steps = GraphViz.addNode(label); break;
                    case 'g-add-edge': steps = GraphViz.addEdge(label, label2); break;
                    case 'g-remove': steps = GraphViz.removeNode(label); break;
                    case 'g-bfs': steps = GraphViz.bfs(label); break;
                    case 'g-dfs': steps = GraphViz.dfs(label); break;
                    case 'sample': GraphViz.buildSample(); return;
                    case 'clear': GraphViz.clear(); return;
                } break;
            }
            case 'doubly-ll':
                switch (op) {
                    case 'insert-head': steps = DoublyLinkedListViz.insertHead(value); break;
                    case 'insert-tail': steps = DoublyLinkedListViz.insertTail(value); break;
                    case 'delete-head': steps = DoublyLinkedListViz.deleteHead(); break;
                    case 'delete-tail': steps = DoublyLinkedListViz.deleteTail(); break;
                    case 'search': steps = DoublyLinkedListViz.search(value); break;
                    case 'reverse': steps = DoublyLinkedListViz.reverse(); break;
                    case 'sample': DoublyLinkedListViz.buildSample(); return;
                    case 'clear': DoublyLinkedListViz.clear(); return;
                } break;
            case 'deque':
                switch (op) {
                    case 'push-front': steps = DequeViz.pushFront(value); break;
                    case 'push-back': steps = DequeViz.pushBack(value); break;
                    case 'pop-front': steps = DequeViz.popFront(); break;
                    case 'pop-back': steps = DequeViz.popBack(); break;
                    case 'peek-front': steps = DequeViz.peekFront(); break;
                    case 'peek-back': steps = DequeViz.peekBack(); break;
                    case 'sample': DequeViz.buildSample(); return;
                    case 'clear': DequeViz.clear(); return;
                } break;
        }
        if (steps.length > 0) {
            this.engine.loadSteps(steps); document.getElementById('ds-timeline').max = steps.length - 1; document.getElementById('ds-timeline').value = 0;
            this.engine.play(); this._updatePlayPause(true);
        }
    },

    _bindEvents() {
        const self = this;

        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                self.currentDS = this.dataset.ds; self.engine.stop(); self._updatePlayPause(false);
                self._renderOperations(); self._initCurrentDS(); self._bindOpButtons(); self._bindHeapType();
                document.getElementById('ds-timeline').value = 0; document.getElementById('ds-timeline').max = 0;
                self._updateStepInfo(0, 0);
            });
        });

        this._bindOpButtons(); this._bindHeapType();

        const speedValues = [0.25, 0.5, 1, 1.5, 2, 3, 4, 8];
        document.getElementById('ds-speed').addEventListener('input', function () {
            const sp = speedValues[parseInt(this.value) - 1] || 1; self.engine.setSpeed(sp);
            document.getElementById('ds-speed-val').querySelector('.stat-value').textContent = sp + '×';
        });

        document.getElementById('ds-play').addEventListener('click', () => { if (this.engine.steps.length > 0) { this.engine.play(); this._updatePlayPause(true); } });
        document.getElementById('ds-pause').addEventListener('click', () => { this.engine.pause(); this._updatePlayPause(false); });
        document.getElementById('ds-stop').addEventListener('click', () => { this.engine.stop(); this._updatePlayPause(false); document.getElementById('ds-timeline').value = 0; this._updateStepInfo(0, 0); });
        document.getElementById('ds-step-fwd').addEventListener('click', () => { this.engine.stepForward(); });
        document.getElementById('ds-step-back').addEventListener('click', () => { this.engine.stepBackward(); });

        document.getElementById('ds-timeline').addEventListener('input', function () { self.engine.pause(); self._updatePlayPause(false); self.engine.jumpToStep(parseInt(this.value)); });

        this.engine.onStep = (step, index) => { const viz = this._getViz(); if (viz && viz.applyStep) viz.applyStep(step); document.getElementById('ds-timeline').value = index; this._updateStepInfo(index + 1, this.engine.steps.length); };
        this.engine.onComplete = () => { this._updatePlayPause(false); };
        this.engine.onReset = () => { const viz = this._getViz(); if (viz && viz.reset) viz.reset(); if (viz && viz.resetHighlights) viz.resetHighlights(); };
        this.resizeHandler = () => { const viz = this._getViz(); if (viz && viz._resize) viz._resize(); };
        window.addEventListener('resize', this.resizeHandler);
    },

    _bindOpButtons() { document.querySelectorAll('[data-op]').forEach(btn => { btn.addEventListener('click', () => this._executeOp(btn.dataset.op)); }); },
    _bindHeapType() { const ht = document.getElementById('heap-type'); if (ht) ht.addEventListener('change', function () { HeapViz.setType(this.value === 'min'); }); },
    _updatePlayPause(p) { document.getElementById('ds-play').classList.toggle('hidden', p); document.getElementById('ds-pause').classList.toggle('hidden', !p); },
    _updateStepInfo(c, t) { const el = document.getElementById('ds-step-info'); if (el) el.querySelector('.stat-value').textContent = `${c}/${t}`; },

    unmount() { if (this.engine) this.engine.stop(); if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler); const viz = this._getViz(); if (viz && viz.destroy) viz.destroy(); }
};
window.DSView = DSView;
