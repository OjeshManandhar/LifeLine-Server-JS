// packages
const express = require('express');

// controllers
const driverController = require('./../controllers/driver');

const router = express.Router();

// GET

// POST
router.post('/driver_signup', driverController.post.signup);

// PUT

// DELETE

module.exports = router;
