import { useSelector } from 'react-redux';
import { selectCurrentRole } from '../../features/auth/store/authSlice.js';
import { can } from '../constants/permissions.js';

function ModulePage({ title, eyebrow, description, permission, primaryAction = 'Create', onActionClick, children }) {
  const role = useSelector(selectCurrentRole);
  const canManage = permission ? can(role, permission) : false;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">{eyebrow}</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
          </div>

          {canManage && primaryAction && (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center justify-center h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <svg className="w-5 h-5 mr-1.5 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {primaryAction}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

export default ModulePage;
