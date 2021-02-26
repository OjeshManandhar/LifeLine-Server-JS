const { Driver, Traffic } = require('./../models');

module.exports = (force = false) => {
  Driver.sync({ force: force });
  Traffic.sync({ force: force });
};
