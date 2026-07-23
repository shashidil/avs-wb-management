import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AGREEMENT_STATUSES, PAYMENT_STATUSES, type AgreementStatus, type PaymentStatus } from '@weighbridge/shared';
import { useAgreements } from './api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ExpiryCell } from '@/components/ExpiryCell';
import { cn } from '@/lib/utils';

const STATUS_BADGE_VARIANT: Record<AgreementStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  pending: 'secondary',
  expired: 'destructive',
  terminated: 'destructive',
};

const PAYMENT_BADGE_VARIANT: Record<PaymentStatus, 'default' | 'secondary'> = {
  paid: 'default',
  pending: 'secondary',
};

export function AgreementsListPage() {
  const [status, setStatus] = useState<AgreementStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const { data: agreements, isLoading, error } = useAgreements({
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agreements</h1>
          <p className="text-sm text-muted-foreground">Track client agreements and expiry.</p>
        </div>
        <Link to="/agreements/new">
          <Button>
            <Plus className="h-4 w-4" />
            New agreement
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip label="All" active={status === ''} onClick={() => setStatus('')} />
        {AGREEMENT_STATUSES.map((s) => (
          <FilterChip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Payment:</span>
        <FilterChip
          label="All"
          active={paymentStatus === ''}
          onClick={() => setPaymentStatus('')}
        />
        {PAYMENT_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={paymentStatus === s}
            onClick={() => setPaymentStatus(s)}
          />
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <Card className="divide-y overflow-hidden p-0">
        {agreements?.map((agreement) => (
          <Link
            key={agreement.id}
            to={`/agreements/${agreement.id}/edit`}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{agreement.title || agreement.clientName}</p>
                <Badge variant={STATUS_BADGE_VARIANT[agreement.status]} className="capitalize">
                  {agreement.status}
                </Badge>
                <Badge variant={PAYMENT_BADGE_VARIANT[agreement.paymentStatus]} className="capitalize">
                  {agreement.paymentStatus}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {agreement.clientName}
                {agreement.type && ` · ${agreement.type}`}
              </p>
            </div>
            <ExpiryCell expiryDate={agreement.expiryDate} status={agreement.status} />
          </Link>
        ))}
        {agreements?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No agreements found.</p>
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
