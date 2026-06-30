import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User, Post, NewPostInput } from '../types';

// Design decision: base URL comes from an env var so the same build
// works against localhost in dev and the deployed Render URL in
// production without code changes — set VITE_API_URL in .env.production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/api` }),
  tagTypes: ['User', 'Post'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserPosts: builder.query<Post[], number>({
      query: (userId) => `/users/${userId}/posts`,
      providesTags: (_result, _error, userId) => [{ type: 'Post', id: userId }],
    }),
    createPost: builder.mutation<Post, NewPostInput>({
      query: ({ userId, title, body }) => ({
        url: `/users/${userId}/posts`,
        method: 'POST',
        body: { title, body },
      }),
      // Optimistic update: the new post appears at the top of the feed
      // immediately, before the server responds. If the request fails,
      // the patch is rolled back automatically — this satisfies the
      // "no page refresh, appears instantly" requirement without
      // waiting on round-trip latency.
      async onQueryStarted({ userId, title, body }, { dispatch, queryFulfilled }) {
        const tempId = -Date.now(); // negative id, guaranteed not to collide with real ids
        const patchResult = dispatch(
          api.util.updateQueryData('getUserPosts', userId, (draft) => {
            draft.unshift({ id: tempId, title, body, userId });
          })
        );
        try {
          const { data: createdPost } = await queryFulfilled;
          // Replace the optimistic temp post with the real server record
          // (real id, server-trimmed strings) rather than a blind refetch.
          dispatch(
            api.util.updateQueryData('getUserPosts', userId, (draft) => {
              const idx = draft.findIndex((p) => p.id === tempId);
              if (idx !== -1) draft[idx] = createdPost;
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetUsersQuery, useGetUserPostsQuery, useCreatePostMutation } = api;
