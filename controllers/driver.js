const fs = require('fs');

// packages
const Jimp = require('jimp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
  },

  pic: (req, res, next) => {
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

        const image = driver.picture;

        if (image) {
          res.status(200).send(image);
        } else {
          res.status(404).json({ err: 'Image not found' });
        }
      })
      .catch(next);
  },

  smallPic: (req, res, next) => {
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

        const image = driver.picture;

        if (!image) {
          return res.status(404).json({ err: 'Image not found' });
        }

        Jimp.read(driver.picture)
          .then(image => {
            image.resize(100, 100);

            return image.getBufferAsync(Jimp.MIME_PNG);
          })
          .then(buffer => res.status(200).send(buffer))
          .catch(next);
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
    const encodedAuth = req.get('Authorization');
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
              jwt.sign(
                { id: driver.contact, role: driver.role },
                process.env.JWT_SECRET,
                { expiresIn: '2d' },
                (err, token) => {
                  if (err) return next(err);

                  res.status(200).json({
                    token,
                    contact: driver.contact,
                    name: driver.name,
                    role: driver.role
                  });
                }
              );
            } else {
              res.status(401).send('Phone number and Password does not match');
            }
          })
          .catch(next);
      })
      .catch(next);
  },

  checkToken: (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
      return res.status(401).json({ err: 'Token not found' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ err: 'Token expired' });
      }

      jwt.sign(
        { id: decoded.contact, role: decoded.contact },
        process.env.JWT_SECRET,
        { expiresIn: '2d' },
        (err, token) => {
          if (err) return next(err);

          res.status(200).json({
            new_token: token
          });
        }
      );
    });
  },

  updatePic: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;
    const image = req.file;

    Driver.findOne({
      where: {
        contact
      }
    })
      .then(driver => {
        if (!driver) {
          return res.status(404).json({ err: 'User not found' });
        }

        fs.promises
          .readFile('uploads/' + image.filename)
          .then(buffer => {
            driver.picture = buffer;

            return driver.save();
          })
          .then(driver => {
            fs.promises.unlink('uploads/' + image.filename);

            res.status(202).json({ message: 'File successfully uploaded' });
          })
          .catch(next);
      })
      .catch(next);
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
