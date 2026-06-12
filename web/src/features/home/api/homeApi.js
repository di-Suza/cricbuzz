import { baseApi } from '../../../shared/api/baseApi.js';

function unwrapData(response) {
  return response?.data ?? response;
}

const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeStatus: builder.query({
      query: () => '/home',
      transformResponse: unwrapData,
      providesTags: ['Home'],
    }),
  }),
});

export const {
  useGetHomeStatusQuery,
} = homeApi;
