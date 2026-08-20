export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export type ExpiryStatus = 'expired' | 'critical' | 'soon' | 'safe' | 'none';

export function expiryStatus(dateStr: string | null): ExpiryStatus {
  const days = daysUntil(dateStr);
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'soon';
  return 'safe';
}

export function expiryLabel(dateStr: string | null): string {
  const days = daysUntil(dateStr);
  if (days === null) return 'No expiry';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 30) return `Expires in ${days}d`;
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'ngo':
      return 'NGO';
    case 'hospital':
      return 'Hospital';
    default:
      return 'Individual';
  }
}

export function roleIcon(role: string): string {
  switch (role) {
    case 'ngo':
      return 'HeartHandshake';
    case 'hospital':
      return 'Building2';
    default:
      return 'User';
  }
}
