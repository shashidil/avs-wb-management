import { useRef, useState, type ChangeEvent } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentUploadProps {
  hasDocument: boolean;
  isUploading: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onView: () => Promise<string>;
}

export function DocumentUpload({ hasDocument, isUploading, onUpload, onView }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleView = async () => {
    setViewing(true);
    setError(null);
    try {
      const url = await onView();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open document');
    } finally {
      setViewing(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          Document (PDF)
        </div>

        <div className="flex flex-wrap gap-2">
          {hasDocument && (
            <Button type="button" variant="outline" size="sm" onClick={handleView} disabled={viewing}>
              {viewing ? 'Opening...' : 'View document'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? 'Uploading...' : hasDocument ? 'Replace document' : 'Upload document'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
