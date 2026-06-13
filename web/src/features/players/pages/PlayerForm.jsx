import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import { useCreatePlayerMutation, useUpdatePlayerMutation } from '../api/playersApi.js';
import {
  PLAYER_BATTING_STYLE_OPTIONS,
  PLAYER_BOWLING_STYLE_OPTIONS,
  PLAYER_ROLE_OPTIONS,
} from '../constants/playerOptions.js';

function getKnownOptionValue(value, options) {
  return options.some((option) => option.value === value) ? value : '';
}

function PlayerForm({ isOpen, onClose, player }) {
  const [createPlayer, { isLoading: isCreating }] = useCreatePlayerMutation();
  const [updatePlayer, { isLoading: isUpdating }] = useUpdatePlayerMutation();

  const [name, setName] = useState('');
  const [role, setRole] = useState('BATSMAN');
  const [country, setCountry] = useState('');
  const [battingStyle, setBattingStyle] = useState('');
  const [bowlingStyle, setBowlingStyle] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setRole(player.role || 'BATSMAN');
      setCountry(player.country || '');
      setBattingStyle(getKnownOptionValue(player.battingStyle, PLAYER_BATTING_STYLE_OPTIONS));
      setBowlingStyle(getKnownOptionValue(player.bowlingStyle, PLAYER_BOWLING_STYLE_OPTIONS));
    } else {
      setName('');
      setRole('BATSMAN');
      setCountry('');
      setBattingStyle('');
      setBowlingStyle('');
    }
    setImageFile(null);
  }, [player, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('role', role);
    formData.append('country', country);
    if (battingStyle) formData.append('battingStyle', battingStyle);
    if (bowlingStyle) formData.append('bowlingStyle', bowlingStyle);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (player) {
        await updatePlayer({ id: player._id, formData }).unwrap();
      } else {
        await createPlayer(formData).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save player: ', err);
      alert(err.data?.message || 'Error saving player');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={player ? 'Edit Player' : 'Create New Player'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm bg-white"
            >
              {PLAYER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Country</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Batting Style</label>
            <select
              required
              value={battingStyle}
              onChange={(e) => setBattingStyle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            >
              <option value="">Select batting style</option>
              {PLAYER_BATTING_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bowling Style</label>
            <select
              value={bowlingStyle}
              onChange={(e) => setBowlingStyle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            >
              <option value="">Select bowling style</option>
              {PLAYER_BOWLING_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Profile Image</label>
          <div className="mt-1 flex items-center gap-4">
            {player?.image && !imageFile && (
              <img src={player.image} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
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
            {isSubmitting ? 'Saving...' : 'Save Player'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PlayerForm;
