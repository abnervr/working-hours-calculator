const assert = require('assert');
const sudoku = require('../main');

describe('Parser', function () {
    describe('calcDistance', function () {
        it('should return 0 for the same location', function () {
            const location = {
                latitude: -1.5283406,
                longitude: -2.4650814
            };
            const response = sudoku.calculateDistance(location, location);
            assert.equal(response, 0);
        });

        it('should calculate the correct distance', function () {
            const locationA = {
                latitude: 0,
                longitude: 0
            };
            const locationB = {
                latitude: 1,
                longitude: 1
            };

            const response = sudoku.calculateDistance(locationA, locationB);
            assert.equal(Math.round(response), 157426);
        });
    });
});