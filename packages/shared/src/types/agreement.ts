import type { AgreementStatus } from '../enums/agreement-status.enum';

export interface Agreement {
  id: string;
  clientId: string;
  clientName: string;
  title: string | null;
  type: string | null;
  startDate: string | null;
  expiryDate: string;
  value: number | null;
  status: AgreementStatus;
  documentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
