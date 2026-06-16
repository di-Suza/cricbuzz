import { useState } from 'react';
import { useNavigate } from 'react-router';

import LoadingLabel from '../../../shared/components/LoadingLabel.jsx';
import { useLoginMutation } from '../api/authApi.js';

const initialForm = {
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [login, { error, isLoading }] = useLoginMutation();

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(form).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (_error) {
      // RTK Query exposes the error state used below.
    }
  }

  return (
    <section className="grid h-[calc(100vh-73px)] place-items-center overflow-hidden px-4 py-6">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/95 p-7 shadow-2xl shadow-black/25">
        <div className="mb-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 text-lg font-bold text-slate-950">
            C
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Cricbuzz Admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="name@example.com"
              className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter password"
              className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              required
            />
          </label>

          {error && (
            <p className="rounded-md border border-rose-800 bg-rose-950/60 px-3 py-2 text-sm text-rose-200">
              {error.data?.message || 'Unable to sign in'}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-md bg-emerald-400 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <LoadingLabel label="Signing in" /> : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
