import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      transformResponse: unwrapData,
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: unwrapData,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetUsersQuery,
} = usersApi;
