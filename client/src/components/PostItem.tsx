import { useState } from 'react';
import type { Post } from '../types';

const PREVIEW_LENGTH = 140;

export default function PostItem({ post, index }: { post: Post; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.body.length > PREVIEW_LENGTH;
  const isOptimistic = post.id < 0;

  const displayBody = expanded || !isLong ? post.body : `${post.body.slice(0, PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <li
      className={`relative pl-8 pb-6 last:pb-0 ${isOptimistic ? 'animate-slide-in' : ''}`}
    >
      {/* Vertical ledger rail — order carries real meaning here (most recent first),
          so a numbered marker is earned rather than decorative. */}
      <span className="absolute left-0 top-0.5 font-mono text-[11px] text-slate w-6 text-right" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="absolute left-[26px] top-1.5 bottom-0 w-px bg-line" aria-hidden="true" />
      <span className="absolute left-[23px] top-1 w-[7px] h-[7px] rounded-full bg-signal" aria-hidden="true" />

      <article className={`rounded-lg ${isOptimistic ? 'animate-fade-highlight' : ''}`}>
        <h3 className="font-display font-semibold text-base text-ink leading-snug">{post.title}</h3>
        <p className="mt-1.5 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{displayBody}</p>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-2 text-xs font-medium text-signal hover:underline underline-offset-2"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
        {isOptimistic && (
          <span className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wide text-signal">
            Saving…
          </span>
        )}
      </article>
    </li>
  );
}
