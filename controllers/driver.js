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
      .catch(next);
  },

  single: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Driver.findOne({
      where: {
        contact
      },
      attributes: ['name', 'driver_id', 'email', 'contact', 'role']
    })
      .then(driver => {
        if (!driver) {
          return res.status(404).json({ err: 'User not found' });
        }

        res.json({ driver: driver.toJSON() });
      })
      .catch(next);
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
      .catch(next);
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
          return res.status(401).send('Phone number is not registered');
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
          .catch(next);
      })
      .catch(next);
  },

  tokenCheck: (req, res, next) => {
    res.send(req.url);
  }
};

module.exports.put = {
  update: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Driver.findOne({
      where: {
        contact
      }
    })
      .then(driver => {
        if (!driver) {
          return res.status(404).json({ err: 'User not found' });
        }

        console.log('driver:'), driver;

        const { name, driver_id, email, contact } = req.body;

        driver.name = name || driver.name;
        driver.driver_id = driver_id || driver.driver_id;
        driver.email = email || driver.email;
        driver.contact = contact || driver.contact;

        driver
          .save()
          .then(driver =>
            res.status(202).json({
              name: driver.name,
              driver_id: driver.driver_id,
              email: driver.email,
              contact: driver.contact,
              role: driver.role
            })
          )
          .catch(next);
      })
      .catch(next);
  },
  updatePassword: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Driver.findOne({
      where: {
        contact
      }
    })
      .then(driver => {
        if (!driver) {
          return res.status(404).json({ err: 'User not found' });
        }

        const password = req.body.password;

        bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            driver.password = hashedPassword;

            return driver.save();
          })
          .then(driver =>
            res.status(202).json({
              name: driver.name,
              driver_id: driver.driver_id,
              email: driver.email,
              contact: driver.contact,
              role: driver.role
            })
          )
          .catch(next);
      })
      .catch(next);
  }
};

module.exports.delete = {
  delete: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Driver.findOne({
      where: { contact }
    })
      .then(driver => {
        if (!driver) {
          return res.status(404).json({ err: 'User not found' });
        }

        driver
          .destroy()
          .then(driver =>
            res.status(202).json({
              name: driver.name,
              driver_id: driver.driver_id,
              email: driver.email,
              contact: driver.contact,
              role: driver.role
            })
          )
          .catch(next);
      })
      .catch(next);
  }
};
