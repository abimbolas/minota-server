const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('minota-storage');
const config = require('minota-shared/config');

let storageConfig; // will read at init time
const server = express();

function init (userStorageConfig) {
  storageConfig = userStorageConfig || config.read().storage;
  return server;
}

server.use(bodyParser.json());
server.use(cors());

// Welcome
server.get('/', (req, res) => res.send('Welcome to Minota server v1.2.1'));

// Get notes
server.get('/last', (req, res) => storage
  .config(storageConfig)
  .get({ last: true })
  .then(notes => res.send(notes))
  .catch(error => res.status(400).send(error.message)));

server.get('/last/day', (req, res) => storage
  .config(storageConfig)
  .get({ last: 'day' })
  .then(notes => res.send(notes))
  .catch(error => res.status(400).send(error.message)));

server.get('/topics/all', (req, res) => storage
  .config(storageConfig)
  .get({ topics: 'all' })
  .then(topics => res.send(topics))
  .catch(error => res.status(400).send(error.message)));

server.get('/notes/all', (req, res) => storage
  .config(storageConfig)
  .get({ notes: 'all' })
  .then(notes => res.send(notes))
  .catch(error => res.status(400).send(error.message)));

server.get('/notes/:id', (req, res) => {
  return storage
    .config(config.storage)
    .get({ id: req.params.id })
    .then(notes => res.send(notes))
    .catch(error => res.status(404).send(error.message));
});

server.get('/notes', (req, res) => {
  const params = {};
  if (req.query.topic) {
    Object.assign(params, { searchBy: 'topic', topic: req.query.topic });
  }
  return storage
    .config(storageConfig)
    .get(params)
    .then(notes => res.send(notes))
    .catch(error => res.status(400).send(error.message));
});

// Save notes
server.post('/content/:id', (req, res) => storage
  .config(storageConfig)
  .post({ notes: Array.isArray(req.body) ? req.body : [req.body] })
  .then(() => res.send([req.body]))
  .catch(error => res.status(500).send(error.message)));

module.exports = { init };
