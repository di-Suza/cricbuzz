import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const playersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.query({ //used for fetching data(e.g. getPlayers)
      query: () => '/players',
      transformResponse: unwrapData,
      providesTags: ['Players'],
    }),
    getPlayerById: builder.query({
      query: (id) => `/players/${id}`,
      transformResponse: unwrapData,
      providesTags: (result, error, id) => [{ type: 'Players', id }],
    }),
    createPlayer: builder.mutation({ //used for changing data(e.g. createPlayer,updatePlayer,deletePlayer)
      query: (formData) => ({
        url: '/players',
        method: 'POST',
        body: formData, // FormData directly
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Players'],
    }),
    updatePlayer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/players/${id}`,
        method: 'PATCH',
        body: formData, // FormData directly
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


