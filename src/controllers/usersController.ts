import { Request, Response } from "express";
import { prisma } from "../app";
import { userPatchRequestSchema, userPostRequestSchema } from "../schemas/userSchemas";
import { z } from "zod";
import bcrypt from 'bcryptjs';

/**
 * create user
 * */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin } = userPostRequestSchema.parse(req.body);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, isAdmin, status: "OFFLINE" },
    });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * update user
 * */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { name, email, isAdmin, isBlocked } = userPatchRequestSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, isAdmin, isBlocked },
    });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}



/**
 * delete user
 **/
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isAdmin: true,
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(401).json({ error: 'Admins cannot be deleted' });
    }
    //if req.user.id is not admin
    const reqUser = await prisma.user.findUnique({
      where: { id: req.user?.id }, select: {
        id: true,
        isAdmin: true,
        isBlocked: true
      }
    });
    if (!reqUser?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized You are not an admin' });
    }
    if (reqUser.isBlocked) {
      return res.status(401).json({ error: 'Your account is blocked' });
    }
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}


/**
 * get all users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user?.id },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.isBlocked) {
      return res.status(401).json({ error: 'Your account is blocked' });
    }
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user?.id
        }
      },
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
      }
    });
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
