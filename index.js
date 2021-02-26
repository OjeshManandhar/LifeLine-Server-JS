// env
require('dotenv').config();

// packages
const express = require('express');
const bodyParser = require('body-parser');

// database
const { sequelize } = require('./database');
const initModels = require('./database/initModels');

// routers
const driverRouter = require('./routes/driver');

const app = express();

// Request parser
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routers
app.use(driverRouter);

app.use((req, res, next) => res.send(req.url));

initModels();

sequelize
  .sync()
  .then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log('Server started at port:', port));
  })
  .catch(err => console.log('Could not sync DB:', err));
