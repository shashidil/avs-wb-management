import { z } from 'zod';
import { LICENCE_STATUSES } from '../enums/licence-status.enum';

export const licenceSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal('')),
  siteName: z.string().optional().or(z.literal('')),
  licenceNo: z.string().min(1, 'Licence number is required'),
  issuingAuthority: z.string().optional().or(z.literal('')),
  issueDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  status: z.enum(LICENCE_STATUSES),
  notes: z.string().optional().or(z.literal('')),
});

export type LicenceInput = z.infer<typeof licenceSchema>;
