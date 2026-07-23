import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

export const DOCUMENTS_BUCKET = 'documents';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async onModuleInit() {
    const { data: buckets, error } = await this.supabase.storage.listBuckets();
    if (error) {
      this.logger.warn(`Could not list storage buckets: ${error.message}`);
      return;
    }

    if (!buckets.some((bucket) => bucket.name === DOCUMENTS_BUCKET)) {
      const { error: createError } = await this.supabase.storage.createBucket(DOCUMENTS_BUCKET, {
        public: false,
      });
      if (createError) {
        this.logger.warn(`Could not create "${DOCUMENTS_BUCKET}" bucket: ${createError.message}`);
      } else {
        this.logger.log(`Created storage bucket "${DOCUMENTS_BUCKET}"`);
      }
    }
  }

  async upload(path: string, file: Express.Multer.File): Promise<string> {
    const { error } = await this.supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });

    if (error) throw error;
    return path;
  }

  async getSignedUrl(path: string, expiresInSeconds = 60 * 5): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) throw error ?? new Error('Could not create signed URL');
    return data.signedUrl;
  }
}
