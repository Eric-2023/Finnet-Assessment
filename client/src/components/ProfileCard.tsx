import Avatar from './Avatar';
import type { User } from '../types';

export function ProfileCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 flex items-start gap-4" aria-hidden="true">
      <div className="skeleton w-14 h-14 rounded-full" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/5 rounded" />
      </div>
    </div>
  );
}

export default function ProfileCard({ user }: { user: User }) {
  return (
    <div className="bg-card rounded-xl p-6 flex items-start gap-4 shadow-sm">
      <Avatar name={user.name} size="lg" />
      <div className="min-w-0">
        <h2 className="font-display font-semibold text-xl text-ink truncate">{user.name}</h2>
        <p className="text-sm text-slate mt-0.5 truncate">{user.company.name}</p>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Email</dt>
            <dd className="font-mono text-xs text-ink-soft">{user.email}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Location</dt>
            <dd className="text-slate">{user.address.street}, {user.address.city}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
