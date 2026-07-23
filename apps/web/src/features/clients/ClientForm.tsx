import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { clientSchema, type Client, type ClientInput } from '@weighbridge/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface ClientFormProps {
  defaultValues?: Client;
  submitLabel: string;
  onSubmit: (values: ClientInput) => Promise<unknown>;
}

export function ClientForm({ defaultValues, submitLabel, onSubmit }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      contactPerson: defaultValues?.contactPerson ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      address: defaultValues?.address ?? '',
      regNo: defaultValues?.regNo ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  const submit = async (values: ClientInput) => {
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
            <Field label="Name" htmlFor="name" error={errors.name?.message} className="sm:col-span-2">
              <Input id="name" {...register('name')} />
            </Field>

            <Field label="Contact person" htmlFor="contactPerson" error={errors.contactPerson?.message}>
              <Input id="contactPerson" {...register('contactPerson')} />
            </Field>

            <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" {...register('phone')} />
            </Field>

            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register('email')} />
            </Field>

            <Field label="Reg. no" htmlFor="regNo" error={errors.regNo?.message}>
              <Input id="regNo" {...register('regNo')} />
            </Field>

            <Field
              label="Address"
              htmlFor="address"
              error={errors.address?.message}
              className="sm:col-span-2"
            >
              <Input id="address" {...register('address')} />
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
