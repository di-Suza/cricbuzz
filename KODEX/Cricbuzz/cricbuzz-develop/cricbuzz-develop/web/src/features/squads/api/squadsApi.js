import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const squadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamSquad: builder.query({
      query: (teamId) => `/teams/${teamId}/squad`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, teamId) => [{ type: 'Squads', id: teamId }],
    }),
    addPlayerToSquad: builder.mutation({
      query: ({ teamId, playerId }) => ({
        url: `/teams/${teamId}/squad`,
        method: 'POST',
        body: { playerId },
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'Squads', id: teamId },
        { type: 'Teams', id: teamId },
        'Players',
      ],
    }),
    removePlayerFromSquad: builder.mutation({
      query: ({ teamId, playerId }) => ({
        url: `/teams/${teamId}/squad/${playerId}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'Squads', id: teamId },
        { type: 'Teams', id: teamId },
        'Players',
      ],
    }),
  }),
});

export const {
  useAddPlayerToSquadMutation,
  useGetTeamSquadQuery,
  useRemovePlayerFromSquadMutation,
} = squadsApi;
