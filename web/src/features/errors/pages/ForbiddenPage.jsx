import { Link } from 'react-router';

function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Access denied</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your role does not have permission to open this dashboard module.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

export default ForbiddenPage;
