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

const teamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = '' } = {}) => ({
        url: '/teams',
        params: compactParams({ page, limit, search, status }),
      }),
      transformResponse: unwrapList,
      providesTags: (result) => [
        'Teams',
        ...(result?.data || []).map((team) => ({ type: 'Teams', id: team._id })),
      ],
    }),
    getTeamById: builder.query({
      query: (id) => `/teams/${id}`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, id) => [{ type: 'Teams', id }],
    }),
    createTeam: builder.mutation({
      query: (formData) => ({
        url: '/teams',
        method: 'POST',
        body: formData,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Teams'],
    }),
    updateTeam: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/teams/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Teams', { type: 'Teams', id }],
    }),
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Teams'],
    }),
    assignPlayerToTeam: builder.mutation({
      query: ({ teamId, playerId }) => ({
        url: `/teams/${teamId}/squad`,
        method: 'POST',
        body: { playerId },
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { teamId }) => ['Teams', { type: 'Teams', id: teamId }],
    }),
    removePlayerFromTeam: builder.mutation({
      query: ({ teamId, playerId }) => ({
        url: `/teams/${teamId}/squad/${playerId}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { teamId }) => ['Teams', { type: 'Teams', id: teamId }],
    }),
  }),
});

export const {
  useAssignPlayerToTeamMutation,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamByIdQuery,
  useGetTeamsQuery,
  useRemovePlayerFromTeamMutation,
  useUpdateTeamMutation,
} = teamsApi;
