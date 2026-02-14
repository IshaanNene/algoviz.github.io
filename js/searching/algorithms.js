/* ============================================
   SEARCHING ALGORITHMS
   ============================================ */
const SearchAlgorithms = {
    info: {
        'linear': { name: 'Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Sequentially checks each element until the target is found.' },
        'binary': { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Halves the search space each step. Requires a sorted array.' },
        'jump': { name: 'Jump Search', time: 'O(√n)', space: 'O(1)', desc: 'Jumps ahead by √n blocks, then does linear search within the block.' },
        'exponential': { name: 'Exponential Search', time: 'O(log n)', space: 'O(1)', desc: 'Finds the range with doubling bounds, then binary searches within it.' },
    },

    run(name, arr, target) {
        switch (name) {
            case 'linear': return this._linear(arr, target);
            case 'binary': return this._binary(arr, target);
            case 'jump': return this._jump(arr, target);
            case 'exponential': return this._exponential(arr, target);
            default: return [];
        }
    },

    _linear(arr, target) {
        const steps = [];
        for (let i = 0; i < arr.length; i++) {
            steps.push({ type: 'check', index: i });
            if (arr[i] === target) {
                steps.push({ type: 'found', index: i });
                return steps;
            }
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    _binary(arr, target) {
        const steps = [];
        let lo = 0, hi = arr.length - 1;
        steps.push({ type: 'set-bounds', lo, hi, mid: Math.floor((lo + hi) / 2) });
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] === target) {
                steps.push({ type: 'found', index: mid });
                return steps;
            } else if (arr[mid] < target) {
                steps.push({ type: 'eliminate', from: lo, to: mid });
                lo = mid + 1;
            } else {
                steps.push({ type: 'eliminate', from: mid, to: hi });
                hi = mid - 1;
            }
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    _jump(arr, target) {
        const steps = [];
        const n = arr.length;
        const blockSize = Math.floor(Math.sqrt(n));
        let prev = 0, curr = blockSize;

        // Jump phase
        while (curr < n && arr[curr - 1] < target) {
            steps.push({ type: 'jump', from: prev, to: curr - 1 });
            steps.push({ type: 'check', index: curr - 1 });
            prev = curr;
            curr += blockSize;
        }

        // Linear search in the block
        steps.push({ type: 'set-bounds', lo: prev, hi: Math.min(curr, n) - 1, mid: -1 });
        for (let i = prev; i < Math.min(curr, n); i++) {
            steps.push({ type: 'check', index: i });
            if (arr[i] === target) {
                steps.push({ type: 'found', index: i });
                return steps;
            }
            if (arr[i] > target) break;
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    _exponential(arr, target) {
        const steps = [];
        const n = arr.length;

        if (arr[0] === target) {
            steps.push({ type: 'check', index: 0 });
            steps.push({ type: 'found', index: 0 });
            return steps;
        }

        // Find range with doubling
        let bound = 1;
        while (bound < n && arr[bound] <= target) {
            steps.push({ type: 'check', index: bound });
            steps.push({ type: 'jump', from: Math.floor(bound / 2), to: bound });
            if (arr[bound] === target) {
                steps.push({ type: 'found', index: bound });
                return steps;
            }
            bound *= 2;
        }

        // Binary search in [bound/2, min(bound, n-1)]
        let lo = Math.floor(bound / 2), hi = Math.min(bound, n - 1);
        steps.push({ type: 'set-bounds', lo, hi, mid: Math.floor((lo + hi) / 2) });

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] === target) {
                steps.push({ type: 'found', index: mid });
                return steps;
            } else if (arr[mid] < target) {
                steps.push({ type: 'eliminate', from: lo, to: mid });
                lo = mid + 1;
            } else {
                steps.push({ type: 'eliminate', from: mid, to: hi });
                hi = mid - 1;
            }
        }
        steps.push({ type: 'not-found' });
        return steps;
    }
};
window.SearchAlgorithms = SearchAlgorithms;
