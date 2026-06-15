import { useState } from 'react';
import ConfirmModal from '../../../shared/components/ConfirmModal.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import { useGetPlayersQuery, useDeletePlayerMutation } from '../api/playersApi.js';
import { PLAYER_ROLE_OPTIONS, formatPlayerOptionValue } from '../constants/playerOptions.js';
import PlayerForm from './PlayerForm.jsx';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...PLAYER_ROLE_OPTIONS,
];

function formatRole(role = '') {
  return formatPlayerOptionValue(role);
}

function PlayersPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const { data: response = { data: [], meta: null }, isLoading, isFetching } = useGetPlayersQuery({
    page,
    limit,
    search,
    role,
  });
  const [deletePlayer, deleteState] = useDeletePlayerMutation();

  const players = response.data || [];
  const meta = response.meta;

  const handleCreate = () => {
    setPlayerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (player) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  const handleDelete = (player) => {
    setPlayerToDelete(player);
  };

  const confirmDelete = async () => {
    if (!playerToDelete?._id) return;

    try {
      await deletePlayer(playerToDelete._id).unwrap();
      setPlayerToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to delete player');
    }
  };

  const handleLimitChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setPage(1);
  };

  return (
    <>
      <ModulePage
        eyebrow="Catalogue"
        title="Players"
        description="Manage global player records used across teams, squads, and match lineups."
        permission="players:manage"
        primaryAction="Create Player"
        onActionClick={handleCreate}
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-4 py-4">
          <label className="min-w-64 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Find by player name"
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="w-full sm:w-52">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
            <select
              value={role}
              onChange={handleRoleChange}
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No players found. Create one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Player</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((player) => (
                  <tr key={player._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                          {player.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        {player.teamId && <div className="text-xs text-emerald-600 font-medium">Assigned to team</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {formatRole(player.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{player.country}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(player)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">Edit</button>
                      <button onClick={() => handleDelete(player)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationBar
          meta={meta}
          limit={limit}
          onLimitChange={handleLimitChange}
          onPageChange={setPage}
        />

        {isFetching && !isLoading && (
          <div className="border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500">
            Updating player list...
          </div>
        )}
      </ModulePage>

      <PlayerForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={playerToEdit}
      />

      <ConfirmModal
        isOpen={Boolean(playerToDelete)}
        title="Delete player"
        message={`Delete ${playerToDelete?.name || 'this player'}? This will be blocked if the player is already linked with a squad or Playing XI.`}
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default PlayersPage;
