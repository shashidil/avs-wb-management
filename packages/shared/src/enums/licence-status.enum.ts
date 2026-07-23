export const LICENCE_STATUSES = ['active', 'expired', 'suspended', 'pending'] as const;

export type LicenceStatus = (typeof LICENCE_STATUSES)[number];
