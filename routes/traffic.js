// packages
const express = require('express');
const { body, param } = require('express-validator');

// controllers
const trafficController = require('./../controllers/traffic');

// middleware
const imageUpload = require('./../middleware/imageUpload');

const router = express.Router();

// GET
router.get('/traffic', trafficController.get.all);

router.get(
  '/traffic/:contact',
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
  trafficController.get.single
);

router.get(
  '/traffic_pic/:contact',
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
  trafficController.get.pic
);

router.get(
  '/traffic_small_pic/:contact',
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
  trafficController.get.smallPic
);

// POST
router.post(
  '/traffic_signup',
  [
    body('name')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Name must be of at least 5 characters long'),
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
  trafficController.post.signup
);

router.post('/traffic_login', trafficController.post.login);

router.post('/traffic_check_token', trafficController.post.checkToken);

router.post(
  '/traffic_pic/:contact',
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
  imageUpload.single('file'), // File parser
  trafficController.post.updatePic
);

// PUT
router.put(
  '/traffic/:contact',
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
  trafficController.put.update
);

router.put(
  '/traffic_password/:contact',
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
  trafficController.put.updatePassword
);

// DELETE
router.delete(
  '/traffic/:contact',
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
  trafficController.delete.delete
);

module.exports = router;
