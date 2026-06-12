import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLazyGetMeQuery, useRefreshMutation } from '../api/authApi.js';
import { clearAuth, markBootstrapped, selectAuth } from './authSlice.js';

function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const { bootstrapped } = useSelector(selectAuth);
  const [refresh] = useRefreshMutation();
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const refreshed = await refresh().unwrap();

        if (refreshed.accessToken) {
          await getMe().unwrap();
        }
      } catch (_error) {
        dispatch(clearAuth());
      } finally {
        if (active) {
          dispatch(markBootstrapped());
        }
      }
    }

    if (!bootstrapped) {
      bootstrap();
    }

    return () => {
      active = false;
    };
  }, [bootstrapped, dispatch, getMe, refresh]);

  return children;
}

export default AuthBootstrap;
