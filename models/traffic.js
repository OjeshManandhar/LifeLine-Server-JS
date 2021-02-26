// packages
const { DataTypes, Sequelize } = require('sequelize');

// database
const { sequelize } = require('./../database');

const Traffic = sequelize.define('traffics', {
  tid: {
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
  pic_location: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING(10),
    defaultValue: 'traffic'
  }
});

module.exports = Traffic;
