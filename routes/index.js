import { Router } from 'express';
import FilesController from '../controllers/FilesController';

const router = Router();

router.post('/files', FilesController.postUpload);

export default router;
