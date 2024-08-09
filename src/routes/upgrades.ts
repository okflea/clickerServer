import express from 'express';
import authMiddleware from '../middleware/auth';
import { getUpgrades, incrementUpgrade } from '../controllers/upgradeController';

const router = express.Router();

router.use(authMiddleware)

router.get('/', getUpgrades)
router.patch('/:id', incrementUpgrade)

export default router;
