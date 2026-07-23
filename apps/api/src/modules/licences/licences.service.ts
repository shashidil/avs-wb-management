import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Licence } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { StorageService } from '../../storage/storage.service';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';

const SELECT_COLUMNS = `
  id, client_id, site_name, licence_no, issuing_authority, issue_date, expiry_date, status,
  document_url, notes, created_at, updated_at, clients ( name )
`;

interface LicenceFilters {
  clientId?: string;
  status?: string;
  expiryDate?: string;
}

@Injectable()
export class LicencesService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly storage: StorageService,
  ) {}

  async findAll(filters: LicenceFilters = {}): Promise<Licence[]> {
    let query = this.supabase.from('licences').select(SELECT_COLUMNS).order('expiry_date');

    if (filters.clientId) query = query.eq('client_id', filters.clientId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.expiryDate) query = query.eq('expiry_date', filters.expiryDate);

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapLicence);
  }

  /** Flips active licences past their expiry date to 'expired'. Returns the count affected. */
  async sweepExpired(today: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('licences')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_date', today)
      .select('id');

    if (error) throw error;
    return data?.length ?? 0;
  }

  async findOne(id: string): Promise<Licence> {
    const { data, error } = await this.supabase
      .from('licences')
      .select(SELECT_COLUMNS)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Licence not found');
    return mapLicence(data);
  }

  async create(dto: CreateLicenceDto): Promise<Licence> {
    const { data, error } = await this.supabase
      .from('licences')
      .insert({
        client_id: dto.clientId ?? null,
        site_name: dto.siteName,
        licence_no: dto.licenceNo,
        issuing_authority: dto.issuingAuthority,
        issue_date: dto.issueDate,
        expiry_date: dto.expiryDate,
        status: dto.status ?? 'active',
        notes: dto.notes,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapLicence(data);
  }

  async update(id: string, dto: UpdateLicenceDto): Promise<Licence> {
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('licences')
      .update({
        ...(dto.clientId !== undefined && { client_id: dto.clientId || null }),
        ...(dto.siteName !== undefined && { site_name: dto.siteName }),
        ...(dto.licenceNo !== undefined && { licence_no: dto.licenceNo }),
        ...(dto.issuingAuthority !== undefined && { issuing_authority: dto.issuingAuthority }),
        ...(dto.issueDate !== undefined && { issue_date: dto.issueDate }),
        ...(dto.expiryDate !== undefined && { expiry_date: dto.expiryDate }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapLicence(data);
  }

  async uploadDocument(id: string, file: Express.Multer.File): Promise<Licence> {
    await this.findOne(id);

    const path = `licences/${id}/${Date.now()}-${file.originalname}`;
    await this.storage.upload(path, file);

    const { data, error } = await this.supabase
      .from('licences')
      .update({ document_url: path })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapLicence(data);
  }

  async getDocumentUrl(id: string): Promise<string> {
    const licence = await this.findOne(id);
    if (!licence.documentUrl) throw new NotFoundException('No document uploaded');
    return this.storage.getSignedUrl(licence.documentUrl);
  }
}

function mapLicence(row: Record<string, any>): Licence {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name ?? null,
    siteName: row.site_name,
    licenceNo: row.licence_no,
    issuingAuthority: row.issuing_authority,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    status: row.status,
    documentUrl: row.document_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
