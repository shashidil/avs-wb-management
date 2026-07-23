import { z } from 'zod';
import { USER_ROLES } from '../enums/user-role.enum';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().optional().or(z.literal('')),
  role: z.enum(USER_ROLES),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
