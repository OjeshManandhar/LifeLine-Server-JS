// packages
const express = require('express');

// controllers
const driverController = require('./../controllers/driver');

const router = express.Router();

// GET

// POST
router.post('/driver_signup', driverController.post.signup);
router.post('/driver_login', driverController.post.login);

// PUT

// DELETE

module.exports = router;
