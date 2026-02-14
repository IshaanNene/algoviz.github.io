/* ============================================
   SORTING ALGORITHMS
   ============================================ */
const SortingAlgorithms = {
    info: {
        'bubble': { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', desc: 'Repeatedly swaps adjacent elements if they are in the wrong order.' },
        'selection': { name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', desc: 'Finds the minimum element and places it at the beginning.' },
        'insertion': { name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', desc: 'Builds sorted array one element at a time by inserting each element into its correct position.' },
        'merge': { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Divides array in half, sorts each half, then merges them.' },
        'quick': { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', desc: 'Picks a pivot and partitions elements around it.' },
        'heap': { name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', desc: 'Builds a max heap then repeatedly extracts the maximum.' },
        'radix': { name: 'Radix Sort', time: 'O(nk)', space: 'O(n+k)', desc: 'Sorts digit by digit from least to most significant.' },
        'counting': { name: 'Counting Sort', time: 'O(n+k)', space: 'O(k)', desc: 'Counts occurrences of each value and reconstructs the sorted array.' },
        'shell': { name: 'Shell Sort', time: 'O(n log²n)', space: 'O(1)', desc: 'Generalization of insertion sort that allows exchange of far-apart elements.' },
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
            case 'radix': this._radixSort(a, steps); break;
            case 'counting': this._countingSort(a, steps); break;
            case 'shell': this._shellSort(a, steps); break;
        }
        for (let i = 0; i < a.length; i++) steps.push({ type: 'sorted', indices: [i], array: [...a] });
        return steps;
    },

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

    _selection(a, s) {
        const n = a.length;
        for (let i = 0; i < n - 1; i++) {
            let m = i;
            for (let j = i + 1; j < n; j++) { s.push({ type: 'compare', indices: [m, j], array: [...a] }); if (a[j] < a[m]) m = j; }
            if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; s.push({ type: 'swap', indices: [i, m], array: [...a] }); }
            s.push({ type: 'sorted', indices: [i], array: [...a] });
        }
    },

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

    _radixSort(a, s) {
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

    _countingSort(a, s) {
        const mx = Math.max(...a), cnt = new Array(mx + 1).fill(0), out = new Array(a.length);
        for (let i = 0; i < a.length; i++) { cnt[a[i]]++; s.push({ type: 'bucket', indices: [i], array: [...a] }); }
        for (let i = 1; i <= mx; i++) cnt[i] += cnt[i - 1];
        for (let i = a.length - 1; i >= 0; i--) { out[cnt[a[i]] - 1] = a[i]; cnt[a[i]]--; }
        for (let i = 0; i < a.length; i++) { a[i] = out[i]; s.push({ type: 'overwrite', indices: [i], array: [...a] }); }
    },

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
    }
};

window.SortingAlgorithms = SortingAlgorithms;
