import { formatDate, daysUntil, getUrgencyBucket, URGENCY_TEXT_CLASS } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ExpiryCell({ expiryDate, status }: { expiryDate: string; status: string }) {
  const days = daysUntil(expiryDate);
  const isTracked = status === 'active' || status === 'pending';
  const colorClass = isTracked ? cn(URGENCY_TEXT_CLASS[getUrgencyBucket(days)], 'font-medium') : 'text-muted-foreground';

  return (
    <span className={cn('text-sm', colorClass)}>
      {formatDate(expiryDate)}
      {isTracked && (
        <span className="ml-1 text-xs opacity-80">
          ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`})
        </span>
      )}
    </span>
  );
}
