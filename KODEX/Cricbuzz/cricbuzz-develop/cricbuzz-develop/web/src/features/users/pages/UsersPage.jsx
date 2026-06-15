import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { useRegisterUserMutation } from '../../auth/api/authApi.js';
import { selectCurrentRole } from '../../auth/store/authSlice.js';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../api/usersApi.js';
import { ADMIN, ROLE_LABELS, SCORER, SUPER_ADMIN } from '../../../shared/constants/roles.js';

const PAGE_LIMIT = 10;

const createInitialForm = {
  role: ADMIN,
  name: '',
  email: '',
  password: '',
};

const editInitialForm = {
  role: SCORER,
  name: '',
  email: '',
};

function getUserId(user) {
  return user?._id || user?.id || user?.email;
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

function getRoleOptions(currentRole) {
  if (currentRole === SUPER_ADMIN) {
    return [ADMIN, SCORER];
  }

  if (currentRole === ADMIN) {
    return [SCORER];
  }

  return [];
}

function UsersPage() {
  const currentRole = useSelector(selectCurrentRole);
  const roleOptions = getRoleOptions(currentRole);
  const defaultCreateRole = roleOptions[0] || SCORER;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [createForm, setCreateForm] = useState({ ...createInitialForm, role: defaultCreateRole });
  const [editForm, setEditForm] = useState(editInitialForm);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data,
    isFetching,
    isLoading,
    refetch,
  } = useGetUsersQuery({ page, limit: PAGE_LIMIT, name: searchName });

  const users = data?.users || [];
  const meta = data?.meta;

  const [registerUser, createState] = useRegisterUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();
  const [deleteUser, deleteState] = useDeleteUserMutation();

  const titleCopy = useMemo(() => {
    if (currentRole === SUPER_ADMIN) {
      return {
        eyebrow: 'Super admin',
        description: 'Create and manage admin and scorer accounts from the protected admin surface.',
        createTitle: 'Admin or scorer account',
      };
    }

    return {
      eyebrow: 'Admin',
      description: 'Create and manage scorer accounts from the protected admin surface.',
      createTitle: 'Scorer account',
    };
  }, [currentRole]);

  function openCreateForm() {
    createState.reset();
    setCreateForm({ ...createInitialForm, role: defaultCreateRole });
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    if (!createState.isLoading) {
      setIsCreateOpen(false);
      setCreateForm({ ...createInitialForm, role: defaultCreateRole });
    }
  }

  function openEditForm(user) {
    updateState.reset();
    setEditingUser(user);
    setEditForm({
      role: user.role,
      name: user.name || '',
      email: user.email || '',
    });
  }

  function closeEditForm() {
    if (!updateState.isLoading) {
      setEditingUser(null);
      setEditForm(editInitialForm);
    }
  }

  function updateCreateField(event) {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditField(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    try {
      await registerUser({
        role: createForm.role,
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      }).unwrap();

      setCreateForm({ ...createInitialForm, role: defaultCreateRole });
      setIsCreateOpen(false);
      setPage(1);
    } catch (_error) {
      // RTK Query exposes the error state used below.
    }
  }

  async function handleUpdateUser(event) {
    event.preventDefault();

    try {
      await updateUser({
        id: getUserId(editingUser),
        role: editForm.role,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      }).unwrap();

      closeEditForm();
    } catch (_error) {
      // RTK Query exposes the error state used below.
    }
  }

  async function handleDeleteUser() {
    try {
      await deleteUser(getUserId(deletingUser)).unwrap();
      setDeletingUser(null);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (_error) {
      // RTK Query exposes the error state used below.
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearchName(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput('');
    setSearchName('');
    setPage(1);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{titleCopy.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Users</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{titleCopy.description}</p>
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

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleSearch}>
          <label className="min-w-64 flex-1">
            <span className="text-sm font-semibold text-slate-700">Search by name</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search admins or scorers"
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Search
          </button>
          {searchName && (
            <button
              type="button"
              onClick={clearSearch}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {(createState.isSuccess || updateState.isSuccess || deleteState.isSuccess) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          User changes saved successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[940px] grid-cols-[1.3fr_1.5fr_0.8fr_0.8fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Created</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="min-w-[940px] divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No users found.</div>
          ) : (
            users.map((user) => (
              <div
                key={getUserId(user)}
                className="grid grid-cols-[1.3fr_1.5fr_0.8fr_0.8fr_1fr] items-center px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
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
                    onClick={() => openEditForm(user)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingUser(user)}
                    className="h-9 rounded-md border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">
            Page {meta?.page || page} of {meta?.totalPages || 1} · {meta?.total || 0} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!meta?.hasPrevPage}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!meta?.hasNextPage}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <UserFormModal
          title="Create user"
          subtitle={titleCopy.createTitle}
          form={createForm}
          roleOptions={roleOptions}
          error={createState.error}
          isLoading={createState.isLoading}
          submitLabel="Create User"
          loadingLabel="Creating"
          onChange={updateCreateField}
          onClose={closeCreateForm}
          onSubmit={handleCreateUser}
          includePassword
        />
      )}

      {editingUser && (
        <UserFormModal
          title="Edit user"
          subtitle={editingUser.email}
          form={editForm}
          roleOptions={roleOptions}
          error={updateState.error}
          isLoading={updateState.isLoading}
          submitLabel="Save Changes"
          loadingLabel="Saving"
          onChange={updateEditField}
          onClose={closeEditForm}
          onSubmit={handleUpdateUser}
        />
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Delete user</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">{deletingUser.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This user will be removed from active lists and all active refresh sessions will be revoked.
            </p>

            {deleteState.error && (
              <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {deleteState.error.data?.message || 'Unable to delete user'}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleteState.isLoading}
                className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteState.isLoading}
                className="h-10 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteState.isLoading ? 'Deleting' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function UserFormModal({
  title,
  subtitle,
  form,
  roleOptions,
  error,
  isLoading,
  submitLabel,
  loadingLabel,
  onChange,
  onClose,
  onSubmit,
  includePassword = false,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{title}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">{subtitle}</h3>
        </div>

        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role] || role}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
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
              onChange={onChange}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>

          {includePassword && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                minLength={6}
                maxLength={128}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                required
              />
            </label>
          )}

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error.data?.message || 'Unable to save user'}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsersPage;
