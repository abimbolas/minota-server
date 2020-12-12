/* eslint-disable arrow-body-style, no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('minota-storage');
const config = require('minota-shared/config');

const server = express();
server.use(bodyParser.json());
server.use(cors());

// 1. Config from local path and recursively up. localStorageConfig
// 2. Config from outside init. externalStorageConfig
// 3. Config from http header. httpStorageConfig
const storageConfig = {
  local: {},
  user: {},
  http: {}
};

// Init
function init(userConfig) {
  storageConfig.user = (userConfig || {}).storage || {};
  storageConfig.local = (config.read() || {}).storage || {};
  return server;
}

// Config from HTTP Header
function prepareConfig (request) {
  storageConfig.http = JSON.parse(request.get('Storage-Config') || '{}');
  return Object.assign(
    {},
    storageConfig.local,
    storageConfig.user,
    storageConfig.http
  );
}

// Welcome
server.get('/', (req, res) => res.send('Welcome to Minotá server v1.2.1'));

// Config
server.get('/config', (req, res) => {
  res.send(prepareConfig(req));
});

// Note
server.get('/note', (req, res) => storage
  .config(prepareConfig(req))
  .getNote()
  .then(note => res.send(note))
  .catch(commonErrorHandler(res))
);
server.post('/note', (req, res) => storage
  .config(prepareConfig(req))
  .postNote(req.body)
  .then(note => res.send(note))
  .catch(commonErrorHandler(res))
);

// Notes
server.get('/notes', (req, res) => storage
  .config(prepareConfig(req))
  .getNotes()
  .then(notes => res.send(notes))
  .catch(commonErrorHandler(res))
);
server.post('/notes', (req, res) => storage
  .config(prepareConfig(req))
  .postNotes(req.body)
  .then(notes => res.send(notes))
  .catch(commonErrorHandler(res))
);

// // Note by id
// server.get('/notes/:id', (req, res) => storage
//   .config(prepareConfig(req))
//   .get({ id: req.params.id })
//   .then(note => res.send(note))
//   .catch(commonErrorHandler(res))
// )
// server.post('/notes/:id', (req, res) => storage
//   .config(prepareConfig(req))
//   .post({ notes: [req.body] })
//   .then(notes => res.send(notes[0]))
//   .catch(commonErrorHandler(res))
// );
// server.delete('/notes/:id', (req, res) => storage
//   .config(prepareConfig(req))
//   .delete({ id: req.params.id })
//   .then(commonSuccessHandler(res))
//   .catch(commonErrorHandler(res))
// );
//
// // Notes
// server.get('/notes', (req, res) => storage
//   .config(prepareConfig(req))
//   .get()
//   .then(notes => res.send(notes))
//   .catch(commonErrorHandler(res))
// );
// server.delete('/notes', (req, res) => storage
//   .config(prepareConfig(req))
//   .delete({ notes: req.query.notes })
//   .then(commonSuccessHandler(res))
//   .catch(commonErrorHandler(res))
// );

// Utils
function commonErrorHandler (response) {
  return function (error) {
    let status = error.status || 500
    let message = error.message || JSON.stringify(error, null, ' ')
    if (error.code === 'ENOENT' && error.path) {
      status = 404
      message = `Storage not found at ${error.path}`
    }
    return response.status(status).send(message);
  }
}

function commonSuccessHandler (response) {
  return function (success) {
    return response.send(success);
  }
}

// // Get notes
// server.get('/last', (req, res) => storage
//   .config(storageConfig)
//   .get({ last: true })
//   .then(notes => res.send(notes))
//   .catch(error => res.status(400).send(error.message)));
//
// server.get('/last/day', (req, res) => storage
//   .config(storageConfig)
//   .get({ last: 'day' })
//   .then(notes => res.send(notes))
//   .catch(error => res.status(400).send(error.message)));

// server.get('/topics/all', (req, res) => storage
//   .config(storageConfig)
//   .get({ topics: 'all' })
//   .then(topics => res.send(topics))
//   .catch(error => res.status(400).send(error.message)));

// server.get('/notes/all', (req, res) => storage
//   .config(storageConfig)
//   .get({ notes: 'all' })
//   .then(notes => res.send(notes))
//   .catch(error => res.status(400).send(error.message)));

// server.get('/notes/:id', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .get({ id: req.params.id })
//     .then(notes => res.send(notes))
//     .catch(error => res.status(404).send(error.message));
// });
//
// server.get('/notes', (req, res) => {
//   const params = {};
//   if (req.query.topic) {
//     Object.assign(params, { searchBy: 'topic', topic: req.query.topic });
//   }
//   return storage
//     .config(storageConfig)
//     .get(params)
//     .then(notes => res.send(notes))
//     .catch(error => res.status(400).send(error.message));
// });


// // Create notes
// server.post('/notes/:id', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .post({ notes: [req.body] })
//     .then(notes => res.send(notes))
//     .catch(error => res.status(500).send(error.message));
// });

// server.post('/notes', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .post({ notes: req.body })
//     .then(notes => res.send(notes))
//     .catch(error => res.status(500).send(error.message));
// });


// Update notes
// server.put('/notes/:id', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .put({ notes: [req.body] })
//     .then(notes => res.send(notes[0]))
//     .catch(error => res.status(500).send(error.message));
// });

// server.put('/notes', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .put({ notes: req.body })
//     .then(notes => res.send(notes))
//     .catch((error) => {
//       if (error.status) {
//         return res.status(error.status).send(error.message);
//       }
//       return res.status(500).send(error.message);
//     });
// });

// Delete notes
// server.delete('/notes/:id', (req, res) => {
//   return storage
//     .config(storageConfig)
//     .delete({ id: req.params.id })
//     .then(response => res.send(response))
//     .catch((error) => {
//       let status = 500;
//       let message = 'Internal server error';
//       if (error.message.test(/^\d\d\d\s+\w+/)) {
//         const match = error.message.match(/^(\d\d\d)\s+(.+)/);
//         [, status, message] = match;
//       }
//       return res.status(status).send(message);
//     });
// });

// server.delete('/notes', (req, res) => {
//   if (!Object.keys(req.body).length) {
//     return res.status(400).send('Empty notes list');
//   }
//   return storage
//     .config(storageConfig)
//     .delete({ notes: req.body })
//     .then(response => res.send(response))
//     .catch((error) => {
//       let status = 500;
//       let message = 'Internal server error';
//       if (error.message.test(/^\d\d\d\s+\w+/)) {
//         const match = error.message.match(/^(\d\d\d)\s+(.+)/);
//         [, status, message] = match;
//       }
//       return res.status(status).send(message);
//     });
// });

module.exports = { init };
