const { expect } = require('chai');
const { it } = require('mocha');

it('Should add numbers correctly', () => {
  const num1 = 2;
  const num2 = 3;
  expect(num1 + num2).to.equal(5);
});

it('Should not giva a result of 6', () => {
  const num1 = 2;
  const num2 = 3;
  expect(num1 + num2).not.to.equal(6);
});
