import { useEffect, useMemo, useState } from 'react';
import LoadingLabel from '../../../shared/components/LoadingLabel.jsx';
import Modal from '../../../shared/components/Modal.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import {
  useCreateMatchMutation,
  useUpdateMatchMutation,
} from '../api/matchesApi.js';

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toEndOfDayDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  date.setHours(23, 59, 0, 0);
  return toDateTimeInput(date);
}

function getTeamId(team) {
  return team?._id || team?.id || team;
}

function MatchForm({ isOpen, onClose, series, match }) {
  const toast = useToast();
  const [createMatch, createState] = useCreateMatchMutation();
  const [updateMatch, updateState] = useUpdateMatchMutation();
  const [form, setForm] = useState({
    team1: '',
    team2: '',
    scheduledAt: '',
    venue: '',
  });

  const teams = useMemo(() => (series?.teams || []).map((entry) => entry.team || entry).filter(Boolean), [series]);
  const isSubmitting = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (match) {
      setForm({
        team1: getTeamId(match.team1) || '',
        team2: getTeamId(match.team2) || '',
        scheduledAt: toDateTimeInput(match.scheduledAt),
        venue: match.venue || '',
      });
    } else {
      setForm({
        team1: '',
        team2: '',
        scheduledAt: '',
        venue: '',
      });
    }
  }, [match, isOpen]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!series?._id) return;
    if (form.team1 === form.team2) {
      toast.error('Both teams must be different');
      return;
    }

    const body = {
      team1: form.team1,
      team2: form.team2,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      venue: form.venue,
    };

    try {
      if (match) {
        await updateMatch({ id: match._id, body }).unwrap();
      } else {
        await createMatch({ ...body, seriesId: series._id }).unwrap();
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to save match');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={match ? 'Edit Match' : 'Create Match'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <div className="font-semibold text-slate-900">{series?.name || 'Select series first'}</div>
          <div className="text-xs text-slate-500">
            {series?.matchType || 'T20'} - {teams.length} teams available
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Team 1</span>
            <select
              required
              value={form.team1}
              onChange={(event) => setField('team1', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={getTeamId(team)} value={getTeamId(team)} disabled={form.team2 === getTeamId(team)}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Team 2</span>
            <select
              required
              value={form.team2}
              onChange={(event) => setField('team2', event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={getTeamId(team)} value={getTeamId(team)} disabled={form.team1 === getTeamId(team)}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Date and Time</span>
          <input
            required
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(event) => setField('scheduledAt', event.target.value)}
            min={toDateTimeInput(series?.startDate)}
            max={toEndOfDayDateTimeInput(series?.endDate)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Venue</span>
          <input
            value={form.venue}
            onChange={(event) => setField('venue', event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !series?._id} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSubmitting ? <LoadingLabel label="Saving" /> : 'Save Match'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MatchForm;
