import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppUser, CreateUserInput, UpdateUserInput } from '@weighbridge/shared';
import { apiFetch } from '@/lib/api';

export function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch<AppUser[]>('/users'),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      apiFetch<AppUser>('/users', { method: 'POST', body: JSON.stringify(input) }),
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

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiFetch<void>(`/users/${id}/set-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  });
}
