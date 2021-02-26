// packages
const express = require('express');
const { body } = require('express-validator');

// controllers
const driverController = require('./../controllers/driver');

const router = express.Router();

// GET

// POST
router.post(
  '/driver_signup',
  [
    body('name')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Name must be of at least 5 characters long'),
    body('driver_id').trim(),
    body('email', 'Invalid email').trim().normalizeEmail().isEmail(),
    body('contact')
      .trim()
      .isNumeric()
      .withMessage('Contact must be only numberes')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      }),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must have atleast 8 characters')
  ],
  driverController.post.signup
);
router.post('/driver_login', driverController.post.login);

// PUT

// DELETE

module.exports = router;
