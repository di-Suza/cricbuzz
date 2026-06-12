import { Link, Outlet } from 'react-router';
import { useSelector } from 'react-redux';

import { selectAccessToken, selectCurrentUser } from '../../features/auth/store/authSlice.js';

function PublicLayout() {
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-base font-semibold text-white">
            Cricbuzz Live
          </Link>

          <nav className="flex items-center gap-2">
            {accessToken ? (
              <>
                <span className="hidden max-w-48 truncate text-sm text-slate-400 sm:inline">{user?.email}</span>
                <Link
                  to="/dashboard"
                  className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-300 hover:text-emerald-300"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
