import { z } from "zod";

export const userPatchRequestSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),
  isAdmin: z.boolean().optional(),
  email: z.string().email({ message: 'Invalid email' }),
  isBlocked: z.boolean().optional(),
});
export const userPostRequestSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),
  email: z.string()
    .email({ message: 'Invalid email' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(50, { message: 'Password must be at most 50 characters long' }),
  isAdmin: z.boolean().optional(),
});
