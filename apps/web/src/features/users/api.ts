import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppUser, InviteUserInput, UpdateUserInput } from '@weighbridge/shared';
import { apiFetch } from '@/lib/api';

export function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch<AppUser[]>('/users'),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteUserInput) =>
      apiFetch<AppUser>('/users/invite', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) =>
      apiFetch<AppUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
