var assert = require('assert');

// let add = require('../add.js').add;
// let mul = require('../add.js').mul;

import { add, mul } from '../add.js';

describe('add function test', function() {
    it('1 and 2 equal 3', function() {
        assert.equal(add(1, 2), 3);
    });
    it('1 + -2 should be -1', function() {
        assert.equal(add(1, -2), -1);
    });
    it('2 * 0 should be 0', function() {
        assert.equal(mul(2, 0), 0);
    });
});
