// packages
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// model
const { Driver } = require('./../models');

module.exports.get = {};

module.exports.post = {
  signup: (req, res, next) => {
    const { name, driver_id, email, contact, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('validation errors:', errors.array());
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    bcrypt
      .hash(password, 12)
      .then(hashedPassword =>
        Driver.create({
          name,
          driver_id,
          email,
          contact,
          password: hashedPassword
        })
      )
      .then(driver =>
        res.status(201).json({
          name: driver.name,
          driver_id: driver.driver_id,
          email: driver.email,
          contact: driver.contact,
          role: driver.role
        })
      )
      .catch(err => {
        console.log('Create driver err:', err);
        res.status(422).json({ err: err.errors[0].message });
      });
  },

  login: (req, res, next) => {
    console.log('Driver Login');

    console.log(req.headers.authorization);
    console.log(req.get('authorization'));

    res.send(req.url);
  },

  tokenCheck: (req, res, next) => {
    res.send(req.url);
  }
};

module.exports.put = {};

module.exports.delete = {};
