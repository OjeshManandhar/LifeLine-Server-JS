// packages
const { DataTypes, Sequelize } = require('sequelize');

// database
const { sequelize } = require('./../database');

const Driver = sequelize.define('drivers', {
  did: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [5, 50]
    }
  },
  driver_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  contact: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    validate: {
      isNumeric: true,
      len: 10
    }
  },
  password: {
    // hashed password will be saved
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      min: 50
    }
  },
  picture: {
    type: DataTypes.BLOB('long')
  },
  role: {
    type: DataTypes.STRING(10),
    defaultValue: 'driver'
  }
});

module.exports = Driver;
