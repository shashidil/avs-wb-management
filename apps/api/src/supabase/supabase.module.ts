import { Global, Module } from '@nestjs/common';
import { SUPABASE_CLIENT, supabaseProvider } from './supabase.provider';

@Global()
@Module({
  providers: [supabaseProvider],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
