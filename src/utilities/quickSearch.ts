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
        const arrSortVal = arrSortIndex != null ? arr[mx][arrSortIndex] : arr[mx];

        if (arrSortVal == null) {
            throw new Error(`All elements of array must contain a value at arrSortIndex, ${arrSortIndex}`);
        }

        if (typeof arrSortVal !== typeof searchVal) {
            throw new Error(`typeof arrSortVal and searchVal are required to match (found ${typeof arrSortVal} and ${typeof searchVal})`);
        }

        if (searchVal === arrSortVal) {
            return mx;
        }

        if (searchVal > arrSortVal) {
            lx = mx + 1;
        } else if (searchVal < arrSortVal) {
            rx = mx - 1;
        }
    }

    return -1;
};

export default quickSearch;
