import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUser } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { CreateUserDto } from './dto/create-user.dto';
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

  /** Admin sets the password directly — no invite email involved. */
  async create(dto: CreateUserDto): Promise<AppUser> {
    const { data: created, error: createError } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { full_name: dto.fullName },
    });

    if (createError || !created.user) {
      throw new ConflictException(createError?.message ?? 'Could not create user');
    }

    const { data, error } = await this.supabase
      .from('app_users')
      .insert({
        id: created.user.id,
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

  async remove(id: string): Promise<void> {
    const { data: existing, error: findError } = await this.supabase
      .from('app_users')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) throw new NotFoundException('User not found');

    // app_users and push_subscriptions cascade-delete from auth.users, so this alone is enough.
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  /** Admin sets a new password directly — no reset email involved. */
  async setPassword(id: string, password: string): Promise<void> {
    const { data: existing, error: findError } = await this.supabase
      .from('app_users')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) throw new NotFoundException('User not found');

    const { error } = await this.supabase.auth.admin.updateUserById(id, { password });
    if (error) throw error;
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
