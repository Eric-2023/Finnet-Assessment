import { useGetUsersQuery } from '../store/api';
import Avatar from './Avatar';
import type { User } from '../types';

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function SidebarSkeleton() {
  return (
    <ul className="px-2 space-y-1" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/5 rounded" />
            <div className="skeleton h-2.5 w-2/5 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function UserSidebar({ selectedId, onSelect }: Props) {
  const { data: users, isLoading, isError, refetch, isFetching } = useGetUsersQuery();

  return (
    <nav aria-label="User directory" className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
          {isLoading ? 'Loading…' : `${users?.length ?? 0} users`}
        </p>
      </div>

      {isLoading && <SidebarSkeleton />}

      {isError && (
        <div className="mx-3 p-3 rounded-lg bg-danger-soft">
          <p className="text-sm font-medium text-danger">Couldn't load users</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-danger underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {users && users.length === 0 && (
        <p className="px-4 text-sm text-slate">No users yet.</p>
      )}

      {users && users.length > 0 && (
        <ul
          className="px-2 flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:gap-0.5 md:space-y-0.5 md:overflow-y-auto md:overflow-x-visible md:pb-0"
          role="listbox"
          aria-label="Select a user"
        >
          {users.map((user: User) => {
            const isActive = user.id === selectedId;
            return (
              <li key={user.id} className="shrink-0 md:shrink">
                <button
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelect(user.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 whitespace-nowrap md:whitespace-normal ${
                    isActive ? 'bg-ink text-white' : 'hover:bg-black/5 text-ink'
                  }`}
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="min-w-0 md:flex-1">
                    <span className="block text-sm font-medium truncate">{user.name}</span>
                    <span className={`hidden md:block text-xs truncate ${isActive ? 'text-white/70' : 'text-slate'}`}>
                      {user.company.name}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isFetching && !isLoading && (
        <p className="px-4 py-2 text-xs text-slate font-mono" aria-live="polite">refreshing…</p>
      )}
    </nav>
  );
}
