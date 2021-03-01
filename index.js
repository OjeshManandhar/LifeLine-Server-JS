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
const trafficRoutes = require('./routes/traffic');

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
app.use(trafficRoutes);

// 404
app.use((req, res, next) => res.status(404).json({ err: 'Path not found' }));

// Error handling middleware
app.use((error, req, res, next) => {
  console.log('Error handling middleware:', error, error.message);
  res
    .status(500)
    .json({ err: 'Internal Server Error', message: error.message });
});

initModels();

sequelize
  .sync()
  .then(() => {
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () =>
      console.log('Server started at port:', port)
    );

    const io = require('socket.io')(server, {
      cors: {
        origin: '*'
      }
    });
    io.on('connection', socket => {
      console.log('Socketd connected:', socket.id);

      socket.send('Hello client');
    });
  })
  .catch(err => console.log('Could not sync DB:', err));
