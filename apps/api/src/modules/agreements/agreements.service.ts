import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Agreement } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { StorageService } from '../../storage/storage.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

const SELECT_COLUMNS = `
  id, client_id, title, type, start_date, expiry_date, value, status, payment_status,
  document_url, notes, created_at, updated_at, clients ( name )
`;

interface AgreementFilters {
  clientId?: string;
  status?: string;
  paymentStatus?: string;
  expiryDate?: string;
}

@Injectable()
export class AgreementsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly storage: StorageService,
  ) {}

  async findAll(filters: AgreementFilters = {}): Promise<Agreement[]> {
    let query = this.supabase.from('agreements').select(SELECT_COLUMNS).order('expiry_date');

    if (filters.clientId) query = query.eq('client_id', filters.clientId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
    if (filters.expiryDate) query = query.eq('expiry_date', filters.expiryDate);

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapAgreement);
  }

  /** Flips active agreements past their expiry date to 'expired'. Returns the count affected. */
  async sweepExpired(today: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('agreements')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_date', today)
      .select('id');

    if (error) throw error;
    return data?.length ?? 0;
  }

  async findOne(id: string): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .select(SELECT_COLUMNS)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Agreement not found');
    return mapAgreement(data);
  }

  async create(dto: CreateAgreementDto): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .insert({
        client_id: dto.clientId,
        title: dto.title,
        type: dto.type,
        start_date: dto.startDate,
        expiry_date: dto.expiryDate,
        value: dto.value,
        status: dto.status ?? 'active',
        payment_status: dto.paymentStatus ?? 'pending',
        notes: dto.notes,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapAgreement(data);
  }

  async update(id: string, dto: UpdateAgreementDto): Promise<Agreement> {
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('agreements')
      .update({
        ...(dto.clientId !== undefined && { client_id: dto.clientId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.startDate !== undefined && { start_date: dto.startDate }),
        ...(dto.expiryDate !== undefined && { expiry_date: dto.expiryDate }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.paymentStatus !== undefined && { payment_status: dto.paymentStatus }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapAgreement(data);
  }

  async uploadDocument(id: string, file: Express.Multer.File): Promise<Agreement> {
    await this.findOne(id);

    const path = `agreements/${id}/${Date.now()}-${file.originalname}`;
    await this.storage.upload(path, file);

    const { data, error } = await this.supabase
      .from('agreements')
      .update({ document_url: path })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapAgreement(data);
  }

  async getDocumentUrl(id: string): Promise<string> {
    const agreement = await this.findOne(id);
    if (!agreement.documentUrl) throw new NotFoundException('No document uploaded');
    return this.storage.getSignedUrl(agreement.documentUrl);
  }
}

function mapAgreement(row: Record<string, any>): Agreement {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name ?? '',
    title: row.title,
    type: row.type,
    startDate: row.start_date,
    expiryDate: row.expiry_date,
    value: row.value === null || row.value === undefined ? null : Number(row.value),
    status: row.status,
    paymentStatus: row.payment_status,
    documentUrl: row.document_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
