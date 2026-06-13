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

const playersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.query({
      query: ({ page = 1, limit = 10, search = '', role = '', country = '' } = {}) => ({
        url: '/players',
        params: compactParams({ page, limit, search, role, country }),
      }),
      transformResponse: unwrapList,
      providesTags: (result) => [
        'Players',
        ...(result?.data || []).map((player) => ({ type: 'Players', id: player._id })),
      ],
    }),
    getPlayerById: builder.query({
      query: (id) => `/players/${id}`,
      transformResponse: unwrapData,
      providesTags: (result, error, id) => [{ type: 'Players', id }],
    }),
    createPlayer: builder.mutation({
      query: (formData) => ({
        url: '/players',
        method: 'POST',
        body: formData,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Players'],
    }),
    updatePlayer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/players/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (result, error, { id }) => ['Players', { type: 'Players', id }],
    }),
    deletePlayer: builder.mutation({
      query: (id) => ({
        url: `/players/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Players'],
    }),
  }),
});

export const {
  useGetPlayersQuery,
  useGetPlayerByIdQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} = playersApi;


