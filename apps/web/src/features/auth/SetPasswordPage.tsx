import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { setPasswordSchema, type SetPasswordInput } from '@weighbridge/shared';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useSession } from './useSession';

export function SetPasswordPage({ onDone }: { onDone: () => void }) {
  const { session, loading } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({ resolver: zodResolver(setPasswordSchema) });

  const onSubmit = async (values: SetPasswordInput) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    window.history.replaceState(null, '', window.location.pathname);
    onDone();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo size={48} className="mb-2" />
          <CardTitle>Set your password</CardTitle>
          <CardDescription>Choose a password to finish setting up your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          ) : !session ? (
            <p className="text-center text-sm text-destructive">
              This link is invalid or has expired. Ask an admin to send you a new invite or reset link.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

              <Button type="submit" disabled={isSubmitting} className="mt-1">
                {isSubmitting ? 'Saving...' : 'Save password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
