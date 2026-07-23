import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/useCurrentUser';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
