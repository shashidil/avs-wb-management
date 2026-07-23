import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUser } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SELECT_COLUMNS = 'id, email, full_name, role, is_active, created_at, updated_at';

@Injectable()
export class UsersService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<AppUser[]> {
    const { data, error } = await this.supabase
      .from('app_users')
      .select(SELECT_COLUMNS)
      .order('created_at');

    if (error) throw error;
    return data.map(mapAppUser);
  }

  async invite(dto: InviteUserDto): Promise<AppUser> {
    const { data: invited, error: inviteError } = await this.supabase.auth.admin.inviteUserByEmail(
      dto.email,
      { data: { full_name: dto.fullName } },
    );

    if (inviteError || !invited.user) {
      throw new ConflictException(inviteError?.message ?? 'Could not invite user');
    }

    const { data, error } = await this.supabase
      .from('app_users')
      .insert({
        id: invited.user.id,
        email: dto.email,
        full_name: dto.fullName || null,
        role: dto.role,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapAppUser(data);
  }

  async update(id: string, dto: UpdateUserDto): Promise<AppUser> {
    const { data: existing, error: findError } = await this.supabase
      .from('app_users')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) throw new NotFoundException('User not found');

    const { data, error } = await this.supabase
      .from('app_users')
      .update({
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return mapAppUser(data);
  }
}

function mapAppUser(row: Record<string, any>): AppUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
