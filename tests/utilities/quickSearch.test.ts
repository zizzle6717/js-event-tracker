import { expect } from 'chai';
import quickSearch from '../../src/utilities/quickSearch';

describe('quickSearch', () => {
    it('returns -1 for empty array', () => {
        const actual = quickSearch([], 5);
        const expected = -1;
        expect(actual).to.be.equal(expected);
    });

    it('returns -1 when searchVal does not exist in array', () => {
        const actual = quickSearch([1, 3, 7, 8, 9, 10], 5);
        const expected = -1;
        expect(actual).to.be.equal(expected);
    });

    it('returns value index when searchVal is found in array', () => {
        const actual = quickSearch([1, 3, 5, 7, 8, 9, 10], 5);
        const expected = 2;
        expect(actual).to.be.equal(expected);
        const actual2 = quickSearch([1, 3, 5, 7, 8, 9, 10], 1);
        const expected2 = 0;
        expect(actual2).to.be.equal(expected2);
        const actua3 = quickSearch([-100, -1, 0, 3, 5, 7, 8, 9, 10], 10);
        const expected3 = 8;
        expect(actua3).to.be.equal(expected3);
    });

    it('supports searching an array of arrays with an accessor index', () => {
        const actual = quickSearch([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 20, 0);
        const expected = 2;
        expect(actual).to.be.equal(expected);
        const actual2 = quickSearch([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 99, 1);
        const expected2 = 4;
        expect(actual2).to.be.equal(expected2);
        const actua3 = quickSearch([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 50, 0);
        const expected3 = -1;
        expect(actua3).to.be.equal(expected3);
    });

    it('throws if arrValueIndex is invalid', () => {
        const actual = () => quickSearch([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 20);
        const expected = 'typeof midIndexSortVal and searchVal are required to match (found object and number)';
        expect(actual).to.throw(expected);
        const actual2 = () => quickSearch([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 20, 3);
        const expected2 = 'All elements of array must contain a value at arrValueIndex, 3';
        expect(actual2).to.throw(expected2);
        const actual3 = () => quickSearch([[0, 5], [3, 10], [20, '20'], [30, 50], [53, 99]], 20, 1);
        const expected3 = 'typeof midIndexSortVal and searchVal are required to match (found string and number)';
        expect(actual3).to.throw(expected3);
    });
});
