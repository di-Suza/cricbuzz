import { baseApi } from '../../../shared/api/baseApi.js';
import { clearAuth } from '../store/authSlice.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: '/auth/login',
        method: 'POST',
        body: payload,
      }),
      transformResponse: unwrapData,
    }),
    registerUser: builder.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ['Users'],
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      transformResponse: unwrapData,
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: unwrapData,
      providesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearAuth());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useRegisterUserMutation,
} = authApi;
