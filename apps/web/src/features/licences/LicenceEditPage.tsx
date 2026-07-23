import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LicenceForm } from './LicenceForm';
import { useLicence, useUpdateLicence, useUploadLicenceDocument, fetchLicenceDocumentUrl } from './api';
import { DocumentUpload } from '@/components/DocumentUpload';

export function LicenceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: licence, isLoading, error } = useLicence(id);
  const updateLicence = useUpdateLicence(id!);
  const uploadDocument = useUploadLicenceDocument(id!);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (error || !licence) return <p className="text-sm text-destructive">Licence not found.</p>;

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
        <h1 className="text-2xl font-semibold tracking-tight">Edit licence</h1>
      </div>

      <LicenceForm
        defaultValues={licence}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateLicence.mutateAsync(values);
          navigate('/licences');
        }}
      />

      <div className="max-w-xl">
        <DocumentUpload
          hasDocument={!!licence.documentUrl}
          isUploading={uploadDocument.isPending}
          onUpload={(file) => uploadDocument.mutateAsync(file)}
          onView={() => fetchLicenceDocumentUrl(licence.id)}
        />
      </div>
    </div>
  );
}
