import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from './ClientForm';
import { useCreateClient } from './api';

export function ClientCreatePage() {
  const navigate = useNavigate();
  const createClient = useCreateClient();

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
        <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      </div>
      <ClientForm
        submitLabel="Create client"
        onSubmit={async (values) => {
          await createClient.mutateAsync(values);
          navigate('/clients');
        }}
      />
    </div>
  );
}
