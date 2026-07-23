import { AGREEMENT_STATUSES, PAYMENT_STATUSES, type AgreementStatus, type PaymentStatus } from '@weighbridge/shared';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAgreementDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsDateString()
  expiryDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsIn(AGREEMENT_STATUSES)
  status?: AgreementStatus;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
