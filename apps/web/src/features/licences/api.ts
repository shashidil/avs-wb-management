import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Licence, LicenceInput } from '@weighbridge/shared';
import { apiFetch, apiFetchRaw } from '@/lib/api';

interface LicenceFilters {
  clientId?: string;
  status?: string;
}

function buildQuery(filters: LicenceFilters): string {
  const params = new URLSearchParams();
  if (filters.clientId) params.set('clientId', filters.clientId);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useLicences(filters: LicenceFilters = {}) {
  return useQuery<Licence[]>({
    queryKey: ['licences', filters],
    queryFn: () => apiFetch<Licence[]>(`/licences${buildQuery(filters)}`),
  });
}

export function useLicence(id: string | undefined) {
  return useQuery<Licence>({
    queryKey: ['licences', id],
    queryFn: () => apiFetch<Licence>(`/licences/${id}`),
    enabled: !!id,
  });
}

export function useCreateLicence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LicenceInput) =>
      apiFetch<Licence>('/licences', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licences'] }),
  });
}

export function useUpdateLicence(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LicenceInput) =>
      apiFetch<Licence>(`/licences/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licences'] }),
  });
}

export function useUploadLicenceDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiFetchRaw<Licence>(`/licences/${id}/document`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licences'] }),
  });
}

export async function fetchLicenceDocumentUrl(id: string): Promise<string> {
  const { url } = await apiFetch<{ url: string }>(`/licences/${id}/document-url`);
  return url;
}
