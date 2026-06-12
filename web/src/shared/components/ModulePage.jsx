import { useSelector } from 'react-redux';

import { selectCurrentRole } from '../../features/auth/store/authSlice.js';
import { can } from '../constants/permissions.js';

function ModulePage({ title, eyebrow, description, permission, primaryAction = 'Create' }) {
  const role = useSelector(selectCurrentRole);
  const canManage = permission ? can(role, permission) : false;

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          {canManage && (
            <button
              type="button"
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200"
            >
              {primaryAction}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[640px] grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Name</span>
          <span>Status</span>
          <span>Owner</span>
          <span className="text-right">Action</span>
        </div>
        <div className="min-w-[640px] divide-y divide-slate-100">
          {[1, 2, 3].map((item) => (
            <div key={item} className="grid grid-cols-4 items-center px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-50">
              <span className="font-medium text-slate-950">{title} Item {item}</span>
              <span>
                <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                  Draft
                </span>
              </span>
              <span>{role}</span>
              <span className="text-right text-slate-500">{canManage ? 'Manage' : 'View'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ModulePage;
