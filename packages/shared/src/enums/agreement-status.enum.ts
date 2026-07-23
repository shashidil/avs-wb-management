export const AGREEMENT_STATUSES = ['active', 'expired', 'terminated', 'pending'] as const;

export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];
