// packages
const bcrypt = require('bcryptjs');
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

    Traffic.findOne({
      where: {
        contact
      }
    })
      .then(traffic => {
        if (!traffic) {
          return res.status(404).json({ err: 'User not found' });
        }

        console.log('traffic:'), traffic;

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
