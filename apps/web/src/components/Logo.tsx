import { cn } from '@/lib/utils';
import logoSrc from '@/assets/avs-logo.jpeg';

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src={logoSrc}
      alt="AVS"
      width={size}
      height={size}
      className={cn('shrink-0 rounded-md', className)}
    />
  );
}
