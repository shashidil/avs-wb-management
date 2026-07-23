import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit, setJsonContentType: boolean): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (setJsonContentType) headers.set('Content-Type', 'application/json');
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

/** JSON requests. */
export function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, true);
}

/** For FormData bodies (e.g. file uploads) — lets the browser set its own Content-Type. */
export function apiFetchRaw<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, false);
}
