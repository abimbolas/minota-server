/* eslint-disable arrow-body-style, no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('minota-storage');
const config = require('minota-shared/config');

let storageConfig; // will read at init time
let globalConfig;
const server = express();

function init(userStorageConfig) {
  globalConfig = config.read();
  storageConfig = userStorageConfig || globalConfig.storage;
  return server;
}

server.use(bodyParser.json());
server.use(cors());

// Welcome
server.get('/', (req, res) => res.send('Welcome to Minota server v1.2.1'));

// Get config
server.get('/config', (req, res) => {
  res.send(storageConfig);
});

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
    .config(storageConfig)
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
server.post('/notes', (req, res) => {
  return storage
    .config(storageConfig)
    .post({ notes: req.body })
    .then(notes => res.send(notes))
    .catch(error => res.status(500).send(error.message));
});

server.post('/notes/:id', (req, res) => {
  return storage
    .config(storageConfig)
    .post({ notes: [req.body] })
    .then(notes => res.send(notes[0]))
    .catch(error => res.status(500).send(error.message));
});

// Delete notes
server.delete('/notes/:id', (req, res) => {
  return storage
    .config(storageConfig)
    .delete({ id: req.params.id })
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error.message));
});

server.delete('/notes', (req, res) => {
  return storage
    .config(storageConfig)
    .delete({ notes: req.body })
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error.message));
});

module.exports = { init };
