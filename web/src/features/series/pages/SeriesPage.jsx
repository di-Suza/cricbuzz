import { useState } from 'react';
import ConfirmModal from '../../../shared/components/ConfirmModal.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import {
  useDeleteSeriesMutation,
  useGetSeriesQuery,
  useUpdateSeriesStatusMutation,
} from '../api/seriesApi.js';
import SeriesForm from './SeriesForm.jsx';

const STATUS_OPTIONS = ['', 'UPCOMING', 'LIVE', 'COMPLETED'];
const FORMAT_OPTIONS = ['', 'A', 'B', 'C'];
const MATCH_TYPE_OPTIONS = ['', 'T20', 'ODI', 'TEST'];

function formatDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function SeriesPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');
  const [matchType, setMatchType] = useState('');
  const [seriesToEdit, setSeriesToEdit] = useState(null);
  const [seriesToDelete, setSeriesToDelete] = useState(null);
  const [isSeriesFormOpen, setIsSeriesFormOpen] = useState(false);

  const { data: response = { data: [], meta: null }, isLoading, isFetching } = useGetSeriesQuery({
    page,
    limit,
    search,
    status,
    format,
    matchType,
  });
  const [deleteSeries, deleteState] = useDeleteSeriesMutation();
  const [updateStatus, updateStatusState] = useUpdateSeriesStatusMutation();

  const seriesList = response.data || [];
  const meta = response.meta;

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
      setSeriesToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to delete series');
    }
  };

  const changeStatus = async (seriesId, nextStatus) => {
    try {
      await updateStatus({ id: seriesId, status: nextStatus }).unwrap();
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update series status');
    }
  };

  return (
    <>
      <ModulePage
        eyebrow="Competition"
        title="Series"
        description="Create tournaments, select eligible teams, and manage lifecycle status."
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
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Match Type</span>
            <select value={matchType} onChange={resetPage(setMatchType)} className="mt-2 h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
              {MATCH_TYPE_OPTIONS.map((option) => (
                <option key={option || 'all'} value={option}>{option || 'All'}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <LoadingState label="Loading series" variant="panel" className="m-4" />
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
                  <tr key={series._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{series.name}</div>
                      <div className="text-xs text-slate-500">
                        Season {series.season} - Format {series.format} - {series.matchType || 'T20'}
                      </div>
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
            <LoadingState label="Updating series list" size="sm" variant="inline" />
          </div>
        )}
      </ModulePage>

      <SeriesForm
        isOpen={isSeriesFormOpen}
        onClose={() => setIsSeriesFormOpen(false)}
        series={seriesToEdit}
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
