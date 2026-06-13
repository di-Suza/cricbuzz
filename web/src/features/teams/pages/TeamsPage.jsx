import { useState } from 'react';
import { useNavigate } from 'react-router';
import ConfirmModal from '../../../shared/components/ConfirmModal.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useGetTeamsQuery, useDeleteTeamMutation } from '../api/teamsApi.js';
import TeamForm from './TeamForm.jsx';

function TeamsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const { data: response = { data: [], meta: null }, isLoading, isFetching } = useGetTeamsQuery({
    page,
    limit,
    search,
    status,
  });
  const [deleteTeam, deleteState] = useDeleteTeamMutation();
  const navigate = useNavigate();

  const teams = response.data || [];
  const meta = response.meta;

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
    const team = teams.find((item) => item._id === id);
    setTeamToDelete(team || { _id: id });
  };

  const confirmDelete = async () => {
    if (!teamToDelete?._id) return;

    try {
      await deleteTeam(teamToDelete._id).unwrap();
      setTeamToDelete(null);
    } catch (error) {
      alert(error?.data?.message || 'Unable to delete team');
    }
  };

  const handleRowClick = (id) => {
    navigate(`/teams/${id}`);
  };

  const handleLimitChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
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
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-4 py-4">
          <label className="min-w-64 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Find by team name or short name"
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="w-full sm:w-52">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <select
              value={status}
              onChange={handleStatusChange}
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
        </div>

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

        <PaginationBar
          meta={meta}
          limit={limit}
          onLimitChange={handleLimitChange}
          onPageChange={setPage}
        />

        {isFetching && !isLoading && (
          <div className="border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500">
            Updating team list...
          </div>
        )}
      </ModulePage>

      <TeamForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={teamToEdit}
      />

      <ConfirmModal
        isOpen={Boolean(teamToDelete)}
        title="Delete team"
        message={`Delete ${teamToDelete?.name || 'this team'}? This will be blocked if the team is already linked with matches or series.`}
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onClose={() => setTeamToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default TeamsPage;
