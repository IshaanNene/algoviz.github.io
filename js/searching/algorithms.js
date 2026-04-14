/* ============================================
   SEARCHING ALGORITHMS
   ============================================ */
const SearchAlgorithms = {
    info: {
        'linear': { name: 'Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Sequentially checks each element until the target is found.' },
        'binary': { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Halves the search space each step. Requires a sorted array.' },
        'jump': { name: 'Jump Search', time: 'O(√n)', space: 'O(1)', desc: 'Jumps ahead by √n blocks, then does linear search within the block.' },
        'exponential': { name: 'Exponential Search', time: 'O(log n)', space: 'O(1)', desc: 'Finds the range with doubling bounds, then binary searches within it.' },
        'interpolation': { name: 'Interpolation Search', time: 'O(log log n)', space: 'O(1)', desc: 'Estimates position based on value distribution. Best for uniformly distributed sorted data.' },
        'ternary': { name: 'Ternary Search', time: 'O(log₃ n)', space: 'O(1)', desc: 'Divides the search space into three equal parts, eliminating two-thirds per step.' },
        'fibonacci': { name: 'Fibonacci Search', time: 'O(log n)', space: 'O(1)', desc: 'Uses Fibonacci numbers to divide the array. Only uses addition — no division needed.' },
        'sentinel-linear': { name: 'Sentinel Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Places a sentinel at the end to eliminate boundary checks. Works on unsorted arrays.' },
        'front-back': { name: 'Front & Back Search', time: 'O(n)', space: 'O(1)', desc: 'Searches from both ends simultaneously, meeting in the middle. Works on unsorted arrays.' },
        'lower-bound': { name: 'Lower Bound', time: 'O(log n)', space: 'O(1)', desc: 'Finds the first element ≥ target. Like C++ std::lower_bound. Requires sorted array.' },
        'upper-bound': { name: 'Upper Bound', time: 'O(log n)', space: 'O(1)', desc: 'Finds the first element > target. Like C++ std::upper_bound. Requires sorted array.' },
        'meta-binary': { name: 'Meta Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Uses bit manipulation to perform binary search, building the index bit by bit from MSB to LSB.' },
        'recursive-binary': { name: 'Binary Search (Recursive)', time: 'O(log n)', space: 'O(log n)', desc: 'Recursive binary search using O(log n) stack space. Visually identical steps to iterative.' },
        'block': { name: 'Block Search', time: 'O(√n)', space: 'O(1)', desc: 'Divides array into √n blocks, scans block boundaries, then binary searches within the block.' },
    },

    run(name, arr, target) {
        switch (name) {
            case 'linear': return this._linear(arr, target);
            case 'binary': return this._binary(arr, target);
            case 'jump': return this._jump(arr, target);
            case 'exponential': return this._exponential(arr, target);
            case 'interpolation': return this._interpolation(arr, target);
            case 'ternary': return this._ternary(arr, target);
            case 'fibonacci': return this._fibonacci(arr, target);
            case 'sentinel-linear': return this._sentinelLinear(arr, target);
            case 'front-back': return this._frontBack(arr, target);
            case 'lower-bound': return this._lowerBound(arr, target);
            case 'upper-bound': return this._upperBound(arr, target);
            case 'meta-binary': return this._metaBinary(arr, target);
            case 'recursive-binary': return this._recursiveBinary(arr, target);
            case 'block': return this._block(arr, target);
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
    },

    /* ---- Interpolation Search ---- */
    _interpolation(arr, target) {
        const steps = [];
        let lo = 0, hi = arr.length - 1;
        while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
            if (lo === hi) {
                steps.push({ type: 'check', index: lo });
                if (arr[lo] === target) steps.push({ type: 'found', index: lo });
                else steps.push({ type: 'not-found' });
                return steps;
            }
            const pos = lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
            steps.push({ type: 'set-bounds', lo, hi, mid: pos });
            steps.push({ type: 'check', index: pos });
            if (arr[pos] === target) { steps.push({ type: 'found', index: pos }); return steps; }
            else if (arr[pos] < target) { steps.push({ type: 'eliminate', from: lo, to: pos }); lo = pos + 1; }
            else { steps.push({ type: 'eliminate', from: pos, to: hi }); hi = pos - 1; }
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Ternary Search ---- */
    _ternary(arr, target) {
        const steps = [];
        let lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            const mid1 = lo + Math.floor((hi - lo) / 3);
            const mid2 = hi - Math.floor((hi - lo) / 3);
            steps.push({ type: 'set-bounds', lo, hi, mid: mid1 });
            steps.push({ type: 'check', index: mid1 });
            if (arr[mid1] === target) { steps.push({ type: 'found', index: mid1 }); return steps; }
            steps.push({ type: 'check', index: mid2 });
            if (arr[mid2] === target) { steps.push({ type: 'found', index: mid2 }); return steps; }
            if (target < arr[mid1]) { steps.push({ type: 'eliminate', from: mid1, to: hi }); hi = mid1 - 1; }
            else if (target > arr[mid2]) { steps.push({ type: 'eliminate', from: lo, to: mid2 }); lo = mid2 + 1; }
            else { steps.push({ type: 'eliminate', from: lo, to: mid1 }); lo = mid1 + 1; hi = mid2 - 1; }
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Fibonacci Search ---- */
    _fibonacci(arr, target) {
        const steps = [];
        const n = arr.length;
        let fib2 = 0, fib1 = 1, fib = fib2 + fib1;
        while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib2 + fib1; }
        let offset = -1;
        while (fib > 1) {
            const i = Math.min(offset + fib2, n - 1);
            steps.push({ type: 'set-bounds', lo: offset + 1, hi: Math.min(offset + fib, n - 1), mid: i });
            steps.push({ type: 'check', index: i });
            if (arr[i] < target) { fib = fib1; fib1 = fib2; fib2 = fib - fib1; offset = i; }
            else if (arr[i] > target) { fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1; }
            else { steps.push({ type: 'found', index: i }); return steps; }
        }
        if (fib1 && offset + 1 < n && arr[offset + 1] === target) {
            steps.push({ type: 'check', index: offset + 1 });
            steps.push({ type: 'found', index: offset + 1 }); return steps;
        }
        steps.push({ type: 'not-found' }); return steps;
    },

    /* ---- Sentinel Linear Search ---- */
    _sentinelLinear(arr, target) {
        const steps = [];
        const n = arr.length, last = arr[n - 1];
        arr[n - 1] = target;
        let i = 0;
        while (arr[i] !== target) { steps.push({ type: 'check', index: i }); i++; }
        arr[n - 1] = last;
        steps.push({ type: 'check', index: i });
        if (i < n - 1 || last === target) steps.push({ type: 'found', index: i });
        else steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Front & Back Search ---- */
    _frontBack(arr, target) {
        const steps = [];
        let front = 0, back = arr.length - 1;
        while (front <= back) {
            steps.push({ type: 'check', index: front });
            if (arr[front] === target) { steps.push({ type: 'found', index: front }); return steps; }
            if (front !== back) {
                steps.push({ type: 'check', index: back });
                if (arr[back] === target) { steps.push({ type: 'found', index: back }); return steps; }
            }
            front++; back--;
        }
        steps.push({ type: 'not-found' }); return steps;
    },

    /* ---- Lower Bound (first element >= target) ---- */
    _lowerBound(arr, target) {
        const steps = [];
        let lo = 0, hi = arr.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi: hi - 1, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] < target) { steps.push({ type: 'eliminate', from: lo, to: mid }); lo = mid + 1; }
            else { hi = mid; }
        }
        if (lo < arr.length && arr[lo] === target) steps.push({ type: 'found', index: lo });
        else steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Upper Bound (first element > target) ---- */
    _upperBound(arr, target) {
        const steps = [];
        let lo = 0, hi = arr.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi: hi - 1, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] <= target) { steps.push({ type: 'eliminate', from: lo, to: mid }); lo = mid + 1; }
            else { hi = mid; }
        }
        if (lo < arr.length) { steps.push({ type: 'check', index: lo }); steps.push({ type: 'found', index: lo }); }
        else steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Meta Binary Search (bit-based) ---- */
    _metaBinary(arr, target) {
        const steps = [];
        const n = arr.length;
        if (n === 0) { steps.push({ type: 'not-found' }); return steps; }
        const lg = Math.floor(Math.log2(n));
        let pos = 0;
        steps.push({ type: 'check', index: 0 });
        if (arr[0] === target) { steps.push({ type: 'found', index: 0 }); return steps; }
        for (let i = lg; i >= 0; i--) {
            const newPos = pos | (1 << i);
            if (newPos < n) {
                steps.push({ type: 'set-bounds', lo: pos, hi: Math.min(pos + (1 << (i + 1)), n - 1), mid: newPos });
                steps.push({ type: 'check', index: newPos });
                if (arr[newPos] === target) { steps.push({ type: 'found', index: newPos }); return steps; }
                if (arr[newPos] < target) pos = newPos;
            }
        }
        steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Binary Search (Recursive) ---- */
    _recursiveBinary(arr, target) {
        const steps = [];
        const recurse = (lo, hi) => {
            if (lo > hi) return;
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] === target) { steps.push({ type: 'found', index: mid }); return; }
            if (arr[mid] < target) { steps.push({ type: 'eliminate', from: lo, to: mid }); recurse(mid + 1, hi); }
            else { steps.push({ type: 'eliminate', from: mid, to: hi }); recurse(lo, mid - 1); }
        };
        recurse(0, arr.length - 1);
        if (steps.length === 0 || steps[steps.length - 1].type !== 'found') steps.push({ type: 'not-found' });
        return steps;
    },

    /* ---- Block Search (√n blocks + binary within) ---- */
    _block(arr, target) {
        const steps = [];
        const n = arr.length, bs = Math.max(1, Math.floor(Math.sqrt(n)));
        let block = 0;
        while ((block + 1) * bs < n && arr[Math.min((block + 1) * bs, n) - 1] < target) {
            const ci = Math.min((block + 1) * bs, n) - 1;
            steps.push({ type: 'check', index: ci });
            steps.push({ type: 'jump', from: block * bs, to: ci });
            block++;
        }
        let lo = block * bs, hi = Math.min((block + 1) * bs, n) - 1;
        steps.push({ type: 'set-bounds', lo, hi, mid: Math.floor((lo + hi) / 2) });
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            steps.push({ type: 'set-bounds', lo, hi, mid });
            steps.push({ type: 'check', index: mid });
            if (arr[mid] === target) { steps.push({ type: 'found', index: mid }); return steps; }
            else if (arr[mid] < target) { steps.push({ type: 'eliminate', from: lo, to: mid }); lo = mid + 1; }
            else { steps.push({ type: 'eliminate', from: mid, to: hi }); hi = mid - 1; }
        }
        steps.push({ type: 'not-found' });
        return steps;
    }
};
window.SearchAlgorithms = SearchAlgorithms;
