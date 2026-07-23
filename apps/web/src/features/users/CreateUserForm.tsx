import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createUserSchema, USER_ROLES, type CreateUserInput } from '@weighbridge/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateUser } from './api';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => chars[n % chars.length]).join('');
}

export function CreateUserForm() {
  const createUser = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', fullName: '', role: 'staff', password: '' },
  });

  const onSubmit = async (values: CreateUserInput) => {
    try {
      await createUser.mutateAsync(values);
      setCreatedCredential({ email: values.email, password: values.password });
      reset({ email: '', fullName: '', role: 'staff', password: '' });
      setShowPassword(false);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Could not create user' });
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Add a staff member</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...register('fullName')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select id="role" {...register('role')}>
                {USER_ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue('password', generatePassword(), { shouldValidate: true })}
                >
                  Generate
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this with the new user directly — there's no invite email.
              </p>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Creating...' : 'Create user'}
          </Button>
        </form>

        {createdCredential && (
          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">User created.</p>
            <p className="text-muted-foreground">
              {createdCredential.email} — password:{' '}
              <span className="font-mono font-medium text-foreground">{createdCredential.password}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Copy this now and share it with them — it won't be shown again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
