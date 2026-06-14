import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

function unwrapList(response) {
  return {
    data: response?.data ?? [],
    meta: response?.meta ?? null,
  };
}

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

const commentaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommentary: builder.query({
      query: ({ matchId, page = 1, limit = 50, innings = '' }) => ({
        url: `/matches/${matchId}/commentary`,
        params: compactParams({ page, limit, innings }),
      }),
      transformResponse: unwrapList,
      providesTags: (_result, _error, { matchId }) => [{ type: 'Commentary', id: matchId }],
    }),
    createCommentary: builder.mutation({
      query: ({ matchId, body }) => ({
        url: `/matches/${matchId}/commentary`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { matchId }) => [{ type: 'Commentary', id: matchId }],
    }),
    deleteCommentary: builder.mutation({
      query: ({ matchId, id }) => ({
        url: `/matches/${matchId}/commentary/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { matchId }) => [{ type: 'Commentary', id: matchId }],
    }),
  }),
});

export const {
  useCreateCommentaryMutation,
  useDeleteCommentaryMutation,
  useGetCommentaryQuery,
} = commentaryApi;
