import { useEffect, useMemo, useState } from 'react';
import LoadingLabel from '../../../shared/components/LoadingLabel.jsx';
import Modal from '../../../shared/components/Modal.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import {
  useCreateSeriesMutation,
  useGetEligibleSeriesTeamsQuery,
  useUpdateSeriesMutation,
} from '../api/seriesApi.js';

const FORMATS = [
  { value: 'A', label: 'A - Two groups' },
  { value: 'B', label: 'B - Top four playoffs' },
  { value: 'C', label: 'C - Custom league' },
];

const MATCH_TYPES = [
  { value: 'T20', label: 'T20' },
  { value: 'ODI', label: 'ODI' },
  { value: 'TEST', label: 'Test' },
];

function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function SeriesForm({ isOpen, onClose, series }) {
  const toast = useToast();
  const { data: eligibleTeams = [] } = useGetEligibleSeriesTeamsQuery(undefined, { skip: !isOpen });
  const [createSeries, createState] = useCreateSeriesMutation();
  const [updateSeries, updateState] = useUpdateSeriesMutation();
  const [form, setForm] = useState({
    name: '',
    season: '',
    startDate: '',
    endDate: '',
    format: 'C',
    matchType: 'T20',
    numberOfMatches: 1,
    teams: [],
  });

  useEffect(() => {
    if (series) {
      setForm({
        name: series.name || '',
        season: series.season || '',
        startDate: toDateInput(series.startDate),
        endDate: toDateInput(series.endDate),
        format: series.format || 'C',
        matchType: series.matchType || 'T20',
        numberOfMatches: series.numberOfMatches || 1,
        teams: (series.teams || []).map((entry) => ({
          team: entry.team?._id || entry.team || entry._id,
          group: entry.group || '',
        })),
      });
    } else {
      setForm({
        name: '',
        season: '',
        startDate: '',
        endDate: '',
        format: 'C',
        matchType: 'T20',
        numberOfMatches: 1,
        teams: [],
      });
    }
  }, [series, isOpen]);

  const selectedTeamIds = useMemo(() => new Set(form.teams.map((entry) => entry.team)), [form.teams]);
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleTeam = (teamId) => {
    setForm((current) => {
      if (current.teams.some((entry) => entry.team === teamId)) {
        return { ...current, teams: current.teams.filter((entry) => entry.team !== teamId) };
      }

      return { ...current, teams: [...current.teams, { team: teamId, group: current.format === 'A' ? 'A' : '' }] };
    });
  };

  const updateTeamGroup = (teamId, group) => {
    setForm((current) => ({
      ...current,
      teams: current.teams.map((entry) => (entry.team === teamId ? { ...entry, group } : entry)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const body = {
      ...form,
      numberOfMatches: Number(form.numberOfMatches),
      teams: form.teams.map((entry) => ({
        team: entry.team,
        group: form.format === 'A' ? entry.group || 'A' : null,
      })),
    };

    try {
      if (series) {
        await updateSeries({ id: series._id, body }).unwrap();
      } else {
        await createSeries(body).unwrap();
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to save series');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={series ? 'Edit Series' : 'Create Series'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Match Type</span>
            <select
              value={form.matchType}
              onChange={(event) => setField('matchType', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {MATCH_TYPES.map((matchType) => (
                <option key={matchType.value} value={matchType.value}>{matchType.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Season</span>
            <input
              required
              value={form.season}
              onChange={(event) => setField('season', event.target.value)}
              placeholder="2026"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Start Date</span>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">End Date</span>
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(event) => setField('endDate', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Format</span>
            <select
              value={form.format}
              onChange={(event) => setField('format', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {FORMATS.map((format) => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Number of Matches</span>
            <input
              required
              min="1"
              type="number"
              value={form.numberOfMatches}
              onChange={(event) => setField('numberOfMatches', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Allowed Teams</span>
            <span className="text-xs font-medium text-slate-500">{form.teams.length} selected</span>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-2">
            {eligibleTeams.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-slate-500">No teams have 11 squad players yet.</div>
            ) : (
              eligibleTeams.map((team) => (
                <div key={team._id} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.has(team._id)}
                    onChange={() => toggleTeam(team._id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{team.name}</div>
                    <div className="text-xs text-slate-500">{team.shortName} - {team.squadPlayers?.length || 0} players</div>
                  </div>
                  {form.format === 'A' && selectedTeamIds.has(team._id) && (
                    <select
                      value={form.teams.find((entry) => entry.team === team._id)?.group || 'A'}
                      onChange={(event) => updateTeamGroup(team._id, event.target.value)}
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                    >
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                    </select>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSubmitting ? <LoadingLabel label="Saving" /> : 'Save Series'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SeriesForm;
