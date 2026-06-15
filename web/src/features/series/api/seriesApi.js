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

const seriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeries: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = '', format = '', matchType = '' } = {}) => ({
        url: '/series',
        params: compactParams({ page, limit, search, status, format, matchType }),
      }),
      transformResponse: unwrapList,
      providesTags: (result) => [
        'Series',
        ...(result?.data || []).map((series) => ({ type: 'Series', id: series._id })),
      ],
    }),
    getEligibleSeriesTeams: builder.query({
      query: () => '/series/eligible-teams',
      transformResponse: unwrapData,
      providesTags: ['Teams'],
    }),
    createSeries: builder.mutation({
      query: (body) => ({
        url: '/series',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Series'],
    }),
    updateSeries: builder.mutation({
      query: ({ id, body }) => ({
        url: `/series/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Series', { type: 'Series', id }],
    }),
    updateSeriesStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/series/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Series', { type: 'Series', id }],
    }),
    deleteSeries: builder.mutation({
      query: (id) => ({
        url: `/series/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Series'],
    }),
  }),
});

export const {
  useCreateSeriesMutation,
  useDeleteSeriesMutation,
  useGetEligibleSeriesTeamsQuery,
  useGetSeriesQuery,
  useUpdateSeriesMutation,
  useUpdateSeriesStatusMutation,
} = seriesApi;
