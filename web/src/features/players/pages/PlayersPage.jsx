import { useState } from 'react';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import { useGetPlayersQuery, useDeletePlayerMutation } from '../api/playersApi.js';
import PlayerForm from './PlayerForm.jsx';

function PlayersPage() {
  const { data: response, isLoading } = useGetPlayersQuery();
  const [deletePlayer] = useDeletePlayerMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  console.log('API RESPONSE:', response);
  const players = Array.isArray(response) ? response : (response?.data || []);

  const handleCreate = () => {
    setPlayerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (player) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      await deletePlayer(id);
    }
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
                        {player.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{player.country}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(player)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">Edit</button>
                      <button onClick={() => handleDelete(player._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModulePage>

      <PlayerForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={playerToEdit}
      />
    </>
  );
}

export default PlayersPage;
