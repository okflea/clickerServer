import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin } = registerSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(401).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: { name, score: 0, email, password: hashedPassword, isAdmin, isBlocked: false },
    });
    //create initial level 0 upgrades
    await prisma.upgrades.create({
      data: {
        userId: user.id,
        level: 0,
        type: "LAB"
      }
    })
    await prisma.upgrades.create({
      data: {
        userId: user.id,
        level: 0,
        type: "MONKEY"
      }
    })
    const { password: serverPassword, ...userWithoutPassword } = user
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '48h' });

    res.status(201).json({ token, ...userWithoutPassword });
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
    const { password: serverPassword, ...userWithoutPassword } = user
    const isMatch = await bcrypt.compare(password, serverPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(401).json({ error: 'User is blocked' });
    }

    const payload = { user: { id: userWithoutPassword.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '48h' });
    res.json({ token, ...userWithoutPassword });
  } catch (err) {

    //check for zod error 
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

//authenticate 
export const authenticate = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBlocked: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        score: true,
        bananas: true
      }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
