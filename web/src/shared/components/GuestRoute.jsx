import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

import { selectAccessToken, selectAuth } from '../../features/auth/store/authSlice.js';
import LoadingScreen from './LoadingScreen.jsx';

function GuestRoute({ children }) {
  const location = useLocation();
  const { bootstrapped } = useSelector(selectAuth);
  const accessToken = useSelector(selectAccessToken);

  if (!bootstrapped) {
    return <LoadingScreen />;
  }

  if (accessToken) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  }

  return children;
}

export default GuestRoute;
