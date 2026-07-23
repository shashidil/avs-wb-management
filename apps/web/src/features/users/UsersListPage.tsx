import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { setPasswordSchema, USER_ROLES, type SetPasswordInput, type UserRole } from '@weighbridge/shared';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreateUserForm } from './CreateUserForm';
import { useDeleteUser, useSetPassword, useUpdateUser, useUsers } from './api';

export function UsersListPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: users, isLoading, error } = useUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Add staff and manage roles.</p>
      </div>

      <CreateUserForm />

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <Card className="max-w-xl divide-y overflow-hidden p-0">
        {users?.map((user) => (
          <UserRow key={user.id} user={user} isSelf={user.id === currentUser?.id} />
        ))}
        {users?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No users yet.</p>
        )}
      </Card>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
}: {
  user: { id: string; email: string; fullName: string | null; role: UserRole; isActive: boolean };
  isSelf: boolean;
}) {
  const updateUser = useUpdateUser(user.id);
  const deleteUser = useDeleteUser();
  const [changingPassword, setChangingPassword] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  const handleDelete = () => {
    if (
      !window.confirm(
        `Permanently delete ${user.fullName || user.email}? They will lose access immediately. This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteUser.mutate(user.id);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{user.fullName || user.email}</p>
            {!user.isActive && <Badge variant="secondary">Inactive</Badge>}
            {isSelf && <Badge variant="outline">You</Badge>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          {justChanged && <p className="text-xs text-muted-foreground">Password updated.</p>}
          {deleteUser.isError && (
            <p className="text-xs text-destructive">{(deleteUser.error as Error).message}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select
            className="w-auto"
            value={user.role}
            disabled={isSelf || updateUser.isPending}
            onChange={(e) => updateUser.mutate({ role: e.target.value as UserRole })}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </Select>

          <Button
            variant="outline"
            size="sm"
            disabled={isSelf || updateUser.isPending}
            onClick={() => updateUser.mutate({ isActive: !user.isActive })}
          >
            {user.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setJustChanged(false);
              setChangingPassword((open) => !open);
            }}
          >
            {changingPassword ? 'Cancel' : 'Change password'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={isSelf || deleteUser.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {changingPassword && (
        <ChangePasswordForm
          userId={user.id}
          onDone={() => {
            setChangingPassword(false);
            setJustChanged(true);
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const setPassword = useSetPassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({ resolver: zodResolver(setPasswordSchema) });

  const onSubmit = async (values: SetPasswordInput) => {
    try {
      await setPassword.mutateAsync({ id: userId, password: values.password });
      onDone();
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Could not update password' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-start gap-2 rounded-md border bg-muted/30 p-3">
      <div className="flex flex-col gap-1">
        <Input type="password" placeholder="New password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Input
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
      {errors.root && <p className="w-full text-xs text-destructive">{errors.root.message}</p>}
    </form>
  );
}
