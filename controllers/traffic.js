const fs = require('fs');

// packages
const Jimp = require('jimp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// model
const { Traffic } = require('./../models');

module.exports.get = {
  all: (req, res, next) => {
    Traffic.findAll({
      attributes: ['name', 'email', 'contact', 'role']
    })
      .then(traffics => res.json(traffics.map(d => d.toJSON())))
      .catch(next);
  },

  single: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Traffic.findOne({
      where: {
        contact
      },
      attributes: ['name', 'email', 'contact', 'role']
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        res.json({ traffic: traffic.toJSON() });
      })
      .catch(next);
  },

  pic: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    const contact = req.params.contact;

    Traffic.findOne({
      where: { contact }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        const image = traffic.picture;

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

    Traffic.findOne({
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
    const { name, email, contact, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array()[0].msg });
    }

    bcrypt
      .hash(password, 12)
      .then(hashedPassword =>
        Traffic.create({
          name,

          email,
          contact,
          password: hashedPassword
        })
      )
      .then(traffic =>
        res.status(201).json({
          name: traffic.name,
          email: traffic.email,
          contact: traffic.contact,
          role: traffic.role
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

    Traffic.findOne({
      where: {
        contact: auth.contact
      }
    })
      .then(_traffic => {
        if (!_traffic) {
          return res.status(401).send('Phone number is not registered');
        }
        const traffic = _traffic.toJSON();

        bcrypt
          .compare(auth.password, traffic.password)
          .then(success => {
            if (success) {
              jwt.sign(
                { id: traffic.contact, role: traffic.role },
                process.env.JWT_SECRET,
                { expiresIn: '2d' },
                (err, token) => {
                  if (err) return next(err);

                  res.status(200).json({
                    token,
                    contact: traffic.contact,
                    name: traffic.name,
                    role: traffic.role
                  });
                }
              );
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

    Traffic.findOne({
      where: {
        contact
      }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        fs.promises
          .readFile('uploads/' + image.filename)
          .then(buffer => {
            traffic.picture = buffer;

            return traffic.save();
          })
          .then(traffic => {
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

    Traffic.findOne({
      where: {
        contact
      }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        const { name, email, contact } = req.body;

        traffic.name = name || traffic.name;
        traffic.email = email || traffic.email;
        traffic.contact = contact || traffic.contact;

        traffic
          .save()
          .then(traffic =>
            res.status(202).json({
              name: traffic.name,
              email: traffic.email,
              contact: traffic.contact,
              role: traffic.role
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

    Traffic.findOne({
      where: {
        contact
      }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        const password = req.body.password;

        bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            traffic.password = hashedPassword;

            return traffic.save();
          })
          .then(traffic =>
            res.status(202).json({
              name: traffic.name,
              email: traffic.email,
              contact: traffic.contact,
              role: traffic.role
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

    Traffic.findOne({
      where: { contact }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        traffic
          .destroy()
          .then(traffic =>
            res.status(202).json({
              name: traffic.name,
              email: traffic.email,
              contact: traffic.contact,
              role: traffic.role
            })
          )
          .catch(next);
      })
      .catch(next);
  }
};
