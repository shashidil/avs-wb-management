import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  agreementSchema,
  AGREEMENT_STATUSES,
  type Agreement,
  type AgreementInput,
} from '@weighbridge/shared';
import { useClients } from '@/features/clients/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface AgreementFormProps {
  defaultValues?: Agreement;
  submitLabel: string;
  onSubmit: (values: AgreementInput) => Promise<unknown>;
}

export function AgreementForm({ defaultValues, submitLabel, onSubmit }: AgreementFormProps) {
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AgreementInput>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      clientId: defaultValues?.clientId ?? '',
      title: defaultValues?.title ?? '',
      type: defaultValues?.type ?? '',
      startDate: defaultValues?.startDate ?? '',
      expiryDate: defaultValues?.expiryDate ?? '',
      value: defaultValues?.value ?? undefined,
      status: defaultValues?.status ?? 'active',
      notes: defaultValues?.notes ?? '',
    },
  });

  const clientOptions = (clients ?? []).filter(
    (c) => c.isActive || c.id === defaultValues?.clientId,
  );

  const submit = async (values: AgreementInput) => {
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
            <Field label="Client" htmlFor="clientId" error={errors.clientId?.message}>
              <Select id="clientId" {...register('clientId')}>
                <option value="">Select a client...</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status" htmlFor="status" error={errors.status?.message}>
              <Select id="status" {...register('status')}>
                {AGREEMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Title" htmlFor="title" error={errors.title?.message}>
              <Input id="title" placeholder="e.g. Transport Agreement" {...register('title')} />
            </Field>

            <Field label="Type" htmlFor="type" error={errors.type?.message}>
              <Input id="type" placeholder="e.g. weighbridge service" {...register('type')} />
            </Field>

            <Field label="Start date" htmlFor="startDate" error={errors.startDate?.message}>
              <Input id="startDate" type="date" {...register('startDate')} />
            </Field>

            <Field label="Expiry date" htmlFor="expiryDate" error={errors.expiryDate?.message}>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
            </Field>

            <Field label="Value (LKR)" htmlFor="value" error={errors.value?.message}>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                {...register('value', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
              />
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
