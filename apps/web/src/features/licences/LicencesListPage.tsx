import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { LICENCE_STATUSES, type LicenceStatus } from '@weighbridge/shared';
import { useLicences } from './api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ExpiryCell } from '@/components/ExpiryCell';
import { cn } from '@/lib/utils';

const STATUS_BADGE_VARIANT: Record<LicenceStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  pending: 'secondary',
  expired: 'destructive',
  suspended: 'destructive',
};

export function LicencesListPage() {
  const [status, setStatus] = useState<LicenceStatus | ''>('');
  const { data: licences, isLoading, error } = useLicences({ status: status || undefined });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Licences</h1>
          <p className="text-sm text-muted-foreground">Weighbridge licences and expiry.</p>
        </div>
        <Link to="/licences/new">
          <Button>
            <Plus className="h-4 w-4" />
            New licence
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip label="All" active={status === ''} onClick={() => setStatus('')} />
        {LICENCE_STATUSES.map((s) => (
          <FilterChip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <Card className="divide-y overflow-hidden p-0">
        {licences?.map((licence) => (
          <Link
            key={licence.id}
            to={`/licences/${licence.id}/edit`}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">
                  {licence.siteName || licence.licenceNo}
                </p>
                <Badge variant={STATUS_BADGE_VARIANT[licence.status]} className="capitalize">
                  {licence.status}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {licence.licenceNo}
                {licence.clientName && ` · ${licence.clientName}`}
              </p>
            </div>
            <ExpiryCell expiryDate={licence.expiryDate} status={licence.status} />
          </Link>
        ))}
        {licences?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No licences found.</p>
        )}
      </Card>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-input text-muted-foreground hover:bg-accent',
      )}
    >
      {label}
    </button>
  );
}
