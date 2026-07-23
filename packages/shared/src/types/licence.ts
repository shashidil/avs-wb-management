import type { LicenceStatus } from '../enums/licence-status.enum';
import type { PaymentStatus } from '../enums/payment-status.enum';

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
  paymentStatus: PaymentStatus;
  documentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
