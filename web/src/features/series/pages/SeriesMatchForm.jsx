import { useEffect, useState } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import {
  useCreateSeriesMatchMutation,
  useUpdateSeriesMatchMutation,
} from '../api/seriesApi.js';

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function SeriesMatchForm({ isOpen, onClose, series, match }) {
  const [createMatch, createState] = useCreateSeriesMatchMutation();
  const [updateMatch, updateState] = useUpdateSeriesMatchMutation();
  const [form, setForm] = useState({
    team1: '',
    team2: '',
    scheduledAt: '',
    venue: '',
  });

  const teams = (series?.teams || []).map((entry) => entry.team || entry).filter(Boolean);
  const isSubmitting = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (match) {
      setForm({
        team1: match.team1?._id || match.team1 || '',
        team2: match.team2?._id || match.team2 || '',
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

    try {
      const body = {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      };

      if (match) {
        await updateMatch({ id: series._id, matchId: match._id, body }).unwrap();
      } else {
        await createMatch({ id: series._id, body }).unwrap();
      }
      onClose();
    } catch (error) {
      alert(error?.data?.message || 'Unable to save match');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={match ? 'Edit Match' : 'Create Match'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
                <option key={team._id} value={team._id}>{team.name}</option>
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
                <option key={team._id} value={team._id}>{team.name}</option>
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
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Match'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SeriesMatchForm;
