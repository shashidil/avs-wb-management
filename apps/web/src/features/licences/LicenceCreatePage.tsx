import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LicenceForm } from './LicenceForm';
import { useCreateLicence } from './api';

export function LicenceCreatePage() {
  const navigate = useNavigate();
  const createLicence = useCreateLicence();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          to="/licences"
          className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to licences
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New licence</h1>
      </div>
      <LicenceForm
        submitLabel="Create licence"
        onSubmit={async (values) => {
          const licence = await createLicence.mutateAsync(values);
          navigate(`/licences/${licence.id}/edit`);
        }}
      />
    </div>
  );
}
