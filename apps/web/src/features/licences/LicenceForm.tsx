import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  licenceSchema,
  LICENCE_STATUSES,
  type Licence,
  type LicenceInput,
} from '@weighbridge/shared';
import { useClients } from '@/features/clients/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface LicenceFormProps {
  defaultValues?: Licence;
  submitLabel: string;
  onSubmit: (values: LicenceInput) => Promise<unknown>;
}

export function LicenceForm({ defaultValues, submitLabel, onSubmit }: LicenceFormProps) {
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LicenceInput>({
    resolver: zodResolver(licenceSchema),
    defaultValues: {
      clientId: defaultValues?.clientId ?? '',
      siteName: defaultValues?.siteName ?? '',
      licenceNo: defaultValues?.licenceNo ?? '',
      issuingAuthority: defaultValues?.issuingAuthority ?? '',
      issueDate: defaultValues?.issueDate ?? '',
      expiryDate: defaultValues?.expiryDate ?? '',
      status: defaultValues?.status ?? 'active',
      notes: defaultValues?.notes ?? '',
    },
  });

  const clientOptions = (clients ?? []).filter(
    (c) => c.isActive || c.id === defaultValues?.clientId,
  );

  const submit = async (values: LicenceInput) => {
    try {
      await onSubmit(values);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Licence no" htmlFor="licenceNo" error={errors.licenceNo?.message}>
              <Input id="licenceNo" {...register('licenceNo')} />
            </Field>

            <Field label="Status" htmlFor="status" error={errors.status?.message}>
              <Select id="status" {...register('status')}>
                {LICENCE_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Site name" htmlFor="siteName" error={errors.siteName?.message}>
              <Input id="siteName" placeholder="Weighbridge location" {...register('siteName')} />
            </Field>

            <Field
              label="Client (optional — own site if blank)"
              htmlFor="clientId"
              error={errors.clientId?.message}
            >
              <Select id="clientId" {...register('clientId')}>
                <option value="">No client (own site)</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Issuing authority"
              htmlFor="issuingAuthority"
              error={errors.issuingAuthority?.message}
            >
              <Input id="issuingAuthority" {...register('issuingAuthority')} />
            </Field>

            <Field label="Issue date" htmlFor="issueDate" error={errors.issueDate?.message}>
              <Input id="issueDate" type="date" {...register('issueDate')} />
            </Field>

            <Field label="Expiry date" htmlFor="expiryDate" error={errors.expiryDate?.message}>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
            </Field>

            <Field
              label="Notes"
              htmlFor="notes"
              error={errors.notes?.message}
              className="sm:col-span-2"
            >
              <Textarea id="notes" rows={3} {...register('notes')} />
            </Field>
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
