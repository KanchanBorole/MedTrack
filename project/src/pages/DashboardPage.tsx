import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Plus, Package, Bell, AlertTriangle, Search, Map,
  HeartHandshake, Pill, ArrowRight,
} from 'lucide-react';
import { supabase, type MedicineWithOwner, type Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { expiryStatus, expiryLabel, roleLabel } from '@/lib/utils';
import { useCountUp } from '@/lib/useCountUp';
import MedicineCard from '@/components/MedicineCard';
import PageHeader from '@/components/PageHeader';

interface DashboardData {
  myListings: MedicineWithOwner[];
  expiringSoon: MedicineWithOwner[];
  donations: MedicineWithOwner[];
  requests: MedicineWithOwner[];
  orgs: Profile[];
}

function AnimatedStatCard({
  label, value, icon: Icon, color, delay,
}: { label: string; value: number; icon: typeof Package; color: string; delay: number }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useCountUp(value, 1000, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up group bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/30"
    >
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-950/40 text-${color}-600 dark:text-${color}-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={20} />
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{counted}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const ownerId = profile.id;

      const [{ data: myListings }, { data: allDonate }, { data: allRequest }, { data: orgs }] = await Promise.all([
        supabase
          .from('medicines')
          .select('*, owner:profiles!medicines_owner_id_fkey(id, full_name, role, phone, city, address, latitude, longitude)')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('medicines')
          .select('*, owner:profiles!medicines_owner_id_fkey(id, full_name, role, phone, city, address, latitude, longitude)')
          .eq('listing_type', 'donate')
          .eq('status', 'available')
          .neq('owner_id', ownerId)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('medicines')
          .select('*, owner:profiles!medicines_owner_id_fkey(id, full_name, role, phone, city, address, latitude, longitude)')
          .eq('listing_type', 'request')
          .eq('status', 'available')
          .neq('owner_id', ownerId)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('profiles')
          .select('*')
          .in('role', ['ngo', 'hospital'])
          .limit(5),
      ]);

      const myList = (myListings as MedicineWithOwner[]) || [];
      const expiringSoon = myList.filter((m) => {
        const s = expiryStatus(m.expiry_date);
        return s === 'critical' || s === 'soon' || s === 'expired';
      });

      setData({
        myListings: myList,
        expiringSoon,
        donations: (allDonate as MedicineWithOwner[]) || [],
        requests: (allRequest as MedicineWithOwner[]) || [],
        orgs: (orgs as Profile[]) || [],
      });
      setLoading(false);
    })();
  }, [profile]);

  if (loading || !data || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-primary-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-r-secondary-400 rounded-full animate-spin-slow" />
        </div>
      </div>
    );
  }

  const isOrg = profile.role === 'ngo' || profile.role === 'hospital';
  const stats = [
    { label: 'My listings', value: data.myListings.length, icon: Package, color: 'primary' },
    { label: 'Expiring soon', value: data.expiringSoon.length, icon: Bell, color: 'warning' },
    { label: isOrg ? 'Donations available' : 'Donations to claim', value: data.donations.length, icon: HeartHandshake, color: 'success' },
    { label: 'Active requests', value: data.requests.length, icon: AlertTriangle, color: 'accent' },
  ];

  return (
    <div>
      <div className="animate-fade-in">
        <PageHeader
          title={`Welcome, ${profile.full_name.split(' ')[0]}`}
          subtitle={`${roleLabel(profile.role)} dashboard · ${profile.city || 'Location not set'}`}
          icon={LayoutDashboard}
          action={
            <Link to="/dashboard/add" className="btn-primary text-sm">
              <Plus size={18} /> Add medicine
            </Link>
          }
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <AnimatedStatCard key={stat.label} {...stat} delay={i * 80} />
        ))}
      </div>

      {/* Expiry reminders */}
      {data.expiringSoon.length > 0 && (
        <div className="card p-5 mb-8 border-warning-200 dark:border-warning-900/50 bg-gradient-to-br from-warning-50/50 to-white dark:from-warning-950/20 dark:to-gray-900 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning-400 to-warning-600" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-950/40 text-warning-700 dark:text-warning-400 flex items-center justify-center relative">
              <Bell size={16} />
              <div className="absolute inset-0 rounded-lg bg-warning-200 dark:bg-warning-900/40 animate-pulse-ring" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Expiry reminders</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning-100 dark:bg-warning-950/40 text-warning-700 dark:text-warning-400 font-medium animate-bounce-subtle">
              {data.expiringSoon.length} item{data.expiringSoon.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {data.expiringSoon.slice(0, 5).map((med, i) => {
              const status = expiryStatus(med.expiry_date);
              const isExpired = status === 'expired';
              return (
                <div
                  key={med.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-warning-100 dark:border-warning-900/30 hover:border-warning-300 dark:hover:border-warning-800 hover:shadow-sm transition-all animate-slide-up"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isExpired ? 'bg-error-100 dark:bg-error-950/40 text-error-600 dark:text-error-400' : 'bg-warning-100 dark:bg-warning-950/40 text-warning-600 dark:text-warning-400'
                  }`}>
                    <Pill size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{med.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{med.quantity} units</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${isExpired ? 'text-error-600 dark:text-error-400' : 'text-warning-700 dark:text-warning-400'}`}>
                      {expiryLabel(med.expiry_date)}
                    </div>
                    {!isExpired && (
                      <Link to="/dashboard/browse" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        Find recipient
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My listings */}
        <div className="animate-stagger-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">My listings</h2>
            <Link to="/dashboard/add" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline inline-flex items-center gap-1 group">
              Add new <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {data.myListings.length === 0 ? (
            <div className="card p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/20 text-primary-400 flex items-center justify-center mx-auto mb-3 animate-float">
                <Package size={28} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You haven't listed any medicines yet.</p>
              <Link to="/dashboard/add" className="btn-primary text-sm">
                <Plus size={16} /> Add your first listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.myListings.slice(0, 4).map((med) => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  showOwner={false}
                  showActions
                  onEdit={() => (window.location.href = `/dashboard/edit/${med.id}`)}
                  onDelete={async () => {
                    if (confirm('Delete this listing?')) {
                      await supabase.from('medicines').delete().eq('id', med.id);
                      window.location.reload();
                    }
                  }}
                  onReserve={async () => {
                    const newStatus = med.status === 'available' ? 'reserved' : 'available';
                    await supabase.from('medicines').update({ status: newStatus }).eq('id', med.id);
                    window.location.reload();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="animate-stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              {isOrg ? 'Donations available' : 'Organizations in need'}
            </h2>
            <Link to="/dashboard/browse" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline inline-flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {(isOrg ? data.donations : data.requests).length === 0 ? (
            <div className="card p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-950/40 dark:to-secondary-900/20 text-secondary-400 flex items-center justify-center mx-auto mb-3">
                <Search size={28} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOrg ? 'No donations available right now.' : 'No active requests right now.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(isOrg ? data.donations : data.requests).slice(0, 4).map((med) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { to: '/dashboard/browse', icon: Search, color: 'primary', title: 'Browse all', desc: 'Search medicines and requests' },
          { to: '/dashboard/map', icon: Map, color: 'secondary', title: 'Find organizations', desc: 'Map view of NGOs & hospitals' },
          { to: '/dashboard/add', icon: Plus, color: 'accent', title: 'Add medicine', desc: 'List a donation or request' },
        ].map((link, i) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{ animationDelay: `${i * 80}ms` }}
              className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-slide-up relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${link.color}-400 to-${link.color}-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-8 h-8 rounded-lg bg-${link.color}-50 dark:bg-${link.color}-950/40 text-${link.color}-600 dark:text-${link.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{link.title}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{link.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
