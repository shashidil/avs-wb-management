import type { LicenceStatus } from '../enums/licence-status.enum';

export interface Licence {
  id: string;
  clientId: string | null;
  clientName: string | null;
  siteName: string | null;
  licenceNo: string;
  issuingAuthority: string | null;
  issueDate: string | null;
  expiryDate: string;
  status: LicenceStatus;
  documentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
