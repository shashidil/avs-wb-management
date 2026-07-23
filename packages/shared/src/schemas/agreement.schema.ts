import { z } from 'zod';
import { AGREEMENT_STATUSES } from '../enums/agreement-status.enum';
import { PAYMENT_STATUSES } from '../enums/payment-status.enum';

export const agreementSchema = z.object({
  clientId: z.string().uuid('Select a client'),
  title: z.string().optional().or(z.literal('')),
  type: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  value: z.number().nonnegative().optional(),
  status: z.enum(AGREEMENT_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  notes: z.string().optional().or(z.literal('')),
});

export type AgreementInput = z.infer<typeof agreementSchema>;
