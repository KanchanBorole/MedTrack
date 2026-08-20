import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Pill, LayoutDashboard, Plus, Search, Map, LogOut, Menu, X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { roleLabel, initials } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/browse', label: 'Browse', icon: Search },
  { to: '/dashboard/add', label: 'Add Medicine', icon: Plus },
  { to: '/dashboard/map', label: 'Organizations', icon: Map },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 transition-colors duration-300">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Pill size={20} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg tracking-tight">MedTrack</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-600 dark:bg-primary-500" />
                )}
                <Icon size={18} className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
          {profile && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                {initials(profile.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{profile.full_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{roleLabel(profile.role)}</div>
              </div>
              <ThemeToggle />
            </div>
          )}
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-error-50 dark:hover:bg-error-950/30 hover:text-error-600 dark:hover:text-error-400 transition-all duration-200">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 z-30 flex items-center justify-between px-4 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center">
            <Pill size={18} />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">MedTrack</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <Menu size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl animate-slide-in-right transition-colors duration-300">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
                <X size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 inset-x-0 p-4 border-t border-gray-100 dark:border-gray-800">
              {profile && (
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-semibold text-sm">
                    {initials(profile.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{profile.full_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{roleLabel(profile.role)}</div>
                  </div>
                </div>
              )}
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-error-50 dark:hover:bg-error-950/30 hover:text-error-600 dark:hover:text-error-400 transition-colors">
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
