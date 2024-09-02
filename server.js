import express from 'express';
import controllerRouting from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Load all routes from the routes/index.js file
controllerRouting(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
