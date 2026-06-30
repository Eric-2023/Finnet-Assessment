// Deterministic color from name so each user reads distinctly in the
// sidebar without needing avatar images (none are provided by the API).
const PALETTE = ['#0F766E', '#B45309', '#3730A3', '#9D174D', '#15803D', '#1D4ED8'];

function colorForName(name: string): string {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center font-display font-semibold text-white shrink-0`}
      style={{ backgroundColor: colorForName(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
