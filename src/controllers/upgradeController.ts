import { Request, Response } from "express";
import { prisma } from "../app";
import { upgradePatchRequestSchema } from "../schemas/upgradeSchemas";
import { z } from "zod";

export const getUpgrades = async (req: Request, res: Response) => {
  try {

    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const upgrades = await prisma.upgrades.findMany({
      where: {
        userId
      }
    });
    res.status(200).json(upgrades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
//increment level
export const incrementUpgrade = async (req: Request, res: Response) => {
  try {
    //upgrade id
    const { id } = req.params;
    //cost 
    const { cost } = upgradePatchRequestSchema.parse(req.body);
    //userId
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const upgrade = await prisma.upgrades.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    });
    if (!upgrade) {
      return res.status(404).json({ error: 'Upgrade not found' });
    }
    if (upgrade.userId !== req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const newUpgrade = await prisma.upgrades.update({
      where: { id },
      data: {
        level: {
          increment: 1
        }
      }
    });

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        bananas: {
          decrement: cost
        }
      }
    })
    res.status(200).json(newUpgrade);
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(401).json({ error: err.issues[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}
