import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

import {
  selectAccessToken,
  selectAuth,
  selectCurrentRole,
} from '../../features/auth/store/authSlice.js';
import { canAccessRoute } from '../constants/permissions.js';
import LoadingScreen from './LoadingScreen.jsx';

function RoleRoute({ children, route }) {
  const location = useLocation();
  const { bootstrapped } = useSelector(selectAuth);
  const accessToken = useSelector(selectAccessToken);
  const role = useSelector(selectCurrentRole);

  if (!bootstrapped) {
    return <LoadingScreen />;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessRoute(role, route)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

export default RoleRoute;
