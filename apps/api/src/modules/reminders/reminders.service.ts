import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReminderChannel } from '@weighbridge/shared';
import { SUPABASE_CLIENT } from '../../supabase/supabase.provider';
import { AgreementsService } from '../agreements/agreements.service';
import { LicencesService } from '../licences/licences.service';
import { PushService } from '../push/push.service';
import { addDays, todayInTimeZone } from './date.util';
import { buildReminderEmail } from './email-templates';

const THRESHOLDS = [90, 60, 30, 7];

type EntityType = 'agreement' | 'licence';

interface DueItem {
  entityType: EntityType;
  entityId: string;
  itemLabel: string;
  clientName: string | null;
  expiryDate: string;
  daysBefore: number;
}

export interface ReminderRunSummary {
  date: string;
  thresholds: number[];
  sent: number;
  skipped: number;
  failed: number;
  expiredSweep: { agreements: number; licences: number };
  errors: string[];
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
    private readonly agreementsService: AgreementsService,
    private readonly licencesService: LicencesService,
    private readonly pushService: PushService,
  ) {}

  /** Constructed lazily so a missing RESEND_API_KEY doesn't crash the whole app at boot. */
  private getResendClient(): Resend {
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY');
    return new Resend(apiKey);
  }

  async runDaily(): Promise<ReminderRunSummary> {
    const timeZone = this.config.get<string>('APP_TIMEZONE') ?? 'Asia/Colombo';
    const today = todayInTimeZone(timeZone);

    const summary: ReminderRunSummary = {
      date: today,
      thresholds: THRESHOLDS,
      sent: 0,
      skipped: 0,
      failed: 0,
      expiredSweep: { agreements: 0, licences: 0 },
      errors: [],
    };

    summary.expiredSweep.agreements = await this.agreementsService.sweepExpired(today);
    summary.expiredSweep.licences = await this.licencesService.sweepExpired(today);

    const recipients = this.getRecipients();
    const pushSubscriberCount = await this.pushService.subscriberCount().catch((err) => {
      this.logger.warn(`Could not check push subscribers, skipping push: ${err.message}`);
      return 0;
    });

    for (const daysBefore of THRESHOLDS) {
      const targetDate = addDays(today, daysBefore);

      const [dueAgreements, dueLicences] = await Promise.all([
        this.agreementsService.findAll({ status: 'active', expiryDate: targetDate }),
        this.licencesService.findAll({ status: 'active', expiryDate: targetDate }),
      ]);

      const dueItems: DueItem[] = [
        ...dueAgreements.map((a) => ({
          entityType: 'agreement' as const,
          entityId: a.id,
          itemLabel: a.title || a.clientName,
          clientName: a.clientName,
          expiryDate: a.expiryDate,
          daysBefore,
        })),
        ...dueLicences.map((l) => ({
          entityType: 'licence' as const,
          entityId: l.id,
          itemLabel: l.siteName || l.licenceNo,
          clientName: l.clientName,
          expiryDate: l.expiryDate,
          daysBefore,
        })),
      ];

      for (const item of dueItems) {
        await this.processEmailReminder(summary, recipients, item);
        if (pushSubscriberCount > 0) {
          await this.processPushReminder(summary, item);
        }
      }
    }

    return summary;
  }

  private getRecipients(): string[] {
    const raw = this.config.get<string>('REMINDER_RECIPIENTS') ?? '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private async alreadyLogged(item: DueItem, channel: ReminderChannel): Promise<boolean | null> {
    const { data, error } = await this.supabase
      .from('reminder_logs')
      .select('id')
      .eq('entity_type', item.entityType)
      .eq('entity_id', item.entityId)
      .eq('days_before', item.daysBefore)
      .eq('channel', channel)
      .maybeSingle();

    if (error) return null;
    return !!data;
  }

  private async processEmailReminder(
    summary: ReminderRunSummary,
    recipients: string[],
    item: DueItem,
  ): Promise<void> {
    const existing = await this.alreadyLogged(item, 'email');
    if (existing === null) {
      summary.errors.push(`Check failed for ${item.entityType} ${item.entityId} (email)`);
      return;
    }
    if (existing) {
      summary.skipped++;
      return;
    }

    if (recipients.length === 0) {
      summary.failed++;
      summary.errors.push('REMINDER_RECIPIENTS is not configured; no email sent');
      await this.logAttempt(item, 'email', '', 'failed');
      return;
    }

    const { subject, html } = buildReminderEmail({
      entityType: item.entityType,
      itemLabel: item.itemLabel,
      clientName: item.clientName,
      expiryDate: item.expiryDate,
      daysBefore: item.daysBefore,
    });

    try {
      const fromAddress = this.config.getOrThrow<string>('REMINDER_FROM_EMAIL');
      const { error: sendError } = await this.getResendClient().emails.send({
        from: fromAddress,
        to: recipients,
        subject,
        html,
      });

      if (sendError) throw new Error(sendError.message);

      summary.sent++;
      await this.logAttempt(item, 'email', recipients.join(','), 'sent');
    } catch (err) {
      summary.failed++;
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Email reminder failed for ${item.entityType} ${item.entityId}: ${message}`);
      summary.errors.push(`Email send failed for ${item.entityType} ${item.entityId}: ${message}`);
      await this.logAttempt(item, 'email', recipients.join(','), 'failed');
    }
  }

  /** Best-effort: only attempted when at least one device is subscribed. */
  private async processPushReminder(summary: ReminderRunSummary, item: DueItem): Promise<void> {
    const existing = await this.alreadyLogged(item, 'push');
    if (existing === null) {
      summary.errors.push(`Check failed for ${item.entityType} ${item.entityId} (push)`);
      return;
    }
    if (existing) {
      summary.skipped++;
      return;
    }

    try {
      const kind = item.entityType === 'agreement' ? 'Agreement' : 'Licence';
      const { sent, failed } = await this.pushService.sendToAll({
        title: `${kind} expiring in ${item.daysBefore} days`,
        body: item.itemLabel,
      });

      summary.sent += sent > 0 ? 1 : 0;
      summary.failed += sent === 0 && failed > 0 ? 1 : 0;
      await this.logAttempt(item, 'push', `${sent} device(s)`, sent > 0 ? 'sent' : 'failed');
    } catch (err) {
      summary.failed++;
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Push reminder failed for ${item.entityType} ${item.entityId}: ${message}`);
      summary.errors.push(`Push send failed for ${item.entityType} ${item.entityId}: ${message}`);
      await this.logAttempt(item, 'push', '', 'failed');
    }
  }

  private async logAttempt(
    item: Pick<DueItem, 'entityType' | 'entityId' | 'daysBefore'>,
    channel: ReminderChannel,
    recipient: string,
    status: 'sent' | 'failed',
  ): Promise<void> {
    const { error } = await this.supabase.from('reminder_logs').insert({
      entity_type: item.entityType,
      entity_id: item.entityId,
      days_before: item.daysBefore,
      channel,
      recipient,
      status,
    });

    // 23505 = unique_violation: a concurrent run already logged this reminder. Not an error.
    if (error && error.code !== '23505') {
      this.logger.error(`Failed to log reminder attempt: ${error.message}`);
    }
  }
}
