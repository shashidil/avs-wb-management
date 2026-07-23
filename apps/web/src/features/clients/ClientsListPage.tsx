import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, UserX } from 'lucide-react';
import { useClients, useDeactivateClient } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function ClientsListPage() {
  const [search, setSearch] = useState('');
  const { data: clients, isLoading, error } = useClients(search);
  const deactivate = useDeactivateClient();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client records.</p>
        </div>
        <Link to="/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            New client
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <Card className="divide-y overflow-hidden p-0">
        {clients?.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{client.name}</p>
                {!client.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {[client.contactPerson, client.phone].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link to={`/clients/${client.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              {client.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => deactivate.mutate(client.id)}
                  disabled={deactivate.isPending}
                >
                  <UserX className="h-3.5 w-3.5" />
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        ))}
        {clients?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No clients found.</p>
        )}
      </Card>
    </div>
  );
}
