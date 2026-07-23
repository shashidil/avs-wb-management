import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { inviteUserSchema, USER_ROLES, type InviteUserInput } from '@weighbridge/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useInviteUser } from './api';

export function InviteUserForm() {
  const inviteUser = useInviteUser();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '', fullName: '', role: 'staff' },
  });

  const onSubmit = async (values: InviteUserInput) => {
    try {
      await inviteUser.mutateAsync(values);
      reset({ email: '', fullName: '', role: 'staff' });
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Could not invite user' });
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Invite a staff member</h2>

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
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Sending invite...' : 'Send invite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
