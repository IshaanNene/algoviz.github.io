/* ============================================
   SORTING ALGORITHMS
   ============================================ */
const SortingAlgorithms = {
    info: {
        'selection': { name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', desc: 'Finds the minimum element and places it at the beginning.' },
        'insertion': { name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', desc: 'Builds sorted array one element at a time by inserting each element into its correct position.' },
        'quick': { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', desc: 'Picks a pivot and partitions elements around it.' },
        'merge': { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Divides array in half, sorts each half, then merges them.' },
        'heap': { name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', desc: 'Builds a max heap then repeatedly extracts the maximum.' },
        'radix-lsd': { name: 'Radix Sort (LSD)', time: 'O(nk)', space: 'O(n+k)', desc: 'Sorts digit by digit from least significant to most significant.' },
        'radix-msd': { name: 'Radix Sort (MSD)', time: 'O(nk)', space: 'O(n+k)', desc: 'Sorts digit by digit from most significant to least significant, recursively.' },
        'intro': { name: 'Intro Sort (std::sort)', time: 'O(n log n)', space: 'O(log n)', desc: 'Hybrid of quicksort, heapsort, and insertion sort. Falls back to heapsort when recursion depth exceeds 2·⌊log₂n⌋.' },
        'adaptive-merge': { name: 'Adaptive Merge Sort (std::stable_sort)', time: 'O(n log n)', space: 'O(n)', desc: 'Detects pre-existing sorted runs and merges them, similar to Timsort. Stable sort.' },
        'shell': { name: 'Shell Sort', time: 'O(n log²n)', space: 'O(1)', desc: 'Generalization of insertion sort that allows exchange of far-apart elements.' },
        'bubble': { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', desc: 'Repeatedly swaps adjacent elements if they are in the wrong order.' },
        'cocktail': { name: 'Cocktail Shaker Sort', time: 'O(n²)', space: 'O(1)', desc: 'Bidirectional bubble sort that traverses the array in both directions alternately.' },
        'gnome': { name: 'Gnome Sort', time: 'O(n²)', space: 'O(1)', desc: 'Similar to insertion sort but moves elements by a series of swaps, like a garden gnome sorting flower pots.' },
        'bitonic': { name: 'Bitonic Sort', time: 'O(n log²n)', space: 'O(1)', desc: 'Parallel-friendly comparison sort that builds bitonic sequences and merges them.' },
        'counting': { name: 'Counting Sort', time: 'O(n+k)', space: 'O(k)', desc: 'Counts occurrences of each value then reconstructs the sorted array. Non-comparison based.' },
        'bucket': { name: 'Bucket Sort', time: 'O(n+k)', space: 'O(n)', desc: 'Distributes elements into buckets, sorts each bucket individually, then concatenates.' },
        'comb': { name: 'Comb Sort', time: 'O(n²/2^p)', space: 'O(1)', desc: 'Improves Bubble Sort by comparing elements far apart, shrinking the gap by factor 1.3.' },
        'cycle': { name: 'Cycle Sort', time: 'O(n²)', space: 'O(1)', desc: 'Minimizes memory writes by rotating elements to their correct positions in cycles.' },
        'pancake': { name: 'Pancake Sort', time: 'O(n²)', space: 'O(1)', desc: 'Sorts using only prefix reversals (flips), like flipping a stack of pancakes.' },
        'tim': { name: 'Tim Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Hybrid sort used in Python & Java. Detects natural runs and merges with galloping.' },
        'odd-even': { name: 'Odd-Even Sort', time: 'O(n²)', space: 'O(1)', desc: 'Compares all odd/even indexed pairs, then even/odd pairs, repeating until sorted.' },
        'pigeonhole': { name: 'Pigeonhole Sort', time: 'O(n+k)', space: 'O(k)', desc: 'Places each element into a pigeonhole matching its key, then collects them in order.' },
        'bogo': { name: 'Bogo Sort', time: 'O((n+1)!)', space: 'O(1)', desc: 'Randomly shuffles the array until sorted. Hilariously inefficient — for entertainment only!' },
        'strand': { name: 'Strand Sort', time: 'O(n²)', space: 'O(n)', desc: 'Repeatedly pulls sorted subsequences (strands) from the input and merges them together.' },
    },

    run(name, arr) {
        const steps = [];
        const a = [...arr];
        switch (name) {
            case 'bubble': this._bubble(a, steps); break;
            case 'selection': this._selection(a, steps); break;
            case 'insertion': this._insertion(a, steps); break;
            case 'merge': this._mergeSort(a, steps, 0, a.length - 1); break;
            case 'quick': this._quickSort(a, steps, 0, a.length - 1); break;
            case 'heap': this._heapSort(a, steps); break;
            case 'radix-lsd': this._radixSortLSD(a, steps); break;
            case 'radix-msd': this._radixSortMSD(a, steps); break;
            case 'shell': this._shellSort(a, steps); break;
            case 'cocktail': this._cocktailSort(a, steps); break;
            case 'gnome': this._gnomeSort(a, steps); break;
            case 'bitonic': this._bitonicSort(a, steps); break;
            case 'intro': this._introSort(a, steps); break;
            case 'adaptive-merge': this._adaptiveMergeSort(a, steps); break;
            case 'counting': this._countingSort(a, steps); break;
            case 'bucket': this._bucketSort(a, steps); break;
            case 'comb': this._combSort(a, steps); break;
            case 'cycle': this._cycleSort(a, steps); break;
            case 'pancake': this._pancakeSort(a, steps); break;
            case 'tim': this._timSort(a, steps); break;
            case 'odd-even': this._oddEvenSort(a, steps); break;
            case 'pigeonhole': this._pigeonholeSort(a, steps); break;
            case 'bogo': this._bogoSort(a, steps); break;
            case 'strand': this._strandSort(a, steps); break;
        }
        for (let i = 0; i < a.length; i++) steps.push({ type: 'sorted', indices: [i], array: [...a] });
        return steps;
    },

    /* ---- Bubble Sort ---- */
    _bubble(a, s) {
        const n = a.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                s.push({ type: 'compare', indices: [j, j + 1], array: [...a] });
                if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; s.push({ type: 'swap', indices: [j, j + 1], array: [...a] }); }
            }
            s.push({ type: 'sorted', indices: [n - i - 1], array: [...a] });
        }
    },

    /* ---- Selection Sort ---- */
    _selection(a, s) {
        const n = a.length;
        for (let i = 0; i < n - 1; i++) {
            let m = i;
            for (let j = i + 1; j < n; j++) { s.push({ type: 'compare', indices: [m, j], array: [...a] }); if (a[j] < a[m]) m = j; }
            if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; s.push({ type: 'swap', indices: [i, m], array: [...a] }); }
            s.push({ type: 'sorted', indices: [i], array: [...a] });
        }
    },

    /* ---- Insertion Sort ---- */
    _insertion(a, s) {
        for (let i = 1; i < a.length; i++) {
            let key = a[i], j = i - 1;
            s.push({ type: 'compare', indices: [i], array: [...a] });
            while (j >= 0 && a[j] > key) {
                s.push({ type: 'compare', indices: [j, j + 1], array: [...a] });
                a[j + 1] = a[j]; s.push({ type: 'overwrite', indices: [j + 1], array: [...a] }); j--;
            }
            a[j + 1] = key; s.push({ type: 'overwrite', indices: [j + 1], array: [...a] });
        }
    },

    /* ---- Insertion sort for a sub-range (used by intro sort & adaptive merge sort) ---- */
    _insertionSortRange(a, s, lo, hi) {
        for (let i = lo + 1; i <= hi; i++) {
            let key = a[i], j = i - 1;
            s.push({ type: 'compare', indices: [i], array: [...a] });
            while (j >= lo && a[j] > key) {
                s.push({ type: 'compare', indices: [j, j + 1], array: [...a] });
                a[j + 1] = a[j]; s.push({ type: 'overwrite', indices: [j + 1], array: [...a] }); j--;
            }
            a[j + 1] = key; s.push({ type: 'overwrite', indices: [j + 1], array: [...a] });
        }
    },

    /* ---- Merge Sort ---- */
    _mergeSort(a, s, l, r) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        s.push({ type: 'merge-split', indices: [l, m, r], array: [...a] });
        this._mergeSort(a, s, l, m); this._mergeSort(a, s, m + 1, r); this._merge(a, s, l, m, r);
    },

    _merge(a, s, l, m, r) {
        const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
            s.push({ type: 'compare', indices: [l + i, m + 1 + j], array: [...a] });
            a[k] = L[i] <= R[j] ? L[i++] : R[j++];
            s.push({ type: 'overwrite', indices: [k], array: [...a] }); k++;
        }
        while (i < L.length) { a[k] = L[i++]; s.push({ type: 'overwrite', indices: [k], array: [...a] }); k++; }
        while (j < R.length) { a[k] = R[j++]; s.push({ type: 'overwrite', indices: [k], array: [...a] }); k++; }
    },

    /* ---- Quick Sort ---- */
    _quickSort(a, s, lo, hi) {
        if (lo < hi) {
            const p = this._partition(a, s, lo, hi);
            s.push({ type: 'sorted', indices: [p], array: [...a] });
            this._quickSort(a, s, lo, p - 1); this._quickSort(a, s, p + 1, hi);
        } else if (lo === hi) s.push({ type: 'sorted', indices: [lo], array: [...a] });
    },

    _partition(a, s, lo, hi) {
        const pv = a[hi]; s.push({ type: 'partition', indices: [hi], array: [...a] });
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            s.push({ type: 'compare', indices: [j, hi], array: [...a] });
            if (a[j] < pv) { i++;[a[i], a[j]] = [a[j], a[i]]; s.push({ type: 'swap', indices: [i, j], array: [...a] }); }
        }
        [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; s.push({ type: 'swap', indices: [i + 1, hi], array: [...a] });
        return i + 1;
    },

    /* ---- Heap Sort ---- */
    _heapSort(a, s) {
        const n = a.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) this._heapify(a, s, n, i);
        for (let i = n - 1; i > 0; i--) {
            [a[0], a[i]] = [a[i], a[0]]; s.push({ type: 'swap', indices: [0, i], array: [...a] });
            s.push({ type: 'sorted', indices: [i], array: [...a] }); this._heapify(a, s, i, 0);
        }
    },

    _heapify(a, s, n, i) {
        let lg = i; const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) { s.push({ type: 'compare', indices: [l, lg], array: [...a] }); if (a[l] > a[lg]) lg = l; }
        if (r < n) { s.push({ type: 'compare', indices: [r, lg], array: [...a] }); if (a[r] > a[lg]) lg = r; }
        if (lg !== i) { [a[i], a[lg]] = [a[lg], a[i]]; s.push({ type: 'swap', indices: [i, lg], array: [...a] }); this._heapify(a, s, n, lg); }
    },

    /* ---- Radix Sort (LSD) ---- */
    _radixSortLSD(a, s) {
        const mx = Math.max(...a);
        for (let exp = 1; Math.floor(mx / exp) > 0; exp *= 10) this._countByDigit(a, s, exp);
    },

    _countByDigit(a, s, exp) {
        const n = a.length, out = new Array(n), cnt = new Array(10).fill(0);
        for (let i = 0; i < n; i++) { cnt[Math.floor(a[i] / exp) % 10]++; s.push({ type: 'bucket', indices: [i], array: [...a] }); }
        for (let i = 1; i < 10; i++) cnt[i] += cnt[i - 1];
        for (let i = n - 1; i >= 0; i--) { const d = Math.floor(a[i] / exp) % 10; out[cnt[d] - 1] = a[i]; cnt[d]--; }
        for (let i = 0; i < n; i++) { a[i] = out[i]; s.push({ type: 'overwrite', indices: [i], array: [...a] }); }
    },

    /* ---- Radix Sort (MSD) ---- */
    _radixSortMSD(a, s) {
        const mx = Math.max(...a);
        if (mx === 0) return;
        const maxExp = Math.pow(10, Math.floor(Math.log10(mx)));
        this._msdHelper(a, s, 0, a.length - 1, maxExp);
    },

    _msdHelper(a, s, lo, hi, exp) {
        if (lo >= hi || exp < 1) return;
        // Count occurrences of each digit
        const cnt = new Array(10).fill(0);
        for (let i = lo; i <= hi; i++) {
            const d = Math.floor(a[i] / exp) % 10;
            cnt[d]++;
            s.push({ type: 'bucket', indices: [i], array: [...a] });
        }
        // Build prefix sums for bucket boundaries
        const starts = new Array(10);
        starts[0] = lo;
        for (let i = 1; i < 10; i++) starts[i] = starts[i - 1] + cnt[i - 1];
        // Place elements into correct positions
        const out = new Array(hi - lo + 1);
        const offsets = [...starts];
        for (let i = lo; i <= hi; i++) {
            const d = Math.floor(a[i] / exp) % 10;
            out[offsets[d] - lo] = a[i];
            offsets[d]++;
        }
        for (let i = lo; i <= hi; i++) {
            a[i] = out[i - lo];
            s.push({ type: 'overwrite', indices: [i], array: [...a] });
        }
        // Recurse into each bucket
        const nextExp = exp / 10;
        for (let d = 0; d < 10; d++) {
            const bucketStart = starts[d];
            const bucketEnd = bucketStart + cnt[d] - 1;
            if (bucketStart < bucketEnd) {
                this._msdHelper(a, s, bucketStart, bucketEnd, nextExp);
            }
        }
    },

    /* ---- Shell Sort ---- */
    _shellSort(a, s) {
        const n = a.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let t = a[i], j = i;
                while (j >= gap) {
                    s.push({ type: 'compare', indices: [j - gap, j], array: [...a] });
                    if (a[j - gap] <= t) break;
                    a[j] = a[j - gap]; s.push({ type: 'overwrite', indices: [j], array: [...a] }); j -= gap;
                }
                a[j] = t; s.push({ type: 'overwrite', indices: [j], array: [...a] });
            }
        }
    },

    /* ---- Cocktail Shaker Sort ---- */
    _cocktailSort(a, s) {
        const n = a.length;
        let swapped = true, start = 0, end = n - 1;
        while (swapped) {
            swapped = false;
            // Forward pass
            for (let i = start; i < end; i++) {
                s.push({ type: 'compare', indices: [i, i + 1], array: [...a] });
                if (a[i] > a[i + 1]) {
                    [a[i], a[i + 1]] = [a[i + 1], a[i]];
                    s.push({ type: 'swap', indices: [i, i + 1], array: [...a] });
                    swapped = true;
                }
            }
            s.push({ type: 'sorted', indices: [end], array: [...a] });
            end--;
            if (!swapped) break;
            swapped = false;
            // Backward pass
            for (let i = end; i > start; i--) {
                s.push({ type: 'compare', indices: [i - 1, i], array: [...a] });
                if (a[i - 1] > a[i]) {
                    [a[i - 1], a[i]] = [a[i], a[i - 1]];
                    s.push({ type: 'swap', indices: [i - 1, i], array: [...a] });
                    swapped = true;
                }
            }
            s.push({ type: 'sorted', indices: [start], array: [...a] });
            start++;
        }
    },

    /* ---- Gnome Sort ---- */
    _gnomeSort(a, s) {
        let i = 0;
        while (i < a.length) {
            if (i === 0 || a[i] >= a[i - 1]) {
                if (i > 0) s.push({ type: 'compare', indices: [i - 1, i], array: [...a] });
                i++;
            } else {
                s.push({ type: 'compare', indices: [i - 1, i], array: [...a] });
                [a[i], a[i - 1]] = [a[i - 1], a[i]];
                s.push({ type: 'swap', indices: [i - 1, i], array: [...a] });
                i--;
            }
        }
    },

    /* ---- Bitonic Sort ---- */
    _bitonicSort(a, s) {
        const n = a.length;
        // Pad to next power of 2 with Infinity sentinels
        let size = 1;
        while (size < n) size *= 2;
        const padded = size > n;
        while (a.length < size) a.push(Infinity);

        this._bitonicSortRec(a, s, 0, size, true, n);

        // Remove padding
        if (padded) {
            a.length = n;
            // Overwrite step to show final trimmed array
            s.push({ type: 'overwrite', indices: Array.from({ length: n }, (_, i) => i), array: [...a] });
        }
    },

    _bitonicSortRec(a, s, lo, cnt, ascending, realLen) {
        if (cnt <= 1) return;
        const half = cnt / 2;
        this._bitonicSortRec(a, s, lo, half, true, realLen);
        this._bitonicSortRec(a, s, lo + half, half, false, realLen);
        this._bitonicMerge(a, s, lo, cnt, ascending, realLen);
    },

    _bitonicMerge(a, s, lo, cnt, ascending, realLen) {
        if (cnt <= 1) return;
        const half = cnt / 2;
        for (let i = lo; i < lo + half; i++) {
            const j = i + half;
            // Only generate visual steps for indices within the real array
            if (i < realLen && j < realLen) {
                s.push({ type: 'compare', indices: [i, j], array: a.slice(0, realLen) });
            }
            if ((ascending && a[i] > a[j]) || (!ascending && a[i] < a[j])) {
                [a[i], a[j]] = [a[j], a[i]];
                if (i < realLen && j < realLen) {
                    s.push({ type: 'swap', indices: [i, j], array: a.slice(0, realLen) });
                }
            }
        }
        this._bitonicMerge(a, s, lo, half, ascending, realLen);
        this._bitonicMerge(a, s, lo + half, half, ascending, realLen);
    },

    /* ---- Intro Sort (std::sort) ---- */
    _introSort(a, s) {
        const n = a.length;
        const maxDepth = 2 * Math.floor(Math.log2(n));
        this._introSortRec(a, s, 0, n - 1, maxDepth);
    },

    _introSortRec(a, s, lo, hi, depthLimit) {
        const size = hi - lo + 1;
        if (size <= 16) {
            // Use insertion sort for small partitions
            this._insertionSortRange(a, s, lo, hi);
            return;
        }
        if (depthLimit === 0) {
            // Fall back to heap sort on this sub-range
            this._heapSortRange(a, s, lo, hi);
            return;
        }
        // Standard quicksort partition
        const p = this._partition(a, s, lo, hi);
        s.push({ type: 'sorted', indices: [p], array: [...a] });
        this._introSortRec(a, s, lo, p - 1, depthLimit - 1);
        this._introSortRec(a, s, p + 1, hi, depthLimit - 1);
    },

    /* Heap sort on a sub-range [lo..hi] (used by intro sort fallback) */
    _heapSortRange(a, s, lo, hi) {
        const n = hi - lo + 1;
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) this._heapifyRange(a, s, lo, n, i);
        // Extract elements
        for (let i = n - 1; i > 0; i--) {
            [a[lo], a[lo + i]] = [a[lo + i], a[lo]];
            s.push({ type: 'swap', indices: [lo, lo + i], array: [...a] });
            s.push({ type: 'sorted', indices: [lo + i], array: [...a] });
            this._heapifyRange(a, s, lo, i, 0);
        }
    },

    _heapifyRange(a, s, offset, n, i) {
        let lg = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) { s.push({ type: 'compare', indices: [offset + l, offset + lg], array: [...a] }); if (a[offset + l] > a[offset + lg]) lg = l; }
        if (r < n) { s.push({ type: 'compare', indices: [offset + r, offset + lg], array: [...a] }); if (a[offset + r] > a[offset + lg]) lg = r; }
        if (lg !== i) {
            [a[offset + i], a[offset + lg]] = [a[offset + lg], a[offset + i]];
            s.push({ type: 'swap', indices: [offset + i, offset + lg], array: [...a] });
            this._heapifyRange(a, s, offset, n, lg);
        }
    },

    /* ---- Adaptive Merge Sort (std::stable_sort / TimSort-like) ---- */
    _adaptiveMergeSort(a, s) {
        const n = a.length;
        const MIN_RUN = 16;

        // Step 1: Detect natural runs and extend short ones with insertion sort
        const runs = [];
        let i = 0;
        while (i < n) {
            let runStart = i;
            if (i + 1 >= n) {
                runs.push({ start: runStart, end: i });
                break;
            }
            // Detect ascending or descending run
            if (a[i + 1] >= a[i]) {
                // Ascending run
                while (i + 1 < n && a[i + 1] >= a[i]) {
                    s.push({ type: 'compare', indices: [i, i + 1], array: [...a] });
                    i++;
                }
            } else {
                // Descending run — reverse it
                while (i + 1 < n && a[i + 1] < a[i]) {
                    s.push({ type: 'compare', indices: [i, i + 1], array: [...a] });
                    i++;
                }
                // Reverse the descending run to make it ascending
                let lo = runStart, hi2 = i;
                while (lo < hi2) {
                    [a[lo], a[hi2]] = [a[hi2], a[lo]];
                    s.push({ type: 'swap', indices: [lo, hi2], array: [...a] });
                    lo++; hi2--;
                }
            }
            // Extend short runs with insertion sort to reach MIN_RUN
            const runEnd = Math.min(runStart + MIN_RUN - 1, n - 1);
            if (i < runEnd) {
                this._insertionSortRange(a, s, runStart, runEnd);
                i = runEnd;
            }
            runs.push({ start: runStart, end: i });
            i++;
        }

        // Step 2: Merge runs bottom-up until one run remains
        while (runs.length > 1) {
            const newRuns = [];
            for (let j = 0; j < runs.length; j += 2) {
                if (j + 1 < runs.length) {
                    const r1 = runs[j], r2 = runs[j + 1];
                    s.push({ type: 'merge-split', indices: [r1.start, r1.end, r2.end], array: [...a] });
                    this._merge(a, s, r1.start, r1.end, r2.end);
                    newRuns.push({ start: r1.start, end: r2.end });
                } else {
                    newRuns.push(runs[j]);
                }
            }
            runs.length = 0;
            runs.push(...newRuns);
        }
    },

    /* ---- Counting Sort ---- */
    _countingSort(a, s) {
        const n = a.length, max = Math.max(...a);
        const count = new Array(max + 1).fill(0);
        for (let i = 0; i < n; i++) { count[a[i]]++; s.push({ type: 'bucket', indices: [i], array: [...a] }); }
        for (let i = 1; i <= max; i++) count[i] += count[i - 1];
        const out = new Array(n);
        for (let i = n - 1; i >= 0; i--) { out[count[a[i]] - 1] = a[i]; count[a[i]]--; }
        for (let i = 0; i < n; i++) { a[i] = out[i]; s.push({ type: 'overwrite', indices: [i], array: [...a] }); }
    },

    /* ---- Bucket Sort ---- */
    _bucketSort(a, s) {
        const n = a.length, max = Math.max(...a), min = Math.min(...a);
        const bc = Math.max(1, Math.floor(Math.sqrt(n))), range = max - min + 1;
        const buckets = Array.from({ length: bc }, () => []);
        for (let i = 0; i < n; i++) {
            const bi = Math.min(bc - 1, Math.floor((a[i] - min) * bc / range));
            buckets[bi].push(a[i]);
            s.push({ type: 'bucket', indices: [i], array: [...a] });
        }
        for (const b of buckets) b.sort((x, y) => x - y);
        let idx = 0;
        for (const b of buckets) for (const v of b) { a[idx] = v; s.push({ type: 'overwrite', indices: [idx], array: [...a] }); idx++; }
    },

    /* ---- Comb Sort ---- */
    _combSort(a, s) {
        const n = a.length;
        let gap = n, swapped = true;
        while (gap > 1 || swapped) {
            gap = Math.max(1, Math.floor(gap / 1.3));
            swapped = false;
            for (let i = 0; i + gap < n; i++) {
                s.push({ type: 'compare', indices: [i, i + gap], array: [...a] });
                if (a[i] > a[i + gap]) { [a[i], a[i + gap]] = [a[i + gap], a[i]]; s.push({ type: 'swap', indices: [i, i + gap], array: [...a] }); swapped = true; }
            }
        }
    },

    /* ---- Cycle Sort ---- */
    _cycleSort(a, s) {
        const n = a.length;
        for (let start = 0; start < n - 1; start++) {
            let item = a[start], pos = start;
            for (let i = start + 1; i < n; i++) { s.push({ type: 'compare', indices: [start, i], array: [...a] }); if (a[i] < item) pos++; }
            if (pos === start) continue;
            while (item === a[pos]) pos++;
            if (pos !== start) { let t = a[pos]; a[pos] = item; item = t; s.push({ type: 'overwrite', indices: [pos], array: [...a] }); }
            while (pos !== start) {
                pos = start;
                for (let i = start + 1; i < n; i++) { s.push({ type: 'compare', indices: [start, i], array: [...a] }); if (a[i] < item) pos++; }
                while (item === a[pos]) pos++;
                if (item !== a[pos]) { let t = a[pos]; a[pos] = item; item = t; s.push({ type: 'overwrite', indices: [pos], array: [...a] }); }
            }
        }
    },

    /* ---- Pancake Sort ---- */
    _pancakeSort(a, s) {
        const flip = (end) => { let lo = 0, hi = end; while (lo < hi) { [a[lo], a[hi]] = [a[hi], a[lo]]; s.push({ type: 'swap', indices: [lo, hi], array: [...a] }); lo++; hi--; } };
        for (let size = a.length; size > 1; size--) {
            let mx = 0;
            for (let i = 1; i < size; i++) { s.push({ type: 'compare', indices: [i, mx], array: [...a] }); if (a[i] > a[mx]) mx = i; }
            if (mx !== size - 1) { if (mx > 0) flip(mx); flip(size - 1); }
            s.push({ type: 'sorted', indices: [size - 1], array: [...a] });
        }
    },

    /* ---- Tim Sort ---- */
    _timSort(a, s) {
        const n = a.length, MR = 32;
        let r = 0, tmp = n;
        while (tmp >= MR) { r |= tmp & 1; tmp >>= 1; }
        const minRun = tmp + r;
        const runs = [];
        let i = 0;
        while (i < n) {
            let end = i + 1;
            if (end < n) {
                if (a[end] < a[i]) {
                    while (end < n && a[end] < a[end - 1]) { s.push({ type: 'compare', indices: [end - 1, end], array: [...a] }); end++; }
                    let lo = i, hi = end - 1;
                    while (lo < hi) { [a[lo], a[hi]] = [a[hi], a[lo]]; s.push({ type: 'swap', indices: [lo, hi], array: [...a] }); lo++; hi--; }
                } else {
                    while (end < n && a[end] >= a[end - 1]) { s.push({ type: 'compare', indices: [end - 1, end], array: [...a] }); end++; }
                }
            }
            const ext = Math.min(i + minRun, n);
            if (end < ext) { this._insertionSortRange(a, s, i, ext - 1); end = ext; }
            runs.push({ start: i, end: end - 1 }); i = end;
        }
        while (runs.length > 1) {
            const nr = [];
            for (let j = 0; j < runs.length; j += 2) {
                if (j + 1 < runs.length) {
                    s.push({ type: 'merge-split', indices: [runs[j].start, runs[j].end, runs[j + 1].end], array: [...a] });
                    this._merge(a, s, runs[j].start, runs[j].end, runs[j + 1].end);
                    nr.push({ start: runs[j].start, end: runs[j + 1].end });
                } else nr.push(runs[j]);
            }
            runs.length = 0; runs.push(...nr);
        }
    },

    /* ---- Odd-Even Sort ---- */
    _oddEvenSort(a, s) {
        const n = a.length;
        let sorted = false;
        while (!sorted) {
            sorted = true;
            for (let i = 1; i < n - 1; i += 2) {
                s.push({ type: 'compare', indices: [i, i + 1], array: [...a] });
                if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; s.push({ type: 'swap', indices: [i, i + 1], array: [...a] }); sorted = false; }
            }
            for (let i = 0; i < n - 1; i += 2) {
                s.push({ type: 'compare', indices: [i, i + 1], array: [...a] });
                if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; s.push({ type: 'swap', indices: [i, i + 1], array: [...a] }); sorted = false; }
            }
        }
    },

    /* ---- Pigeonhole Sort ---- */
    _pigeonholeSort(a, s) {
        const min = Math.min(...a), max = Math.max(...a), range = max - min + 1;
        const holes = new Array(range).fill(0);
        for (let i = 0; i < a.length; i++) { holes[a[i] - min]++; s.push({ type: 'bucket', indices: [i], array: [...a] }); }
        let idx = 0;
        for (let i = 0; i < range; i++) while (holes[i]-- > 0) { a[idx] = i + min; s.push({ type: 'overwrite', indices: [idx], array: [...a] }); idx++; }
    },

    /* ---- Bogo Sort (capped at 15000 steps) ---- */
    _bogoSort(a, s) {
        const isSorted = () => { for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false; return true; };
        const maxSteps = 15000;
        while (!isSorted() && s.length < maxSteps) {
            for (let i = 1; i < a.length; i++) s.push({ type: 'compare', indices: [i - 1, i], array: [...a] });
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
                s.push({ type: 'swap', indices: [i, j], array: [...a] });
            }
        }
    },

    /* ---- Strand Sort ---- */
    _strandSort(a, s) {
        const n = a.length, input = [...a];
        let result = [];
        while (input.length > 0) {
            const strand = [input.shift()];
            let i = 0;
            while (i < input.length) {
                if (input[i] >= strand[strand.length - 1]) strand.push(input.splice(i, 1)[0]);
                else i++;
            }
            const merged = [];
            let si = 0, ri = 0;
            while (si < strand.length && ri < result.length) merged.push(strand[si] <= result[ri] ? strand[si++] : result[ri++]);
            while (si < strand.length) merged.push(strand[si++]);
            while (ri < result.length) merged.push(result[ri++]);
            result = merged;
            for (let k = 0; k < result.length; k++) a[k] = result[k];
            for (let k = 0; k < input.length; k++) a[result.length + k] = input[k];
            for (let k = 0; k < result.length; k++) s.push({ type: 'overwrite', indices: [k], array: [...a] });
        }
    }
};

window.SortingAlgorithms = SortingAlgorithms;
