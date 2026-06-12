import { useMemo, useState } from 'react';

import { useRegisterUserMutation } from '../../auth/api/authApi.js';
import { useGetUsersQuery } from '../api/usersApi.js';
import { ADMIN, ROLE_LABELS, SCORER } from '../../../shared/constants/roles.js';

const initialForm = {
  role: ADMIN,
  name: '',
  email: '',
  password: '',
};

function getUserId(user) {
  return user._id || user.id || user.email;
}

function formatDate(value) {
  if (!value) return 'N/A';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getRoleBadge(role) {
  if (role === ADMIN) return 'bg-sky-50 text-sky-700 ring-sky-100';
  if (role === SCORER) return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  return 'bg-slate-50 text-slate-700 ring-slate-100';
}

function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { data: users = [], isFetching, isLoading, refetch } = useGetUsersQuery();
  const [registerUser, { error, isLoading: isCreating, isSuccess, reset }] = useRegisterUserMutation();

  const filteredUsers = useMemo(
    () => users.filter((user) => [ADMIN, SCORER].includes(user.role)),
    [users]
  );

  function openCreateForm() {
    reset();
    setForm(initialForm);
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    if (!isCreating) {
      setIsCreateOpen(false);
      setForm(initialForm);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    try {
      await registerUser({
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }).unwrap();

      setForm(initialForm);
      setIsCreateOpen(false);
    } catch (_error) {
      // RTK Query exposes the error state used below.
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Super admin</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Users</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Create and manage admin and scorer accounts from the protected admin surface.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetching ? 'Refreshing' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200"
            >
              Create User
            </button>
          </div>
        </div>
      </div>

      {isSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          User created successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[860px] grid-cols-[1.4fr_1.4fr_0.8fr_0.8fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Created</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="min-w-[860px] divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No admin or scorer accounts found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={getUserId(user)}
                className="grid grid-cols-[1.4fr_1.4fr_0.8fr_0.8fr_1fr] items-center px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="font-medium text-slate-950">{user.name}</span>
                <span className="truncate pr-4 text-slate-600">{user.email}</span>
                <span>
                  <span className={`rounded px-2 py-1 text-xs font-semibold ring-1 ${getRoleBadge(user.role)}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </span>
                <span className="text-slate-500">{formatDate(user.createdAt)}</span>
                <span className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled
                    className="h-9 rounded-md border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-300"
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Create user</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">Admin or scorer account</h3>
            </div>

            <form className="space-y-4 p-5" onSubmit={handleCreateUser}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Role</span>
                <select
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value={ADMIN}>Admin</option>
                  <option value={SCORER}>Scorer</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={updateField}
                  minLength={2}
                  maxLength={80}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  minLength={6}
                  maxLength={128}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </label>

              {error && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error.data?.message || 'Unable to create user'}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  disabled={isCreating}
                  className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? 'Creating' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default UsersPage;
