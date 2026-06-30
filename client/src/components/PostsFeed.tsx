import { useGetUserPostsQuery } from '../store/api';
import PostItem from './PostItem';
import NewPostForm from './NewPostForm';

function FeedSkeleton() {
  return (
    <ul className="space-y-6" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="pl-8 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </li>
      ))}
    </ul>
  );
}

export default function PostsFeed({ userId }: { userId: number }) {
  const { data: posts, isLoading, isError, refetch } = useGetUserPostsQuery(userId);

  return (
    <div className="space-y-5">
      <NewPostForm userId={userId} />

      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate mb-4">
          Post history
        </h3>

        {isLoading && <FeedSkeleton />}

        {isError && (
          <div className="bg-danger-soft rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-danger">Couldn't load posts for this user.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-danger underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {posts && posts.length === 0 && (
          <div className="bg-card rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-ink">No posts yet</p>
            <p className="text-xs text-slate mt-1">Write the first one above — it'll show up here instantly.</p>
          </div>
        )}

        {posts && posts.length > 0 && (
          <ul className="max-h-[480px] overflow-y-auto pr-1" aria-live="polite">
            {posts.map((post, i) => (
              <PostItem key={post.id} post={post} index={i} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
