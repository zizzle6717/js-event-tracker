// This is dependent on a pre-sorted array
// If arrSortIndex is included, elements of array should be sorted by arrSortIndex
const quickSearchNearest = (
    arr: any[] | any[][],
    searchVal,
    direction: 'prev' | 'next',
    arrSortIndex?: number,
) => {
    if (!arr.length) {
        return -1;
    }

    let lx = 0;
    let rx = arr.length - 1;

    let leftIndexSortVal = arrSortIndex != null ? arr[lx][arrSortIndex] : arr[lx];
    let rightIndexSortVal = arrSortIndex != null ? arr[rx][arrSortIndex] : arr[rx];

    if ((direction === 'prev' && searchVal < leftIndexSortVal)
        || (direction === 'next' && searchVal > rightIndexSortVal)) {
        return -1;
    }

    while (lx < rx - 1) {
        const mx = Math.floor((rx + lx) / 2);
        // This allows support for an array of arrays containing an accessor index with the value to search on
        const midIndexSortVal = arrSortIndex != null ? arr[mx][arrSortIndex] : arr[mx];

        if (midIndexSortVal == null) {
            throw new Error(`All elements of array must contain a value at arrSortIndex, ${arrSortIndex}`);
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

    leftIndexSortVal = arrSortIndex != null ? arr[lx][arrSortIndex] : arr[lx];
    rightIndexSortVal = arrSortIndex != null ? arr[rx][arrSortIndex] : arr[rx];

    if (direction === 'next') {
        return searchVal > leftIndexSortVal ? rx : lx;
    }

    // Direction === 'prev' (makes the linter happy)
    return searchVal < rightIndexSortVal ? lx : rx;
};

export default quickSearchNearest;
