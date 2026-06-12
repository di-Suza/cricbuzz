import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

function unwrapList(response) {
  return {
    users: response?.data ?? [],
    meta: response?.meta ?? null,
  };
}

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, name = '' } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        const trimmedName = name.trim();
        const path = trimmedName ? '/users/search' : '/users';

        if (trimmedName) {
          params.set('name', trimmedName);
        }

        return `${path}?${params.toString()}`;
      },
      transformResponse: unwrapList,
      providesTags: (result) => [
        'Users',
        ...(result?.users || []).map((user) => ({ type: 'Users', id: user._id || user.id })),
      ],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: unwrapData,
      invalidatesTags: (_result, _error, { id }) => ['Users', { type: 'Users', id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useDeleteUserMutation,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} = usersApi;
