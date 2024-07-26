import express from 'express';
import { prisma } from '../app';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ message: 'Test route is working!', users });
});

export default router;
