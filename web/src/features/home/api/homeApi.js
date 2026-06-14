import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeStatus: builder.query({
      query: () => '/public/home',
      transformResponse: unwrapData,
      providesTags: ['Home'],
    }),
    getPublicMatchCenter: builder.query({
      query: (matchId) => `/public/matches/${matchId}/center`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, matchId) => [{ type: 'Home', id: matchId }],
    }),
    getPublicMatchCommentary: builder.query({
      query: ({ matchId, page = 1, limit = 20 }) => ({
        url: `/public/matches/${matchId}/commentary`,
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        data: response?.data ?? [],
        meta: response?.meta ?? null,
      }),
      providesTags: (_result, _error, { matchId }) => [{ type: 'Home', id: `${matchId}:commentary` }],
    }),
  }),
});

export const {
  useGetPublicMatchCenterQuery,
  useGetPublicMatchCommentaryQuery,
  useGetHomeStatusQuery,
} = homeApi;
