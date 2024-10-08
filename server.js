import express from 'express';
import controllerRouting from './routes/index';

const app = express();
const port = 5000;

app.use(express.json());

// Set up routing
controllerRouting(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
