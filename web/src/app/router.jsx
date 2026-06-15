import { createBrowserRouter } from 'react-router';

import LoginPage from '../features/auth/pages/LoginPage.jsx';
import ForbiddenPage from '../features/errors/pages/ForbiddenPage.jsx';
import HomePage from '../features/home/pages/HomePage.jsx';
import PublicMatchPage from '../features/home/pages/PublicMatchPage.jsx';
import NotFoundPage from '../features/errors/pages/NotFoundPage.jsx';
import GuestRoute from '../shared/components/GuestRoute.jsx';
import ProtectedLayout from '../shared/components/ProtectedLayout.jsx';
import PublicLayout from '../shared/components/PublicLayout.jsx';
import RoleRoute from '../shared/components/RoleRoute.jsx';
import { protectedRoutes } from './routes.config.jsx';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/matches/:matchId',
        element: <PublicMatchPage />,
      },
      {
        path: '/login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
    ],
  },
  {
    element: <ProtectedLayout routes={protectedRoutes} />,
    children: protectedRoutes.map((route) => ({
      path: route.path,
      element: <RoleRoute route={route}>{route.element}</RoleRoute>,
    })),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
