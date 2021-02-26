// env
require('dotenv').config();

// packages
const express = require('express');
const bodyParser = require('body-parser');

// database
const { sequelize } = require('./database');

const app = express();

// Request parser
app.use(bodyParser.json());

app.use((req, res, next) => res.send(req.url));

sequelize
  .sync()
  .then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log('Server started at port:', port));
  })
  .catch(err => console.log('Could not sync DB:', err));
