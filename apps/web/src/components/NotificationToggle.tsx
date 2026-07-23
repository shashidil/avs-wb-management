import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPushSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

export function NotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) return;
    setSupported(true);
    getPushSubscription().then((sub) => setSubscribed(!!sub));
  }, []);

  if (!supported) return null;

  const toggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        await subscribeToPush();
        setSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        disabled={loading}
        title={subscribed ? 'Disable push notifications' : 'Enable push notifications'}
      >
        {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </Button>
      {error && (
        <p className="absolute right-0 top-full z-10 mt-1 w-48 rounded border bg-card p-2 text-xs text-destructive shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
