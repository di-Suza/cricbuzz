import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import { useCreateTeamMutation, useUpdateTeamMutation } from '../api/teamsApi.js';

function TeamForm({ isOpen, onClose, team }) {
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setShortName(team.shortName || '');
      setPrimaryColor(team.primaryColor || '#10b981');
    } else {
      setName('');
      setShortName('');
      setPrimaryColor('#10b981');
    }
    setLogoFile(null);
  }, [team, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('shortName', shortName.toUpperCase());
    formData.append('primaryColor', primaryColor);
    if (logoFile) formData.append('logo', logoFile);

    try {
      if (team) {
        await updateTeam({ id: team._id, formData }).unwrap();
      } else {
        if (!logoFile) {
          alert('Logo is required for new teams');
          return;
        }
        await createTeam(formData).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save team: ', err);
      alert(err.data?.message || 'Error saving team');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={team ? 'Edit Team' : 'Create New Team'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Team Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Chennai Super Kings"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Short Name</label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="e.g. CSK"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="mt-1 block w-full uppercase rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Primary Color</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-9 rounded-md border border-slate-300 shadow-sm p-0.5 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="block w-full uppercase rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Team Logo</label>
          <div className="mt-1 flex items-center gap-4">
            {team?.logo && !logoFile && (
              <img src={team.logo} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm border border-slate-200" />
            )}
            <input
              type="file"
              accept="image/*"
              required={!team}
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TeamForm;
