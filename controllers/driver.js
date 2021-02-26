// packages
// const bcrypt = require('bcryptjs');

// model
const { Driver } = require('./../models');

module.exports.get = {};

module.exports.post = {
  signup: (req, res, next) => {
    console.log('Driver Signup');
  },

  login: (req, res, next) => {
    res.send(req.url);
  },

  tokenCheck: (req, res, next) => {
    res.send(req.url);
  }
};

module.exports.put = {};

module.exports.delete = {};
