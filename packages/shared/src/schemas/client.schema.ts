import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  regNo: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type ClientInput = z.infer<typeof clientSchema>;
