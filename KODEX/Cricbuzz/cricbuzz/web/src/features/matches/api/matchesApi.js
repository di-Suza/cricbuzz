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

const matchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatches: builder.query({
      query: ({ page = 1, limit = 10, seriesId = '', status = '', matchType = '', search = '' } = {}) => ({
        url: '/matches',
        params: compactParams({ page, limit, seriesId, status, matchType, search }),
      }),
      transformResponse: unwrapList,
      providesTags: (result) => [
        'Matches',
        ...(result?.data || []).map((match) => ({ type: 'Matches', id: match._id })),
      ],
    }),
    getMatchById: builder.query({
      query: (id) => `/matches/${id}`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, id) => [{ type: 'Matches', id }],
    }),
    createMatch: builder.mutation({
      query: (body) => ({
        url: '/matches',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Matches', 'Series'],
    }),
    updateMatch: builder.mutation({
      query: ({ id, body }) => ({
        url: `/matches/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Matches', { type: 'Matches', id }],
    }),
    updateMatchStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/matches/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Matches', { type: 'Matches', id }],
    }),
    recordToss: builder.mutation({
      query: ({ id, body }) => ({
        url: `/matches/${id}/toss`,
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Matches', { type: 'Matches', id }],
    }),
    startMatch: builder.mutation({
      query: (id) => ({
        url: `/matches/${id}/start`,
        method: 'PATCH',
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, id) => ['Matches', { type: 'Matches', id }],
    }),
    completeMatch: builder.mutation({
      query: ({ id, body }) => ({
        url: `/matches/${id}/complete`,
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Matches', { type: 'Matches', id }],
    }),
    deleteMatch: builder.mutation({
      query: (id) => ({
        url: `/matches/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Matches', 'Series'],
    }),
  }),
});

export const {
  useCreateMatchMutation,
  useGetMatchByIdQuery,
  useGetMatchesQuery,
  useRecordTossMutation,
  useStartMatchMutation,
  useCompleteMatchMutation,
  useDeleteMatchMutation,
  useUpdateMatchMutation,
  useUpdateMatchStatusMutation,
} = matchesApi;
