'use strict';

describe('BunyanFork', function () {
  var _require = require('../../lib');

  var BunyanFork = _require.BunyanFork;


  it('does not require params', function () {
    return expect(new BunyanFork()).toEqual(jasmine.any(Object));
  });
  it('has write function', function () {
    return expect(new BunyanFork().write).toBeDefined();
  });
  it('has error function', function () {
    return expect(new BunyanFork().error).toBeDefined();
  });
});