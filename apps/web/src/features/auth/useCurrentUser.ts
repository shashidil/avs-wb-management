import { useQuery } from '@tanstack/react-query';
import type { AppUser } from '@weighbridge/shared';
import { apiFetch } from '../../lib/api';
import { useSession } from './useSession';

export function useCurrentUser() {
  const { session } = useSession();

  return useQuery<AppUser>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiFetch<AppUser>('/auth/me'),
    enabled: !!session,
  });
}
