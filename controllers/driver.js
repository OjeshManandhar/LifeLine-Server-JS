// packages
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// model
const { Driver } = require('./../models');

module.exports.get = {
  all: (req, res, next) => {
    Driver.findAll({
      attributes: ['name', 'driver_id', 'email', 'contact', 'role']
    })
      .then(drivers => res.json(drivers.map(d => d.toJSON())))
      .catch(err => {
        console.log('Get all drivers error', err);
        res.status(500).json({ err: 'Some error occured' });
      });
  }
};

module.exports.post = {
  signup: (req, res, next) => {
    const { name, driver_id, email, contact, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
    const encodedAuth = req.get('authorization');
    const decodedAuth = Buffer.from(
      encodedAuth.split(' ')[1],
      'base64'
    ).toString();
    const auth = {
      contact: decodedAuth.split(':')[0],
      password: decodedAuth.split(':')[1]
    };

    if (!auth.contact || !auth.password) {
      return res
        .setHeader('WWW-Authenticate', 'Basic')
        .status(401)
        .json({ err: 'Login credentials missing' });
    }

    if (!auth.contact.match(/^\d{10}$/)) {
      return res
        .status(401)
        .send('Phone number must be numbers only and have 10 characters');
    }

    if (auth.password.length < 8) {
      return res.status(401).send('Password must be at least 8 characters');
    }

    Driver.findOne({
      where: {
        contact: auth.contact
      }
    })
      .then(_driver => {
        if (!_driver) {
          res.status(401).send('Phone number is not registered');
          return;
        }
        const driver = _driver.toJSON();

        bcrypt
          .compare(auth.password, driver.password)
          .then(success => {
            if (success) {
              return res.status(200).json({
                token: 'just a token'
              });
            } else {
              return res
                .status(401)
                .send('Phone number and Password does not match');
            }
          })
          .catch(err => {
            console.log('Password compare error:', err);
            res.status(500).json({ err: 'Some error occured' });
          });
      })
      .catch(err => {
        console.log('Login error:', err);
        res.status(500).json({ err: 'Some error occured' });
      });
  },

  tokenCheck: (req, res, next) => {
    res.send(req.url);
  }
};

module.exports.put = {};

module.exports.delete = {};
