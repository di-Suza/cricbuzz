import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const scoringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScoreboard: builder.query({
      query: (matchId) => `/matches/${matchId}/scores`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, matchId) => [{ type: 'Score', id: matchId }],
    }),
    addScoreBall: builder.mutation({
      query: ({ matchId, body }) => ({
        url: `/matches/${matchId}/scores/ball`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { matchId }) => [
        { type: 'Score', id: matchId },
        { type: 'Commentary', id: matchId },
      ],
    }),
  }),
});

export const {
  useAddScoreBallMutation,
  useGetScoreboardQuery,
} = scoringApi;
