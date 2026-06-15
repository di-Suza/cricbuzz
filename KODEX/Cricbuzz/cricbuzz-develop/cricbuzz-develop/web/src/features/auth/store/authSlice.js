import { createSlice } from '@reduxjs/toolkit';

const AUTH_STATE_ENDPOINTS = new Set(['login', 'refresh', 'getMe']);

const initialState = {
  user: null,
  accessToken: null,
  bootstrapped: false,
};

function getEndpointName(action) {
  return action.meta?.arg?.endpointName;
}

function isAuthStateFulfilled(action) {
  return action.type.endsWith('/fulfilled') && AUTH_STATE_ENDPOINTS.has(getEndpointName(action));
}

function getAuthPayload(action) {
  return action.payload?.data ?? action.payload ?? {};
}

function getUserFromPayload(payload) {
  if (payload.user) return payload.user;
  if (payload.id && payload.email && payload.role) return payload;
  return null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    markBootstrapped(state) {
      state.bootstrapped = true;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAuthStateFulfilled, (state, action) => {
      const payload = getAuthPayload(action);
      const user = getUserFromPayload(payload);

      if (payload.accessToken) {
        state.accessToken = payload.accessToken;
      }

      if (user) {
        state.user = user;
      }
    });
  },
});

const selectAuth = (state) => state.auth;
const selectCurrentUser = (state) => state.auth.user;
const selectAccessToken = (state) => state.auth.accessToken;
const selectCurrentRole = (state) => state.auth.user?.role || null;

export const {
  clearAuth,
  markBootstrapped,
  setAccessToken,
} = authSlice.actions;

export {
  selectAccessToken,
  selectAuth,
  selectCurrentRole,
  selectCurrentUser,
};

export default authSlice.reducer;
