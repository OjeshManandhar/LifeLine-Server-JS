// packages
const express = require('express');
const { body, param } = require('express-validator');

// controllers
const driverController = require('./../controllers/driver');

const router = express.Router();

// GET
router.get('/driver', driverController.get.all);

router.get(
  '/driver/:contact',
  [
    param('contact')
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.get.single
);

router.get(
  '/driver_pic/:contact',
  [
    param('contact')
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.get.pic
);

router.get(
  '/driver_small_pic/:contact',
  [
    param('contact')
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.get.smallPic
);

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
      .withMessage('Contact must be numbers only')
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

reouter.post('/driver_check_token', driverController.post.checkToken);

router.get(
  '/update_driver_pic/:contact',
  [
    param('contact')
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.post.updatePic
);

// PUT
router.put(
  '/driver/:contact',
  [
    param('contact')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      }),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage('Name must be of at least 5 characters long'),
    body('driver_id').optional().trim(),
    body('email', 'Invalid email').optional().trim().normalizeEmail().isEmail(),
    body('contact')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.put.update
);

router.put(
  '/driver_password/:contact',
  [
    param('contact')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
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
  driverController.put.updatePassword
);

// DELETE
router.delete(
  '/driver/:contact',
  [
    param('contact')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Contact must be numbers only')
      .custom(value => {
        if (value.length !== 10) {
          throw new Error('Contact must have 10 characters');
        }
        return true;
      })
  ],
  driverController.delete.delete
);

module.exports = router;
