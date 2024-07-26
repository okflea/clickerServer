import express from 'express';
import authMiddleware from '../middleware/auth';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/usersController';

const router = express.Router();

router.use(authMiddleware)

router.get('/', getUsers)
router.post('/', createUser)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUser)

export default router;
