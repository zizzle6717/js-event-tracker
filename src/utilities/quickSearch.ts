// This is dependent on a pre-sorted array
// If arrSortIndex is included, elements of array should be sorted by arrSortIndex
const quickSearch = (arr: any[] | any[][], searchVal, arrSortIndex?: number) => {
    if (!arr.length) {
        return -1;
    }

    let lx = 0;
    let rx = arr.length - 1;

    while (lx <= rx) {
        const mx = Math.floor((rx + lx) / 2);
        // This allows support for an array of arrays containing an accessor index with the value to search on
        const midIndexSortVal = arrSortIndex != null ? arr[mx][arrSortIndex] : arr[mx];

        if (midIndexSortVal == null) {
            throw new Error(`All elements of array must contain a value at arrSortIndex, ${arrSortIndex}`);
        }

        if (typeof midIndexSortVal !== typeof searchVal) {
            throw new Error(`typeof midIndexSortVal and searchVal are required to match (found ${typeof midIndexSortVal} and ${typeof searchVal})`);
        }

        // Short-circuit
        if (searchVal === midIndexSortVal) {
            return mx;
        }

        if (searchVal > midIndexSortVal) {
            lx = mx + 1;
        } else if (searchVal < midIndexSortVal) {
            rx = mx - 1;
        }
    }

    return -1;
};

export default quickSearch;
