import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const playingXiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayingXi: builder.query({
      query: (matchId) => `/matches/${matchId}/playing-xi`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, matchId) => [{ type: 'PlayingXI', id: matchId }],
    }),
    savePlayingXi: builder.mutation({
      query: ({ matchId, body }) => ({
        url: `/matches/${matchId}/playing-xi`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { matchId }) => [
        'Matches',
        { type: 'Matches', id: matchId },
        { type: 'PlayingXI', id: matchId },
      ],
    }),
  }),
});

export const {
  useGetPlayingXiQuery,
  useSavePlayingXiMutation,
} = playingXiApi;
