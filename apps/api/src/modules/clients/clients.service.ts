import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const SELECT_COLUMNS =
  'id, name, contact_person, phone, email, address, reg_no, notes, is_active, created_at, updated_at';

@Injectable()
export class ClientsService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findAll(search?: string): Promise<Client[]> {
    let query = this.supabase.from('clients').select(SELECT_COLUMNS).order('name');
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapClient);
  }

  async findOne(id: string): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .select(SELECT_COLUMNS)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Client not found');
    return mapClient(data);
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .insert({
        name: dto.name,
        contact_person: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        reg_no: dto.regNo,
        notes: dto.notes,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapClient(data);
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('clients')
      .update({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.contactPerson !== undefined && { contact_person: dto.contactPerson }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.regNo !== undefined && { reg_no: dto.regNo }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapClient(data);
  }

  async deactivate(id: string): Promise<Client> {
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapClient(data);
  }
}

function mapClient(row: Record<string, any>): Client {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    regNo: row.reg_no,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
