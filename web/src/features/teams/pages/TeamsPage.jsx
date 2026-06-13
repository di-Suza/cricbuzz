import { useState } from 'react';
import { useNavigate } from 'react-router';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import { useGetTeamsQuery, useDeleteTeamMutation } from '../api/teamsApi.js';
import TeamForm from './TeamForm.jsx';

function TeamsPage() {
  const { data: response, isLoading } = useGetTeamsQuery();
  const [deleteTeam] = useDeleteTeamMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const navigate = useNavigate();

  const teams = Array.isArray(response) ? response : (response?.data || []);

  const handleCreate = () => {
    setTeamToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (team, e) => {
    e.stopPropagation();
    setTeamToEdit(team);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this team?')) {
      await deleteTeam(id);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/teams/${id}`);
  };

  return (
    <>
      <ModulePage
        eyebrow="Catalogue"
        title="Teams"
        description="Manage franchise teams, squads, and draft statuses."
        permission="teams:manage"
        primaryAction="Create Team"
        onActionClick={handleCreate}
      >
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No teams found. Create one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Team</th>
                  <th className="px-6 py-4 font-semibold">Short Name</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Squad Size</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr 
                    key={team._id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(team._id)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{team.name}</div>
                        {team.primaryColor && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: team.primaryColor }}></span>
                            {team.primaryColor}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{team.shortName}</td>
                    <td className="px-6 py-4">
                      {team.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Ready / Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className={team.squadPlayers?.length === 11 ? 'text-emerald-600' : 'text-amber-600'}>
                        {team.squadPlayers?.length || 0} / 11
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => handleEdit(team, e)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">Edit</button>
                      <button onClick={(e) => handleDelete(team._id, e)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModulePage>

      <TeamForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={teamToEdit}
      />
    </>
  );
}

export default TeamsPage;
