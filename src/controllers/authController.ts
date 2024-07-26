import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(401).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '48h' });

    res.status(201).json({ token });
  } catch (err) {
    //check for zod error 
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '48h' });

    res.json({ token });
  } catch (err) {

    //check for zod error 
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
