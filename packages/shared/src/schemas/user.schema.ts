import { z } from 'zod';
import { USER_ROLES } from '../enums/user-role.enum';

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().optional().or(z.literal('')),
  role: z.enum(USER_ROLES),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
