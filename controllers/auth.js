const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const { email, name, password } = req.body;

  const errors = validationResult(req);
  if (!errors) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw errors;
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email,
        password: hashedPw,
        name,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created',
        userId: result._id,
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
    });
};

exports.signin = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email is not defained');
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password');
        error.statusCode = 404;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        'secret',
        {
          expiresIn: '1h',
        },
      );

      res.status(201).json({
        token,
        userId: loadedUser._id.toString(),
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
    });
};
