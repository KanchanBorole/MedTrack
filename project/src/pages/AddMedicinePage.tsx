import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pill, Loader2, ArrowLeft, Save, Package } from 'lucide-react';
import { supabase, MEDICINE_CATEGORIES, type Medicine } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

type ListingType = 'donate' | 'request';

export default function AddMedicinePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [listingType, setListingType] = useState<ListingType>('donate');
  const [status, setStatus] = useState<string>('available');
  const [notes, setNotes] = useState('');

  // Load existing medicine if editing
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from('medicines').select('*').eq('id', id).maybeSingle();
      if (data) {
        const m = data as Medicine;
        setName(m.name);
        setGenericName(m.generic_name || '');
        setCategory(m.category || '');
        setQuantity(String(m.quantity));
        setExpiryDate(m.expiry_date || '');
        setListingType(m.listing_type);
        setStatus(m.status);
        setNotes(m.notes || '');
      }
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Medicine name is required.');
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      generic_name: genericName.trim() || null,
      category: category || null,
      quantity: parseInt(quantity) || 1,
      expiry_date: listingType === 'request' ? null : (expiryDate || null),
      listing_type: listingType,
      status: status as 'available' | 'reserved' | 'fulfilled',
      notes: notes.trim() || null,
    };

    if (isEdit) {
      const { error: updateError } = await supabase.from('medicines').update(payload).eq('id', id!);
      if (updateError) setError(updateError.message);
      else navigate('/dashboard');
    } else {
      const { error: insertError } = await supabase.from('medicines').insert(payload);
      if (insertError) setError(insertError.message);
      else navigate('/dashboard');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-500 dark:text-primary-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </button>
      <PageHeader
        title={isEdit ? 'Edit medicine' : 'Add medicine'}
        subtitle={isEdit ? 'Update the details of your listing.' : 'List a medicine for donation or post a request.'}
        icon={Pill}
      />

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Listing type toggle */}
        <div>
          <label className="label">Listing type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setListingType('donate')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                listingType === 'donate'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package size={18} className={listingType === 'donate' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
                <span className={`font-semibold ${listingType === 'donate' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Donate
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">I have extra medicine to give away</p>
            </button>
            <button
              type="button"
              onClick={() => setListingType('request')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                listingType === 'request'
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-accent-300 dark:hover:border-accent-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package size={18} className={listingType === 'request' ? 'text-accent-600 dark:text-accent-400' : 'text-gray-400'} />
                <span className={`font-semibold ${listingType === 'request' ? 'text-accent-700 dark:text-accent-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Request
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">I need this medicine urgently</p>
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label" htmlFor="name">Medicine name *</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div>
            <label className="label" htmlFor="generic">Generic name</label>
            <input id="generic" type="text" value={genericName} onChange={(e) => setGenericName(e.target.value)}
              className="input" placeholder="e.g. Acetaminophen" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="">Select category</option>
              {MEDICINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantity">Quantity *</label>
            <input id="quantity" type="number" min="1" required value={quantity}
              onChange={(e) => setQuantity(e.target.value)} className="input" placeholder="10" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {listingType === 'donate' && (
            <div>
              <label className="label" htmlFor="expiry">Expiry date</label>
              <input id="expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                className="input" />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Set the expiry date to get reminders.</p>
            </div>
          )}
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="input resize-none" placeholder="Storage conditions, urgency, packaging details..." />
        </div>

        {error && (
          <div className="rounded-xl bg-error-50 dark:bg-error-950/30 border border-error-200 dark:border-error-900/50 px-4 py-3 text-sm text-error-700 dark:text-error-400">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Save changes' : 'Publish listing'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      {profile && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Listed by {profile.full_name} · {profile.role === 'ngo' ? 'NGO' : profile.role === 'hospital' ? 'Hospital' : 'Individual'}
        </p>
      )}
    </div>
  );
}
