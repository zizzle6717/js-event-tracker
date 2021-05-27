function getValFromIndex(arr, index, options: IQuickSearchNearestOptions) {
    const val = options.arrValueIndex != null ? arr[index][options.arrValueIndex] : arr[index];
    return options.normalizeValue ? options?.normalizeValue(val) : val;
}

interface IQuickSearchNearestOptions {
    arrValueIndex?: number;
    normalizeValue?: (val: any) => any;
}

// This is dependent on a pre-sorted array
// If arrValueIndex is included, elements of array should be sorted by arrValueIndex
const quickSearchNearest = (
    arr: any[] | any[][],
    searchVal,
    direction: 'prev' | 'next',
    options: IQuickSearchNearestOptions = {},
) => {
    if (!arr.length) {
        return -1;
    }

    let lx = 0;
    let rx = arr.length - 1;

    let leftIndexSortVal = getValFromIndex(arr, lx, options);
    let rightIndexSortVal = getValFromIndex(arr, rx, options);

    if ((direction === 'prev' && searchVal < leftIndexSortVal)
        || (direction === 'next' && searchVal > rightIndexSortVal)) {
        return -1;
    }

    while (lx < rx - 1) {
        const mx = Math.floor((rx + lx) / 2);
        // This allows support for an array of arrays containing an accessor index with the value to search on
        const midIndexSortVal = getValFromIndex(arr, mx, options);

        if (midIndexSortVal == null) {
            throw new Error(`All elements of array must contain a value at arrValueIndex, ${options?.arrValueIndex}`);
        }

        if (typeof midIndexSortVal !== typeof searchVal) {
            throw new Error(`typeof sortVal(s) and searchVal are required to match (found ${typeof midIndexSortVal} and ${typeof searchVal})`);
        }

        // Short-circuit
        if (searchVal === midIndexSortVal) {
            return mx;
        }

        if (searchVal > midIndexSortVal) {
            lx = direction === 'prev' ? mx : mx + 1;
        } else if (searchVal < midIndexSortVal) {
            rx = direction === 'next' ? mx : mx - 1;
        }
    }

    leftIndexSortVal = getValFromIndex(arr, lx, options);
    rightIndexSortVal = getValFromIndex(arr, rx, options);

    if (direction === 'next') {
        return searchVal > leftIndexSortVal ? rx : lx;
    }

    // Direction === 'prev' (makes the linter happy)
    return searchVal < rightIndexSortVal ? lx : rx;
};

export default quickSearchNearest;
