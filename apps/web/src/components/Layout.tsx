import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FileText, LayoutDashboard, LogOut, Menu, ScrollText, UserCog, Users, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const items = user?.role === 'admin' ? [...navItems, { to: '/users', label: 'Users', icon: UserCog }] : navItems;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <Logo size={32} />
            <span className="text-base font-semibold tracking-tight">AVS WB Management</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
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

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <div className="text-right text-sm">
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

          <div className="flex items-center gap-2 md:hidden">
            <NotificationToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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

            {user && (
              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium leading-tight">{user.email}</p>
                <p className="text-xs capitalize leading-tight text-muted-foreground">{user.role}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setMenuOpen(false);
                supabase.auth.signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        )}
      </header>

      <InstallPrompt />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
