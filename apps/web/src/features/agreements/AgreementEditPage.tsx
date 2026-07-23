import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AgreementForm } from './AgreementForm';
import { useAgreement, useUpdateAgreement, useUploadAgreementDocument, fetchAgreementDocumentUrl } from './api';
import { DocumentUpload } from '@/components/DocumentUpload';

export function AgreementEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: agreement, isLoading, error } = useAgreement(id);
  const updateAgreement = useUpdateAgreement(id!);
  const uploadDocument = useUploadAgreementDocument(id!);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (error || !agreement) return <p className="text-sm text-destructive">Agreement not found.</p>;

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
        <h1 className="text-2xl font-semibold tracking-tight">Edit agreement</h1>
      </div>

      <AgreementForm
        defaultValues={agreement}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateAgreement.mutateAsync(values);
          navigate('/agreements');
        }}
      />

      <div className="max-w-xl">
        <DocumentUpload
          hasDocument={!!agreement.documentUrl}
          isUploading={uploadDocument.isPending}
          onUpload={(file) => uploadDocument.mutateAsync(file)}
          onView={() => fetchAgreementDocumentUrl(agreement.id)}
        />
      </div>
    </div>
  );
}
