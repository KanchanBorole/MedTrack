import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
        isDark
          ? 'bg-gray-800 text-warning-400 hover:bg-gray-700 hover:text-warning-300'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
      } ${className}`}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
