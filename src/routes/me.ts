import express from 'express';
import authMiddleware from '../middleware/auth';
import { authenticate } from '../controllers/authController';

const router = express.Router();

router.use(authMiddleware)

router.get('/', authenticate)

export default router;
