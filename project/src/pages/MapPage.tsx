import { useEffect, useState } from 'react';
import { Map as MapIcon, Phone, MapPin, Search, Building2, HeartHandshake, User as UserIcon, Navigation } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { roleLabel, initials } from '@/lib/utils';
import MapView from '@/components/MapView';
import PageHeader from '@/components/PageHeader';

const roleIcons: Record<string, typeof UserIcon> = {
  ngo: HeartHandshake,
  hospital: Building2,
  user: UserIcon,
};

const roleColors: Record<string, string> = {
  ngo: 'bg-gradient-to-br from-accent-400 to-accent-600 text-white',
  hospital: 'bg-gradient-to-br from-error-400 to-error-600 text-white',
  user: 'bg-gradient-to-br from-secondary-400 to-secondary-600 text-white',
};

const filterButtons = [
  { v: 'all', l: 'All' },
  { v: 'ngo', l: 'NGO' },
  { v: 'hospital', l: 'Hospital' },
  { v: 'user', l: 'Individual' },
];

function OrgSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full shimmer-bg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer-bg rounded w-3/4" />
          <div className="h-3 shimmer-bg rounded w-1/2" />
          <div className="h-3 shimmer-bg rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [orgs, setOrgs] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setOrgs((data as Profile[]) || []);
      setFiltered((data as Profile[]) || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = orgs;
    if (roleFilter !== 'all') result = result.filter((o) => o.role === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.full_name.toLowerCase().includes(q) ||
          (o.city && o.city.toLowerCase().includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [orgs, search, roleFilter]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Organizations"
        subtitle="Find NGOs, hospitals, and donors on the map."
        icon={MapIcon}
      />

      {/* Filters */}
      <div className="card p-4 mb-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, or address..."
              className="input pl-10"
            />
          </div>
          <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
            {filterButtons.map((btn) => (
              <button
                key={btn.v}
                onClick={() => setRoleFilter(btn.v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  roleFilter === btn.v
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {btn.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 card overflow-hidden h-[500px] lg:h-[600px] order-2 lg:order-1 relative group">
          <div className="absolute top-4 left-4 z-[400] card-glass px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-md">
            <Navigation size={15} className="text-primary-600 dark:text-primary-400" />
            {loading ? 'Loading map...' : `${filtered.length} locations`}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-primary-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <MapView items={filtered} />
          )}
        </div>

        {/* List */}
        <div className="order-1 lg:order-2 max-h-[500px] lg:max-h-[600px] overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                  <OrgSkeleton />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center hover:shadow-md transition-shadow animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-300 dark:text-gray-600 flex items-center justify-center mx-auto mb-3">
                <MapPin size={28} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No organizations found.</p>
            </div>
          ) : (
            filtered.map((org, i) => {
              const Icon = roleIcons[org.role] || UserIcon;
              return (
                <button
                  key={org.id}
                  onClick={() => setSelected(org)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`card w-full text-left p-4 transition-all duration-300 animate-slide-up group hover:shadow-md hover:-translate-y-0.5 ${
                    selected?.id === org.id ? 'ring-2 ring-primary-400 dark:ring-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'hover:border-primary-100 dark:hover:border-primary-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 ${roleColors[org.role]}`}>
                      {initials(org.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{org.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <Icon size={12} />
                        {roleLabel(org.role)}
                      </div>
                      {org.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin size={12} /> {org.city}
                          {org.address ? `, ${org.address}` : ''}
                        </div>
                      )}
                      {org.phone && (
                        <div className="flex items-center gap-1 text-xs text-secondary-600 dark:text-secondary-400 mt-1 group-hover:text-secondary-700 dark:group-hover:text-secondary-300 transition-colors">
                          <Phone size={12} /> {org.phone}
                        </div>
                      )}
                      {org.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{org.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
