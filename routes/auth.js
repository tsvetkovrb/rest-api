const router = require('express').Router();
const { body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(value => User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('Email address already exists!');
        }
      }))
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty(),
  ],
  authController.signup,
);

router.post('/signin', authController.signin);

module.exports = router;
