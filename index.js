const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('minota-storage');
const config = require('minota-shared/config');

const server = express();

server.use(bodyParser.json());
server.use(cors());

// Welcome
server.get('/', (req, res) => res.send('Welcome to Minota server'));

// Get last note
server.get('/last', (req, res) => storage
  .config(config.storage)
  .get({ last: true })
  .then(notes => res.send(notes)));

// Save note
server.post('/content/:id', (req, res) => storage
  .config(config.storage)
  .post({ notes: Array.isArray(req.body) ? req.body : [req.body] })
  .then(() => res.send([req.body])));

module.exports = server;
