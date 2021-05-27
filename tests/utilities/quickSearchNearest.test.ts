import { expect } from 'chai';
import quickSearchNearest from '../../src/utilities/quickSearchNearest';

describe('quickSearchNearest', () => {
    it('returns -1 for empty array', () => {
        const actual = quickSearchNearest([], 5, 'prev');
        const expected = -1;
        expect(actual).to.be.equal(expected);
    });

    it('returns -1 when searchVal is outside of the valid response range', () => {
        const actual = quickSearchNearest([7, 8, 9, 10], 5, 'prev');
        const expected = -1;
        expect(actual).to.be.equal(expected);
        const actual1 = quickSearchNearest([7, 8, 9, 10], 11, 'next');
        const expected1 = -1;
        expect(actual1).to.be.equal(expected1);
    });

    it('short-cicuits when searchVal is equal to middle index val', () => {
        const actual = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 7, 'prev');
        const expected = 3;
        expect(actual).to.be.equal(expected);
    });

    it('finds the correct index of the nearest previous element', () => {
        const actual = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 4, 'prev');
        const expected = 1;
        expect(actual).to.be.equal(expected);
        const actual2 = quickSearchNearest([1, 3, 5, 7, 8, 9, 11], 10, 'prev');
        const expected2 = 5;
        expect(actual2).to.be.equal(expected2);
        const actual3 = quickSearchNearest([1, 3, 5, 7, 9, 10, 11], 8, 'prev');
        const expected3 = 3;
        expect(actual3).to.be.equal(expected3);
    });

    it('returns index of exact match when fallback search direction is set to previous', () => {
        const actual = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 10, 'prev');
        const expected = 6;
        expect(actual).to.be.equal(expected);
    });

    it('finds the correct index of the nearest next element', () => {
        const actual = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 4, 'next');
        const expected = 2;
        expect(actual).to.be.equal(expected);
        const actual2 = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 6, 'next');
        const expected2 = 3;
        expect(actual2).to.be.equal(expected2);
        const actual3 = quickSearchNearest([1, 3, 5, 7, 9, 10, 11], 8, 'next');
        const expected3 = 4;
        expect(actual3).to.be.equal(expected3);
    });

    it('returns index of exact match when fallback search direction is set to next', () => {
        const actual = quickSearchNearest([1, 3, 5, 7, 8, 9, 10], 3, 'next');
        const expected = 1;
        expect(actual).to.be.equal(expected);
    });

    it('supports normalizing search values on the fly', () => {
        const actual = quickSearchNearest(
            [[0, '5'], [3, '6'], [20, '7'], [30, '8'], [53, '11']],
            10,
            'prev',
            {
                arrValueIndex: 1,
                normalizeValue: (val) => Number(val),
            },
        );
        const expected = 3;
        expect(actual).to.be.equal(expected);
    });

    it('throws if arrValueIndex is invalid', () => {
        const actual = () => quickSearchNearest([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 20, 'prev');
        const expected = 'typeof sortVal(s) and searchVal are required to match (found object and number)';
        expect(actual).to.throw(expected);
        const actual2 = () => quickSearchNearest([[0, 5], [3, 10], [20, 20], [30, 50], [53, 99]], 20, 'prev', { arrValueIndex: 3 });
        const expected2 = 'All elements of array must contain a value at arrValueIndex, 3';
        expect(actual2).to.throw(expected2);
        const actual3 = () => quickSearchNearest([[0, 5], [3, 10], [20, '20'], [30, 50], [53, 99]], 20, 'prev', { arrValueIndex: 1 });
        const expected3 = 'typeof sortVal(s) and searchVal are required to match (found string and number)';
        expect(actual3).to.throw(expected3);
    });
});
