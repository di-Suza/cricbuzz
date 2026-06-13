import { useState } from 'react';
import ConfirmModal from '../../../shared/components/ConfirmModal.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import {
  useDeleteSeriesMutation,
  useGetSeriesMatchesQuery,
  useGetSeriesQuery,
  useUpdateSeriesStatusMutation,
} from '../api/seriesApi.js';
import SeriesForm from './SeriesForm.jsx';
import SeriesMatchForm from './SeriesMatchForm.jsx';

const STATUS_OPTIONS = ['', 'UPCOMING', 'LIVE', 'COMPLETED'];
const FORMAT_OPTIONS = ['', 'A', 'B', 'C'];

function formatDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function SeriesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');
  const [seriesToEdit, setSeriesToEdit] = useState(null);
  const [seriesToDelete, setSeriesToDelete] = useState(null);
  const [isSeriesFormOpen, setIsSeriesFormOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [matchToEdit, setMatchToEdit] = useState(null);
  const [isMatchFormOpen, setIsMatchFormOpen] = useState(false);

  const { data: response = { data: [], meta: null }, isLoading, isFetching } = useGetSeriesQuery({
    page,
    limit,
    search,
    status,
    format,
  });
  const { data: matches = [], isFetching: isFetchingMatches } = useGetSeriesMatchesQuery(selectedSeries?._id, {
    skip: !selectedSeries?._id,
  });
  const [deleteSeries, deleteState] = useDeleteSeriesMutation();
  const [updateStatus, updateStatusState] = useUpdateSeriesStatusMutation();

  const seriesList = response.data || [];
  const meta = response.meta;
  const activeSeries = selectedSeries && seriesList.find((item) => item._id === selectedSeries._id) || selectedSeries;

  const resetPage = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const openCreateSeries = () => {
    setSeriesToEdit(null);
    setIsSeriesFormOpen(true);
  };

  const openEditSeries = (series) => {
    setSeriesToEdit(series);
    setIsSeriesFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!seriesToDelete?._id) return;

    try {
      await deleteSeries(seriesToDelete._id).unwrap();
      if (selectedSeries?._id === seriesToDelete._id) setSelectedSeries(null);
      setSeriesToDelete(null);
    } catch (error) {
      alert(error?.data?.message || 'Unable to delete series');
    }
  };

  const changeStatus = async (seriesId, nextStatus) => {
    try {
      await updateStatus({ id: seriesId, status: nextStatus }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Unable to update series status');
    }
  };

  const openCreateMatch = () => {
    setMatchToEdit(null);
    setIsMatchFormOpen(true);
  };

  const openEditMatch = (match) => {
    setMatchToEdit(match);
    setIsMatchFormOpen(true);
  };

  return (
    <>
      <ModulePage
        eyebrow="Competition"
        title="Series"
        description="Create tournaments, assign eligible teams, manage lifecycle status, and schedule series matches."
        permission="series:manage"
        primaryAction="Create Series"
        onActionClick={openCreateSeries}
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-4 py-4">
          <label className="min-w-64 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={search}
              onChange={resetPage(setSearch)}
              placeholder="Find by series name or season"
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <select value={status} onChange={resetPage(setStatus)} className="mt-2 h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
              {STATUS_OPTIONS.map((option) => (
                <option key={option || 'all'} value={option}>{option || 'All'}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Format</span>
            <select value={format} onChange={resetPage(setFormat)} className="mt-2 h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
              {FORMAT_OPTIONS.map((option) => (
                <option key={option || 'all'} value={option}>{option || 'All'}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading series...</div>
        ) : seriesList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No series found. Create one to schedule matches.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Series</th>
                  <th className="px-6 py-4 font-semibold">Window</th>
                  <th className="px-6 py-4 font-semibold">Teams</th>
                  <th className="px-6 py-4 font-semibold">Matches</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seriesList.map((series) => (
                  <tr key={series._id} className={selectedSeries?._id === series._id ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => setSelectedSeries(series)} className="text-left">
                        <div className="font-semibold text-slate-900">{series.name}</div>
                        <div className="text-xs text-slate-500">Season {series.season} · Format {series.format}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{formatDate(series.startDate)}</div>
                      <div className="text-slate-400">{formatDate(series.endDate)}</div>
                    </td>
                    <td className="px-6 py-4">{series.teams?.length || 0}</td>
                    <td className="px-6 py-4">{series.numberOfMatches}</td>
                    <td className="px-6 py-4">
                      <select
                        value={series.status}
                        disabled={updateStatusState.isLoading}
                        onChange={(event) => changeStatus(series._id, event.target.value)}
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="LIVE">LIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditSeries(series)} className="mr-4 font-medium text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => setSeriesToDelete(series)} className="font-medium text-red-600 hover:text-red-900">Delete</button>
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
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          onPageChange={setPage}
        />

        {isFetching && !isLoading && (
          <div className="border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500">
            Updating series list...
          </div>
        )}
      </ModulePage>

      {activeSeries && (
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{activeSeries.name} Matches</h3>
              <p className="text-sm text-slate-500">{matches.length} of {activeSeries.numberOfMatches} scheduled</p>
            </div>
            <button
              type="button"
              onClick={openCreateMatch}
              className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create Match
            </button>
          </div>

          {isFetchingMatches ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No matches scheduled for this series.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fixture</th>
                    <th className="px-6 py-3 font-semibold">Schedule</th>
                    <th className="px-6 py-3 font-semibold">Venue</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matches.map((match) => (
                    <tr key={match._id}>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {match.team1?.shortName || match.team1?.name} vs {match.team2?.shortName || match.team2?.name}
                      </td>
                      <td className="px-6 py-4">{formatDateTime(match.scheduledAt)}</td>
                      <td className="px-6 py-4">{match.venue || 'Not set'}</td>
                      <td className="px-6 py-4">{match.status}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditMatch(match)} className="font-medium text-indigo-600 hover:text-indigo-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <SeriesForm
        isOpen={isSeriesFormOpen}
        onClose={() => setIsSeriesFormOpen(false)}
        series={seriesToEdit}
      />

      <SeriesMatchForm
        isOpen={isMatchFormOpen}
        onClose={() => setIsMatchFormOpen(false)}
        series={activeSeries}
        match={matchToEdit}
      />

      <ConfirmModal
        isOpen={Boolean(seriesToDelete)}
        title="Delete series"
        message={`Delete ${seriesToDelete?.name || 'this series'}? This is blocked while any scheduled match exists.`}
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default SeriesPage;
