import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Agreement, AgreementInput } from '@weighbridge/shared';
import { apiFetch, apiFetchRaw } from '@/lib/api';

interface AgreementFilters {
  clientId?: string;
  status?: string;
}

function buildQuery(filters: AgreementFilters): string {
  const params = new URLSearchParams();
  if (filters.clientId) params.set('clientId', filters.clientId);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAgreements(filters: AgreementFilters = {}) {
  return useQuery<Agreement[]>({
    queryKey: ['agreements', filters],
    queryFn: () => apiFetch<Agreement[]>(`/agreements${buildQuery(filters)}`),
  });
}

export function useAgreement(id: string | undefined) {
  return useQuery<Agreement>({
    queryKey: ['agreements', id],
    queryFn: () => apiFetch<Agreement>(`/agreements/${id}`),
    enabled: !!id,
  });
}

export function useCreateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgreementInput) =>
      apiFetch<Agreement>('/agreements', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agreements'] }),
  });
}

export function useUpdateAgreement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgreementInput) =>
      apiFetch<Agreement>(`/agreements/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agreements'] }),
  });
}

export function useUploadAgreementDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiFetchRaw<Agreement>(`/agreements/${id}/document`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agreements'] }),
  });
}

export async function fetchAgreementDocumentUrl(id: string): Promise<string> {
  const { url } = await apiFetch<{ url: string }>(`/agreements/${id}/document-url`);
  return url;
}
