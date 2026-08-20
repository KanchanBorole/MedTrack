import { User, Building2, HeartHandshake, Check } from 'lucide-react';
import type { Role } from '@/lib/supabase';

interface Props {
  value: Role | null;
  onChange: (role: Role) => void;
}

const roles: { value: Role; label: string; desc: string; icon: typeof User }[] = [
  { value: 'user', label: 'Individual', desc: 'Donate or request medicines', icon: User },
  { value: 'ngo', label: 'NGO', desc: 'Post needs & receive donations', icon: HeartHandshake },
  { value: 'hospital', label: 'Hospital', desc: 'Coordinate medicine supply', icon: Building2 },
];

export default function RoleSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {roles.map((r, i) => {
        const Icon = r.icon;
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 animate-scale-in overflow-hidden ${
              active
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 scale-[1.03] shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm'
            }`}
          >
            {active && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center animate-scale-in">
                <Check size={12} />
              </div>
            )}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                active ? 'bg-primary-600 text-white scale-110 shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={22} />
            </div>
            <span className={`font-semibold text-sm transition-colors ${active ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {r.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{r.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
