import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import LoadingLabel from '../../../shared/components/LoadingLabel.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import Modal from '../../../shared/components/Modal.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import { can } from '../../../shared/constants/permissions.js';
import { selectCurrentRole } from '../../auth/store/authSlice.js';
import { useGetSeriesQuery } from '../../series/api/seriesApi.js';
import {
  useCompleteMatchMutation,
  useDeleteMatchMutation,
  useGetMatchesQuery,
  useRecordTossMutation,
  useStartMatchMutation,
  useUpdateMatchStatusMutation,
} from '../api/matchesApi.js';
import MatchForm from './MatchForm.jsx';

const STATUS_OPTIONS = ['', 'UPCOMING', 'TOSS_COMPLETED', 'PLAYING_XI_SELECTED', 'LIVE', 'INNINGS_BREAK', 'COMPLETED'];
const STATUS_FLOW = ['DRAFT', 'UPCOMING', 'TOSS_COMPLETED', 'PLAYING_XI_SELECTED', 'LIVE', 'INNINGS_BREAK', 'COMPLETED'];

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getNextStatus(statusValue) {
  const currentIndex = STATUS_FLOW.indexOf(statusValue);
  if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return '';
  return STATUS_FLOW[currentIndex + 1];
}

function MatchesPage() {
  const toast = useToast();
  const role = useSelector(selectCurrentRole);
  const canManageMatches = can(role, 'matches:manage');
  const canManageLifecycle = can(role, 'matchLifecycle:manage');
  const [seriesSearch, setSeriesSearch] = useState('');
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [venueSearch, setVenueSearch] = useState('');
  const [matchToEdit, setMatchToEdit] = useState(null);
  const [isMatchFormOpen, setIsMatchFormOpen] = useState(false);
  const [matchForStatus, setMatchForStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({
    tossWinner: '',
    tossDecision: 'BAT',
    winner: '',
    result: '',
  });
  const [updateMatchStatus, statusUpdateState] = useUpdateMatchStatusMutation();
  const [recordToss, tossState] = useRecordTossMutation();
  const [startMatch, startState] = useStartMatchMutation();
  const [completeMatch, completeState] = useCompleteMatchMutation();
  const [deleteMatch] = useDeleteMatchMutation();

  const { data: seriesResponse = { data: [], meta: null }, isLoading: isSeriesLoading } = useGetSeriesQuery({
    page: 1,
    limit: 100,
    search: seriesSearch,
  }, { skip: !canManageMatches });
  const selectedSeries = useMemo(
    () => (seriesResponse.data || []).find((series) => String(series._id) === String(selectedSeriesId)) || null,
    [seriesResponse.data, selectedSeriesId]
  );
  const { data: matchesResponse = { data: [], meta: null }, isLoading: isMatchesLoading, isFetching } = useGetMatchesQuery(
    {
      page,
      limit,
      seriesId: canManageMatches ? selectedSeriesId : '',
      status,
      search: venueSearch,
    },
    { skip: canManageMatches && !selectedSeriesId }
  );

  const seriesList = seriesResponse.data || [];
  const matches = matchesResponse.data || [];
  const meta = matchesResponse.meta;
  const selectedSeriesTeams = selectedSeries?.teams || [];
  const canCreateMatch = Boolean(canManageMatches && selectedSeriesId && selectedSeriesTeams.length >= 2);

  useEffect(() => {
    if (canManageMatches && !selectedSeriesId && seriesList.length > 0) {
      setSelectedSeriesId(seriesList[0]._id);
    }
  }, [canManageMatches, selectedSeriesId, seriesList]);

  const openCreateMatch = () => {
    if (!canCreateMatch) {
      toast.error('Select a series with at least two teams before creating a match');
      return;
    }

    setMatchToEdit(null);
    setIsMatchFormOpen(true);
  };

  const openEditMatch = (match) => {
    setMatchToEdit(match);
    setIsMatchFormOpen(true);
  };

  const openStatusModal = (match) => {
    const firstTeamId = match?.team1?._id || '';
    setMatchForStatus(match);
    setStatusForm({
      tossWinner: firstTeamId,
      tossDecision: 'BAT',
      winner: firstTeamId,
      result: '',
    });
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(matchForStatus?.status);
    if (!matchForStatus?._id || !nextStatus) return;

    try {
      if (nextStatus === 'TOSS_COMPLETED') {
        await recordToss({
          id: matchForStatus._id,
          body: {
            tossWinner: statusForm.tossWinner,
            tossDecision: statusForm.tossDecision,
          },
        }).unwrap();
      } else if (nextStatus === 'LIVE') {
        await startMatch(matchForStatus._id).unwrap();
      } else if (nextStatus === 'COMPLETED') {
        await completeMatch({
          id: matchForStatus._id,
          body: {
            winner: statusForm.winner,
            result: statusForm.result,
          },
        }).unwrap();
      } else {
        await updateMatchStatus({ id: matchForStatus._id, status: nextStatus }).unwrap();
      }
      setMatchForStatus(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update match status');
    }
  };

  const handleSeriesSearchChange = (event) => {
    setSeriesSearch(event.target.value);
    setSelectedSeriesId('');
    setPage(1);
  };

  const handleSelectSeries = (seriesId) => {
    setSelectedSeriesId(seriesId);
    setPage(1);
    setStatus('');
    setVenueSearch('');
  };

  const setStatusField = (field, value) => {
    setStatusForm((current) => ({ ...current, [field]: value }));
  };

  const handleLimitChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <>
      <ModulePage
        eyebrow="Operations"
        title="Matches"
        description="Create fixtures from selected series teams and move live operations through the correct match lifecycle."
        permission="matches:manage"
        primaryAction={canManageMatches ? 'Create Match' : null}
        onActionClick={openCreateMatch}
      >
        <div className="grid min-h-[620px] lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r">
            {canManageMatches ? (
              <>
                <div className="border-b border-slate-200 bg-white p-4">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Series</span>
                    <input
                      type="search"
                      value={seriesSearch}
                      onChange={handleSeriesSearchChange}
                      placeholder="Find series"
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                </div>

                <div className="divide-y divide-slate-200">
                  {isSeriesLoading ? (
                    <LoadingState label="Loading series" variant="panel" className="m-4 min-h-32" />
                  ) : seriesList.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">No series available. Create a series first.</div>
                  ) : (
                    seriesList.map((series) => {
                      const isSelected = String(series._id) === String(selectedSeriesId);

                      return (
                        <button
                          type="button"
                          key={series._id}
                          onClick={() => handleSelectSeries(series._id)}
                          className={`w-full px-4 py-4 text-left transition ${
                            isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-950">{series.name}</span>
                              <span className="text-xs text-slate-500">
                                {series.matchType || 'T20'} - {series.teams?.length || 0} teams
                              </span>
                            </span>
                            <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {series.status}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">Live operations</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Scorers can record toss, start live matches, and complete active matches.
                  </p>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
                  <select
                    value={status}
                    onChange={handleFilterChange(setStatus)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option || 'all'} value={option}>{option || 'All'}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </aside>

          <section className="bg-white">
            {canManageMatches && !selectedSeriesId ? (
              <div className="flex min-h-[420px] items-center justify-center p-8 text-center text-slate-500">
                Select a series to manage its matches.
              </div>
            ) : (
              <div className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {selectedSeries ? `${selectedSeries.season || 'Season'} - ${selectedSeries.matchType || 'T20'}` : 'All active series'}
                    </p>
                    <h3 className="text-xl font-bold text-slate-950">{selectedSeries?.name || 'All Matches'}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedSeries ? (
                      <span className="rounded-md bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        {selectedSeriesTeams.length} teams
                      </span>
                    ) : null}
                    <span className="rounded-md bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {meta?.total || 0}/{selectedSeries?.numberOfMatches || 0} scheduled
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <label className="min-w-64 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Venue</span>
                    <input
                      type="search"
                      value={venueSearch}
                      onChange={handleFilterChange(setVenueSearch)}
                      placeholder="Search venue"
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                  <label className="w-full sm:w-56">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
                    <select
                      value={status}
                      onChange={handleFilterChange(setStatus)}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option || 'all'} value={option}>{option || 'All'}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Fixture</th>
                        <th className="px-6 py-3 font-semibold">Schedule</th>
                        <th className="px-6 py-3 font-semibold">Venue</th>
                        <th className="px-6 py-3 font-semibold">Type</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isMatchesLoading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-6">
                            <LoadingState label="Loading matches" variant="row" />
                          </td>
                        </tr>
                      ) : matches.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No matches scheduled for this series.</td>
                        </tr>
                      ) : (
                        matches.map((match) => (
                          <tr key={match._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                            </td>
                            <td className="px-6 py-4">{formatDateTime(match.scheduledAt)}</td>
                            <td className="px-6 py-4">{match.venue || 'Not set'}</td>
                            <td className="px-6 py-4">{match.matchType || selectedSeries?.matchType || 'T20'}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                {match.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(match)}
                                  disabled={!canManageLifecycle || !getNextStatus(match.status)}
                                  className="font-medium text-emerald-700 hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                >
                                  Status
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditMatch(match)}
                                  disabled={!canManageMatches || match.status !== 'UPCOMING'}
                                  className="font-medium text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <PaginationBar
                    meta={meta}
                    limit={limit}
                    onLimitChange={handleLimitChange}
                    onPageChange={setPage}
                  />

                  {isFetching && !isMatchesLoading && (
                    <div className="border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500">
                      <LoadingState label="Updating matches" size="sm" variant="inline" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </ModulePage>

      <MatchForm
        isOpen={isMatchFormOpen}
        onClose={() => setIsMatchFormOpen(false)}
        series={selectedSeries}
        match={matchToEdit}
      />

      <Modal isOpen={Boolean(matchForStatus)} onClose={() => setMatchForStatus(null)} title="Update Match Status">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {getTeamName(matchForStatus?.team1)} vs {getTeamName(matchForStatus?.team2)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(matchForStatus?.scheduledAt)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current</p>
              <p className="mt-1 text-sm font-bold text-slate-950">{matchForStatus?.status || 'Not set'}</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Next Step</p>
              <p className="mt-1 text-sm font-bold text-emerald-900">{getNextStatus(matchForStatus?.status) || 'Lifecycle complete'}</p>
            </div>
          </div>

          {getNextStatus(matchForStatus?.status) === 'TOSS_COMPLETED' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toss Winner</span>
                <select
                  value={statusForm.tossWinner}
                  onChange={(event) => setStatusField('tossWinner', event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  {[matchForStatus?.team1, matchForStatus?.team2].filter(Boolean).map((team) => (
                    <option key={team._id} value={team._id}>{team.name || team.shortName}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision</span>
                <select
                  value={statusForm.tossDecision}
                  onChange={(event) => setStatusField('tossDecision', event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="BAT">Bat first</option>
                  <option value="BOWL">Bowl first</option>
                </select>
              </label>
            </div>
          ) : null}

          {getNextStatus(matchForStatus?.status) === 'COMPLETED' ? (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Winner</span>
                <select
                  value={statusForm.winner}
                  onChange={(event) => setStatusField('winner', event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  {[matchForStatus?.team1, matchForStatus?.team2].filter(Boolean).map((team) => (
                    <option key={team._id} value={team._id}>{team.name || team.shortName}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</span>
                <input
                  value={statusForm.result}
                  onChange={(event) => setStatusField('result', event.target.value)}
                  placeholder="India won by 6 wickets"
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>
            </div>
          ) : null}

          <p className="text-sm leading-6 text-slate-600">
            Match status moves one lifecycle step at a time. Toss records winner and decision before Playing XI selection.
          </p>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setMatchForStatus(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                statusUpdateState.isLoading
                || tossState.isLoading
                || startState.isLoading
                || completeState.isLoading
                || !getNextStatus(matchForStatus?.status)
                || (getNextStatus(matchForStatus?.status) === 'COMPLETED' && !statusForm.result.trim())
              }
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {statusUpdateState.isLoading || tossState.isLoading || startState.isLoading || completeState.isLoading ? (
                <LoadingLabel label="Updating" />
              ) : (
                'Move Status'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default MatchesPage;
