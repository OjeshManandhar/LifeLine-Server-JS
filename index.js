// packages
const express = require('express');
const bodyParser = require('body-parser');

// env
require('dotenv').config();

const app = express();

// Request parser
app.use(bodyParser.json());

app.use((req, res, next) => res.send(req.url));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server started at port:', port));
