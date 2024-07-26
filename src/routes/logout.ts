import express from 'express';
import { logout } from '../controllers/authController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware)

router.get('/', logout)

export default router;
