export const PAYMENT_STATUSES = ['pending', 'paid'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
