import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ScrollText } from 'lucide-react';
import { useAgreements } from '@/features/agreements/api';
import { useLicences } from '@/features/licences/api';
import { useClients } from '@/features/clients/api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  formatDate,
  daysUntil,
  getUrgencyBucket,
  URGENCY_LABEL,
  URGENCY_EMOJI,
  URGENCY_TEXT_CLASS,
  type UrgencyBucket,
} from '@/lib/format';
import { cn } from '@/lib/utils';

type EntityTypeFilter = 'all' | 'agreement' | 'licence';

const STATUS_OPTIONS = ['active', 'pending', 'expired', 'terminated', 'suspended'];
const BUCKETS: UrgencyBucket[] = ['red', 'orange', 'yellow', 'green'];
const DEFAULT_WINDOW_DAYS = 30;

interface ExpiringItem {
  id: string;
  entityType: 'agreement' | 'licence';
  primaryLabel: string;
  secondaryLabel: string;
  clientId: string | null;
  status: string;
  expiryDate: string;
  editHref: string;
}

export function DashboardPage() {
  const [entityType, setEntityType] = useState<EntityTypeFilter>('licence');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('active');
  const [windowDays, setWindowDays] = useState<number | null>(DEFAULT_WINDOW_DAYS);

  const { data: clients } = useClients();
  const { data: agreements, isLoading: agreementsLoading } = useAgreements({
    clientId: clientId || undefined,
  });
  const { data: licences, isLoading: licencesLoading } = useLicences({
    clientId: clientId || undefined,
  });

  const isLoading = agreementsLoading || licencesLoading;

  const items = useMemo<ExpiringItem[]>(() => {
    const result: ExpiringItem[] = [];

    if (entityType !== 'licence') {
      for (const a of agreements ?? []) {
        if (status && a.status !== status) continue;
        result.push({
          id: a.id,
          entityType: 'agreement',
          primaryLabel: a.title || a.clientName,
          secondaryLabel: [a.clientName, a.type].filter(Boolean).join(' · '),
          clientId: a.clientId,
          status: a.status,
          expiryDate: a.expiryDate,
          editHref: `/agreements/${a.id}/edit`,
        });
      }
    }

    if (entityType !== 'agreement') {
      for (const l of licences ?? []) {
        if (status && l.status !== status) continue;
        result.push({
          id: l.id,
          entityType: 'licence',
          primaryLabel: l.siteName || l.licenceNo,
          secondaryLabel: [l.licenceNo, l.clientName].filter(Boolean).join(' · '),
          clientId: l.clientId,
          status: l.status,
          expiryDate: l.expiryDate,
          editHref: `/licences/${l.id}/edit`,
        });
      }
    }

    const withinWindow =
      windowDays === null ? result : result.filter((item) => daysUntil(item.expiryDate) <= windowDays);

    return withinWindow.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }, [agreements, licences, entityType, status, windowDays]);

  const grouped = useMemo(() => {
    const map: Record<UrgencyBucket, ExpiringItem[]> = { red: [], orange: [], yellow: [], green: [] };
    for (const item of items) {
      map[getUrgencyBucket(daysUntil(item.expiryDate))].push(item);
    }
    return map;
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {windowDays === null
            ? 'Agreements and licences by urgency, soonest first.'
            : `Licences expiring within ${windowDays} days, soonest first.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={windowDays === null ? 'all' : String(windowDays)}
          onChange={(e) => setWindowDays(e.target.value === 'all' ? null : Number(e.target.value))}
          className="w-auto"
        >
          <option value={DEFAULT_WINDOW_DAYS}>Next 30 days</option>
          <option value="all">All upcoming</option>
        </Select>

        <Select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as EntityTypeFilter)}
          className="w-auto"
        >
          <option value="all">All types</option>
          <option value="agreement">Agreements</option>
          <option value="licence">Licences</option>
        </Select>

        <Select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-auto">
          <option value="">All clients</option>
          {(clients ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!isLoading && items.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nothing matches these filters.
        </Card>
      )}

      {!isLoading &&
        BUCKETS.map(
          (bucket) =>
            grouped[bucket].length > 0 && (
              <section key={bucket} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {URGENCY_EMOJI[bucket]} {URGENCY_LABEL[bucket]}{' '}
                  <span className="font-normal">({grouped[bucket].length})</span>
                </h2>
                <Card className="divide-y overflow-hidden p-0">
                  {grouped[bucket].map((item) => (
                    <ExpiringRow key={`${item.entityType}-${item.id}`} item={item} bucket={bucket} />
                  ))}
                </Card>
              </section>
            ),
        )}
    </div>
  );
}

function ExpiringRow({ item, bucket }: { item: ExpiringItem; bucket: UrgencyBucket }) {
  const days = daysUntil(item.expiryDate);
  const Icon = item.entityType === 'agreement' ? FileText : ScrollText;

  return (
    <Link
      to={item.editHref}
      className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{item.primaryLabel}</p>
            <Badge variant="secondary" className="capitalize">
              {item.status}
            </Badge>
          </div>
          {item.secondaryLabel && (
            <p className="truncate text-sm text-muted-foreground">{item.secondaryLabel}</p>
          )}
        </div>
      </div>
      <div className={cn('shrink-0 text-right text-sm font-medium', URGENCY_TEXT_CLASS[bucket])}>
        {formatDate(item.expiryDate)}
        <div className="text-xs font-normal opacity-80">
          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
        </div>
      </div>
    </Link>
  );
}
