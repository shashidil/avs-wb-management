export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function daysUntil(value: string): number {
  const ms = new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'LKR' }).format(value);
}

export type UrgencyBucket = 'red' | 'orange' | 'yellow' | 'green';

/** Matches the buckets defined in .claude/architecture/reminders.md. */
export function getUrgencyBucket(daysLeft: number): UrgencyBucket {
  if (daysLeft <= 7) return 'red';
  if (daysLeft <= 30) return 'orange';
  if (daysLeft <= 90) return 'yellow';
  return 'green';
}

export const URGENCY_LABEL: Record<UrgencyBucket, string> = {
  red: 'Expired / due within 7 days',
  orange: 'Due in 8–30 days',
  yellow: 'Due in 31–90 days',
  green: 'Due in 90+ days',
};

export const URGENCY_EMOJI: Record<UrgencyBucket, string> = {
  red: '🔴',
  orange: '🟠',
  yellow: '🟡',
  green: '🟢',
};

export const URGENCY_TEXT_CLASS: Record<UrgencyBucket, string> = {
  red: 'text-red-600 dark:text-red-400',
  orange: 'text-orange-600 dark:text-orange-400',
  yellow: 'text-yellow-600 dark:text-yellow-500',
  green: 'text-green-700 dark:text-green-400',
};
