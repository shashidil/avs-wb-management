import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from './ClientForm';
import { useClient, useUpdateClient } from './api';

export function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClient(id);
  const updateClient = useUpdateClient(id!);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (error || !client) return <p className="text-sm text-destructive">Client not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          to="/clients"
          className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to clients
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Edit client</h1>
      </div>
      <ClientForm
        defaultValues={client}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateClient.mutateAsync(values);
          navigate('/clients');
        }}
      />
    </div>
  );
}
