// import express from 'express';
// import AppController from '../controllers/AppController.js';
// import UsersController from '../controllers/UsersController.js';
// import AuthController from '../controllers/AuthController.js';
// import FilesController from '../controllers/FilesController.js';

// function controllerRouting(app) {
//   const router = express.Router();
//   app.use('/', router);

//   // App Controller Routes
//   router.get('/status', AppController.getStatus);
//   router.get('/stats', AppController.getStats);

//   // User Controller Routes
//   router.post('/users', UsersController.postNew);
//   router.get('/users/me', UsersController.getMe);

//   // Auth Controller Routes
//   router.get('/connect', AuthController.getConnect);
//   router.get('/disconnect', AuthController.getDisconnect);

//   // Files Controller Routes
//   router.post('/files', FilesController.postUpload);
//   router.get('/files/:id', FilesController.getShow);
//   router.get('/files', FilesController.getIndex);
//   router.put('/files/:id/publish', FilesController.putPublish);
//   router.put('/files/:id/unpublish', FilesController.putUnpublish);
//   router.get('/files/:id/data', FilesController.getFile);
// }

// export default controllerRouting;



import express from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';
import FilesController from '../controllers/FilesController.js';

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);

  // App Controller Routes
  router.get('/status', AppController.getStatus);
  router.get('/stats', AppController.getStats);

  // User Controller Routes
  router.post('/users', UsersController.postNew);
  router.get('/users/me', UsersController.getMe);

  // Auth Controller Routes
  router.get('/connect', AuthController.getConnect);
  router.get('/disconnect', AuthController.getDisconnect);

  // Files Controller Routes
  router.post('/files', FilesController.postUpload);
  router.get('/files/:id', FilesController.getShow);
  router.get('/files', FilesController.getIndex);
  router.put('/files/:id/publish', FilesController.putPublish);
  router.put('/files/:id/unpublish', FilesController.putUnpublish);
  router.get('/files/:id/data', FilesController.getFile);
}

export default controllerRouting;
