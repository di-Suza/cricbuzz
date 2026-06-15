import { Link, Outlet } from 'react-router';
import { useSelector } from 'react-redux';

import { selectAccessToken, selectCurrentUser } from '../../features/auth/store/authSlice.js';

function PublicLayout() {
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-[#0d1211] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-[#22292c] bg-[#0d1211]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-black tracking-tight text-white">
            Cricket <span className="text-[#b8c9ff]">Arena</span>
          </Link>

          <div className="hidden h-11 min-w-72 items-center rounded-full bg-[#252b2d] px-4 text-sm text-[#8f98a3] md:flex">
            Search matches, players...
          </div>

          <nav className="flex items-center gap-3">
            {accessToken ? (
              <>
                <span className="hidden max-w-48 truncate text-sm text-slate-400 sm:inline">{user?.email}</span>
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-[#4d8dff] px-4 py-2 text-sm font-bold text-[#081018] transition hover:bg-[#8fb5ff]"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl border border-[#343b40] px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-[#a9c3ff] hover:text-[#a9c3ff]"
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
