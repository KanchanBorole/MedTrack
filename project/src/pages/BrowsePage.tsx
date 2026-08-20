import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';
import { supabase, type MedicineWithOwner, MEDICINE_CATEGORIES } from '@/lib/supabase';
import MedicineCard from '@/components/MedicineCard';
import PageHeader from '@/components/PageHeader';

type ListingFilter = 'all' | 'donate' | 'request';

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg shimmer-bg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer-bg rounded w-3/4" />
          <div className="h-3 shimmer-bg rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 shimmer-bg rounded-full w-20" />
        <div className="h-5 shimmer-bg rounded-full w-24" />
      </div>
      <div className="h-8 shimmer-bg rounded-lg" />
    </div>
  );
}

export default function BrowsePage() {
  const [medicines, setMedicines] = useState<MedicineWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [listingType, setListingType] = useState<ListingFilter>('all');
  const [city, setCity] = useState('');

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('medicines')
      .select('*, owner:profiles!medicines_owner_id_fkey(id, full_name, role, phone, city, address, latitude, longitude)')
      .order('created_at', { ascending: false });

    if (listingType !== 'all') query = query.eq('listing_type', listingType);
    if (category) query = query.eq('category', category);
    if (search.trim()) query = query.or(`name.ilike.%${search.trim()}%,generic_name.ilike.%${search.trim()}%`);
    if (city.trim()) query = query.ilike('owner.city', `%${city.trim()}%`);

    const { data } = await query;
    setMedicines((data as MedicineWithOwner[]) || []);
    setLoading(false);
  }, [listingType, category, search, city]);

  useEffect(() => {
    const timer = setTimeout(fetchMedicines, 200);
    return () => clearTimeout(timer);
  }, [fetchMedicines]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Browse medicines" subtitle="Find medicines available for donation or organizations in need." icon={Search} />

      {/* Filters */}
      <div className="card p-4 mb-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by medicine name..."
              className="input pl-10"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input min-w-[140px] cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <option value="">All categories</option>
              {MEDICINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {([
                { v: 'all', l: 'All' },
                { v: 'donate', l: 'Donate' },
                { v: 'request', l: 'Request' },
              ] as { v: ListingFilter; l: string }[]).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setListingType(opt.v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    listingType === opt.v
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="input min-w-[100px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin" />
              Searching...
            </span>
          ) : (
            <span><span className="font-semibold text-gray-700 dark:text-gray-200">{medicines.length}</span> result{medicines.length !== 1 ? 's' : ''} found</span>
          )}
        </p>
        <SlidersHorizontal size={16} className="text-gray-300 dark:text-gray-600" />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <div className="card p-12 text-center hover:shadow-md transition-shadow animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-300 dark:text-gray-600 flex items-center justify-center mx-auto mb-4">
            <Inbox size={32} />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">No medicines found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med, i) => (
            <div key={med.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-slide-up">
              <MedicineCard medicine={med} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
