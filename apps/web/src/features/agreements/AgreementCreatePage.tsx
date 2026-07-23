import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AgreementForm } from './AgreementForm';
import { useCreateAgreement } from './api';

export function AgreementCreatePage() {
  const navigate = useNavigate();
  const createAgreement = useCreateAgreement();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          to="/agreements"
          className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to agreements
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New agreement</h1>
      </div>
      <AgreementForm
        submitLabel="Create agreement"
        onSubmit={async (values) => {
          const agreement = await createAgreement.mutateAsync(values);
          navigate(`/agreements/${agreement.id}/edit`);
        }}
      />
    </div>
  );
}
