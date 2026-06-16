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
    <section className="grid min-h-[calc(100vh-73px)] place-items-center overflow-hidden bg-[#0d1211] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-[#26282b] bg-[#1a1c1e] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="mb-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[#4d8dff] text-lg font-black text-[#081018] shadow-[0_0_28px_rgba(77,141,255,0.35)]">
            C
          </div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#a9c3ff]">Cricket Arena Admin</p>
          <h1 className="mt-2 text-2xl font-black text-white">Sign in</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-[#d3d7de]">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="name@example.com"
              className="mt-2 h-11 w-full rounded-md border border-[#343b40] bg-[#111615] px-3 text-sm text-white outline-none transition placeholder:text-[#7d8792] hover:border-[#4a5358] focus:border-[#8fb5ff] focus:ring-4 focus:ring-[#4d8dff]/15"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#d3d7de]">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter password"
              className="mt-2 h-11 w-full rounded-md border border-[#343b40] bg-[#111615] px-3 text-sm text-white outline-none transition placeholder:text-[#7d8792] hover:border-[#4a5358] focus:border-[#8fb5ff] focus:ring-4 focus:ring-[#4d8dff]/15"
              required
            />
          </label>

          {error && (
            <p className="rounded-md border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm font-medium text-rose-200">
              {error.data?.message || 'Unable to sign in'}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-md bg-[#a9c3ff] px-4 text-sm font-black text-[#081018] shadow-lg shadow-[#4d8dff]/20 transition hover:bg-[#8fb5ff] focus:outline-none focus:ring-4 focus:ring-[#4d8dff]/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <LoadingLabel label="Signing in" /> : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
