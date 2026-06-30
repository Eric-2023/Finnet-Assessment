import { useEffect, useState } from 'react';
import { useGetUsersQuery } from './store/api';
import UserSidebar from './components/UserSidebar';
import ProfileCard, { ProfileCardSkeleton } from './components/ProfileCard';
import PostsFeed from './components/PostsFeed';

export default function App() {
  const { data: users } = useGetUsersQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default to the first user once the list loads, without overriding
  // a selection the person already made.
  useEffect(() => {
    if (selectedId === null && users && users.length > 0) {
      setSelectedId(users[0].id);
    }
  }, [users, selectedId]);

  const selectedUser = users?.find((u) => u.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">F</span>
          </div>
          <div>
            <h1 className="font-display font-semibold text-ink leading-tight">FinnetTrust</h1>
            <p className="text-xs text-slate leading-tight">User Dashboard &amp; Post Manager</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-card rounded-xl md:h-[calc(100vh-7rem)] md:sticky md:top-6 overflow-hidden">
          <UserSidebar selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        <section aria-live="polite" className="space-y-5 min-w-0">
          {selectedUser ? (
            <>
              <ProfileCard user={selectedUser} />
              <PostsFeed userId={selectedUser.id} />
            </>
          ) : (
            <ProfileCardSkeleton />
          )}
        </section>
      </main>
    </div>
  );
}
