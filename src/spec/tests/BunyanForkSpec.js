describe('BunyanFork', () => {
  const { BunyanFork } = require('../../lib')

  it('does not require params', () => expect(new BunyanFork()).toEqual(jasmine.any(Object)))
  it('has write function', () => expect(new BunyanFork().write).toBeDefined())
  it('has error function', () => expect(new BunyanFork().error).toBeDefined())
})
