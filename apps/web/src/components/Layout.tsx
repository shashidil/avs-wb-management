import { Link, NavLink, Outlet } from 'react-router-dom';
import { FileText, LayoutDashboard, LogOut, ScrollText, UserCog, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { InstallPrompt } from '@/components/InstallPrompt';
import { NotificationToggle } from '@/components/NotificationToggle';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/agreements', label: 'Agreements', icon: FileText },
  { to: '/licences', label: 'Licences', icon: ScrollText },
];

export function Layout() {
  const { data: user } = useCurrentUser();
  const items = user?.role === 'admin' ? [...navItems, { to: '/users', label: 'Users', icon: UserCog }] : navItems;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-base font-semibold tracking-tight">AVS WB Management</span>
          </Link>

          <nav className="flex items-center gap-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium leading-tight">{user.email}</p>
                <p className="text-xs capitalize leading-tight text-muted-foreground">
                  {user.role}
                </p>
              </div>
            )}
            <NotificationToggle />
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <InstallPrompt />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
