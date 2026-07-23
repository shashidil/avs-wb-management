import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Client, ClientInput } from '@weighbridge/shared';
import { apiFetch } from '../../lib/api';

const clientsKey = (search?: string) => ['clients', { search: search ?? '' }] as const;

export function useClients(search?: string) {
  return useQuery<Client[]>({
    queryKey: clientsKey(search),
    queryFn: () =>
      apiFetch<Client[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });
}

export function useClient(id: string | undefined) {
  return useQuery<Client>({
    queryKey: ['clients', id],
    queryFn: () => apiFetch<Client>(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) =>
      apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) =>
      apiFetch<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useDeactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Client>(`/clients/${id}/deactivate`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}
