import { NavLink, Outlet, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import { useLogoutMutation } from '../../features/auth/api/authApi.js';
import { selectCurrentUser } from '../../features/auth/store/authSlice.js';
import { getSidebarItems } from '../../features/dashboard/config/sidebarItems.js';
import { ROLE_LABELS } from '../constants/roles.js';

function ProtectedLayout({ routes }) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading }] = useLogoutMutation();
  const sidebarItems = getSidebarItems(routes, user?.role);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[17rem] border-r border-slate-200 bg-zinc-950 text-slate-100 lg:block">
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-base font-bold text-zinc-950">
              C
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white">Cricbuzz Admin</p>
              <p className="text-xs text-slate-400">Control panel</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-5">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.path}`}
              className={({ isActive }) =>
                [
                  'group flex items-center justify-between rounded-md border px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'border-emerald-400/40 bg-emerald-400 text-zinc-950 shadow-sm shadow-emerald-950/20'
                    : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <span>{item.label}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] opacity-80 group-hover:bg-white/15">
                {item.code}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 shadow-sm shadow-slate-200/40 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {ROLE_LABELS[user?.role] || 'Signed in'}
              </p>
              <h1 className="text-lg font-semibold text-slate-950">{user?.name || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:block">
                <p className="max-w-56 truncate text-sm font-medium text-slate-700">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing out' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.path}`}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProtectedLayout;
