import { useState, type FormEvent } from 'react';
import { useCreatePostMutation } from '../store/api';
import type { ApiErrorPayload } from '../types';

export default function NewPostForm({ userId }: { userId: number }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    // Client-side check mirrors the backend's blank-string validation so
    // the person gets instant feedback without a round trip.
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const localErrors: Record<string, string> = {};
    if (!trimmedTitle) localErrors.title = 'Title can\u2019t be empty';
    if (!trimmedBody) localErrors.body = 'Body can\u2019t be empty';
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    try {
      await createPost({ userId, title: trimmedTitle, body: trimmedBody }).unwrap();
      setTitle('');
      setBody('');
    } catch (err) {
      const payload = (err as { data?: ApiErrorPayload })?.data;
      if (payload?.errors?.length) {
        const mapped: Record<string, string> = {};
        for (const e of payload.errors) mapped[e.field] = e.message;
        setFieldErrors(mapped);
      } else {
        setFormError('Couldn\u2019t post that — check your connection and try again.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-5 space-y-3" noValidate>
      <h3 className="font-display font-semibold text-sm text-ink">New post</h3>

      <div>
        <label htmlFor="post-title" className="sr-only">Title</label>
        <input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? 'post-title-error' : undefined}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-paper focus:bg-card transition-colors ${
            fieldErrors.title ? 'border-danger' : 'border-line'
          }`}
        />
        {fieldErrors.title && (
          <p id="post-title-error" className="mt-1 text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="post-body" className="sr-only">Body</label>
        <textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          aria-invalid={!!fieldErrors.body}
          aria-describedby={fieldErrors.body ? 'post-body-error' : undefined}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-paper focus:bg-card transition-colors resize-none ${
            fieldErrors.body ? 'border-danger' : 'border-line'
          }`}
        />
        {fieldErrors.body && (
          <p id="post-body-error" className="mt-1 text-xs text-danger">{fieldErrors.body}</p>
        )}
      </div>

      {formError && (
        <p role="alert" className="text-xs text-danger">{formError}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-signal text-white text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100"
        >
          {isLoading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
