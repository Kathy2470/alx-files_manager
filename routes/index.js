import express from 'express';
import AppController from '../controllers/AppController';

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);

  // Route for checking if Redis and DB are alive
  router.get('/status', AppController.getStatus);

  // Route for getting the number of users and files
  router.get('/stats', AppController.getStats);
}

export default controllerRouting;
