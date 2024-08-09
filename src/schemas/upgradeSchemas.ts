import { z } from "zod";

export const upgradePatchRequestSchema = z.object({
  cost: z.number().positive({ message: 'Cost must be positive' }),
})
