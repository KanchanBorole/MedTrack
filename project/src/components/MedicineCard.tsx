import { Pill, MapPin, Package, Trash2, Edit3, Bell, Phone, ArrowUpRight } from 'lucide-react';
import type { MedicineWithOwner } from '@/lib/supabase';
import { expiryLabel, expiryStatus, roleLabel } from '@/lib/utils';

const expiryColors: Record<string, string> = {
  expired: 'bg-error-100 text-error-700 border-error-200 dark:bg-error-950/40 dark:text-error-400 dark:border-error-900/50',
  critical: 'bg-error-100 text-error-700 border-error-200 dark:bg-error-950/40 dark:text-error-400 dark:border-error-900/50',
  soon: 'bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-950/40 dark:text-warning-400 dark:border-warning-900/50',
  safe: 'bg-success-100 text-success-700 border-success-200 dark:bg-success-950/40 dark:text-success-400 dark:border-success-900/50',
  none: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

const statusBadge: Record<string, string> = {
  available: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400',
  reserved: 'bg-warning-100 text-warning-700 dark:bg-warning-950/40 dark:text-warning-400',
  fulfilled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

interface Props {
  medicine: MedicineWithOwner;
  showOwner?: boolean;
  showActions?: boolean;
  onEdit?: (m: MedicineWithOwner) => void;
  onDelete?: (m: MedicineWithOwner) => void;
  onReserve?: (m: MedicineWithOwner) => void;
}

export default function MedicineCard({ medicine, showOwner = true, showActions = false, onEdit, onDelete, onReserve }: Props) {
  const status = expiryStatus(medicine.expiry_date);
  const isDonate = medicine.listing_type === 'donate';
  const isUrgent = status === 'critical' || status === 'expired';

  return (
    <div className="card-hover p-5 group relative overflow-hidden">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
        isDonate ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-gradient-to-r from-accent-400 to-accent-600'
      } ${isUrgent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
            isDonate
              ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-400 dark:group-hover:bg-primary-900/40'
              : 'bg-accent-50 text-accent-600 group-hover:bg-accent-100 dark:bg-accent-950/40 dark:text-accent-400 dark:group-hover:bg-accent-900/40'
          }`}>
            <Pill size={18} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{medicine.name}</div>
            {medicine.generic_name && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{medicine.generic_name}</div>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap transition-transform group-hover:scale-105 ${statusBadge[medicine.status]}`}>
          {medicine.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {medicine.category && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-400 font-medium">
            {medicine.category}
          </span>
        )}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${expiryColors[status]} ${
          isUrgent ? 'animate-pulse' : ''
        }`}>
          <span className="inline-flex items-center gap-1">
            {isUrgent && <Bell size={11} className="animate-bounce-subtle" />}
            {expiryLabel(medicine.expiry_date)}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <Package size={14} /> {medicine.quantity} units
        </span>
        {medicine.owner?.city && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} /> {medicine.owner.city}
          </span>
        )}
      </div>

      {medicine.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3 line-clamp-2 group-hover:bg-gray-100/70 dark:group-hover:bg-gray-800 transition-colors">{medicine.notes}</p>
      )}

      {showOwner && medicine.owner && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{medicine.owner.full_name}</span>
              <span className="text-gray-400 dark:text-gray-500"> · {roleLabel(medicine.owner.role)}</span>
            </div>
          </div>
          {medicine.owner.phone && (
            <a href={`tel:${medicine.owner.phone}`} className="text-xs text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-950/30 px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-all">
              <Phone size={12} /> Call <ArrowUpRight size={10} />
            </a>
          )}
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800 mt-3">
          {onReserve && medicine.status === 'available' && (
            <button
              onClick={() => onReserve(medicine)}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:shadow-sm active:scale-95 transition-all"
            >
              {isDonate ? 'Request' : 'Fulfill'}
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(medicine)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 active:scale-90 transition-all" title="Edit">
              <Edit3 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(medicine)} className="p-2 rounded-lg text-gray-400 hover:bg-error-50 dark:hover:bg-error-950/30 hover:text-error-600 dark:hover:text-error-400 active:scale-90 transition-all" title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
