const { expect } = require('chai');
const { it, describe } = require('mocha');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', () => {
  it('should throw an error if no authoriazation header is present', () => {
    const req = {
      get() {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated');
  });

  it('should throw an error if the authorization header is only one string', () => {
    const req = {
      get() {
        return 'token';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token', () => {
    const req = {
      get() {
        return 'Bearer validtoken';
      },
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({
      userId: 'abc',
    });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property('userId');
    /* eslint no-unused-expressions: 0 */
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });

  it('should throw an error if the token cannot be verified', () => {
    const req = {
      get() {
        return 'Bearer not-token';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
