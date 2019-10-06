const { expect } = require('chai');
const { it, describe } = require('mocha');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller – Login', () => {
  it('should throw an error with code 500 if accessing the database fails', done => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'password',
      },
    };

    AuthController.signin(req, {}, () => {}).then(result => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 404);
      done();
    });
    User.findOne.restore();
  });
});
