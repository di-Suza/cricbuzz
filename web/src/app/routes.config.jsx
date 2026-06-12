import CommentaryPage from '../features/commentary/pages/CommentaryPage.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import MatchesPage from '../features/matches/pages/MatchesPage.jsx';
import PlayersPage from '../features/players/pages/PlayersPage.jsx';
import PlayingXiPage from '../features/playing-xi/pages/PlayingXiPage.jsx';
import ScoringPage from '../features/scoring/pages/ScoringPage.jsx';
import SeriesPage from '../features/series/pages/SeriesPage.jsx';
import SquadsPage from '../features/squads/pages/SquadsPage.jsx';
import TeamsPage from '../features/teams/pages/TeamsPage.jsx';
import UsersPage from '../features/users/pages/UsersPage.jsx';
import { ADMIN, SCORER, SUPER_ADMIN } from '../shared/constants/roles.js';

const ALL_ROLES = [SUPER_ADMIN, ADMIN, SCORER];
const CONTENT_ROLES = [SUPER_ADMIN, ADMIN];
const LIVE_ROLES = [SUPER_ADMIN, ADMIN, SCORER];

const protectedRoutes = [
  {
    id: 'dashboard',
    path: 'dashboard',
    label: 'Dashboard',
    module: 'Overview',
    roles: ALL_ROLES,
    element: <DashboardPage />,
    nav: true,
  },
  {
    id: 'users',
    path: 'users',
    label: 'Users',
    module: 'User CRUD',
    roles: [SUPER_ADMIN],
    element: <UsersPage />,
    nav: true,
  },
  {
    id: 'series',
    path: 'series',
    label: 'Series',
    module: 'Series CRUD',
    roles: CONTENT_ROLES,
    element: <SeriesPage />,
    nav: true,
  },
  {
    id: 'teams',
    path: 'teams',
    label: 'Teams',
    module: 'Team CRUD',
    roles: CONTENT_ROLES,
    element: <TeamsPage />,
    nav: true,
  },
  {
    id: 'squads',
    path: 'squads',
    label: 'Squads',
    module: 'Squad Management',
    roles: CONTENT_ROLES,
    element: <SquadsPage />,
    nav: true,
  },
  {
    id: 'players',
    path: 'players',
    label: 'Players',
    module: 'Player CRUD',
    roles: CONTENT_ROLES,
    element: <PlayersPage />,
    nav: true,
  },
  {
    id: 'matches',
    path: 'matches',
    label: 'Matches',
    module: 'Match Lifecycle',
    roles: LIVE_ROLES,
    element: <MatchesPage />,
    nav: true,
  },
  {
    id: 'playing-xi',
    path: 'playing-xi',
    label: 'Playing XI',
    module: 'XI Selection',
    roles: LIVE_ROLES,
    element: <PlayingXiPage />,
    nav: true,
  },
  {
    id: 'scoring',
    path: 'scoring',
    label: 'Scoring',
    module: 'Live Scoring',
    roles: LIVE_ROLES,
    element: <ScoringPage />,
    nav: true,
  },
  {
    id: 'commentary',
    path: 'commentary',
    label: 'Commentary',
    module: 'Ball Commentary',
    roles: LIVE_ROLES,
    element: <CommentaryPage />,
    nav: true,
  },
];

export {
  protectedRoutes,
};
