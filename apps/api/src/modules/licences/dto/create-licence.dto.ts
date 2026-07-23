import { LICENCE_STATUSES, PAYMENT_STATUSES, type LicenceStatus, type PaymentStatus } from '@weighbridge/shared';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateLicenceDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsString()
  @MinLength(1)
  licenceNo!: string;

  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsDateString()
  expiryDate!: string;

  @IsOptional()
  @IsIn(LICENCE_STATUSES)
  status?: LicenceStatus;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
