import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, action }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-slide-up">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon size={22} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
