import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUser } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SELECT_COLUMNS = 'id, email, full_name, role, is_active, created_at, updated_at';

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  /** Where invite/recovery emails send the user back to, to set their password. */
  private acceptInviteUrl(): string {
    const webAppUrl = this.config.getOrThrow<string>('WEB_APP_URL').replace(/\/$/, '');
    return `${webAppUrl}/accept-invite`;
  }

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
      { data: { full_name: dto.fullName }, redirectTo: this.acceptInviteUrl() },
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

  async resetPassword(id: string): Promise<void> {
    const { data: existing, error: findError } = await this.supabase
      .from('app_users')
      .select('email')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) throw new NotFoundException('User not found');

    const { error } = await this.supabase.auth.resetPasswordForEmail(existing.email, {
      redirectTo: this.acceptInviteUrl(),
    });

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
