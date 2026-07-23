import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as webpush from 'web-push';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { SubscribeDto } from './dto/subscribe.dto';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private configured = false;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const publicKey = this.config.get<string>('WEB_PUSH_VAPID_PUBLIC');
    const privateKey = this.config.get<string>('WEB_PUSH_VAPID_PRIVATE');

    if (!publicKey || !privateKey) {
      this.logger.warn('WEB_PUSH_VAPID_PUBLIC/PRIVATE not configured; push notifications disabled.');
      return;
    }

    const fromEmail = this.config.get<string>('REMINDER_FROM_EMAIL') ?? 'admin@example.com';
    webpush.setVapidDetails(`mailto:${fromEmail}`, publicKey, privateKey);
    this.configured = true;
  }

  async subscribe(userId: string, sub: SubscribeDto): Promise<void> {
    const { error } = await this.supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      { onConflict: 'endpoint' },
    );

    if (error) throw error;
  }

  async unsubscribe(endpoint: string): Promise<void> {
    const { error } = await this.supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    if (error) throw error;
  }

  async subscriberCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  }

  /** Best-effort broadcast to every subscribed device. Prunes dead subscriptions. */
  async sendToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
    if (!this.configured) return { sent: 0, failed: 0 };

    const { data, error } = await this.supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (error) throw error;

    let sent = 0;
    let failed = 0;

    await Promise.all(
      (data ?? []).map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            JSON.stringify(payload),
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await this.supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
          } else {
            const message = err instanceof Error ? err.message : 'Unknown error';
            this.logger.warn(`Push send failed for ${row.endpoint}: ${message}`);
          }
        }
      }),
    );

    return { sent, failed };
  }
}
