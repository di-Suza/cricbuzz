import { useEffect, useState } from 'react';

import Modal from '../../../shared/components/Modal.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import { useGetMatchesQuery } from '../../matches/api/matchesApi.js';
import { useGetPlayingXiQuery, useSavePlayingXiMutation } from '../api/playingXiApi.js';

const PLAYING_XI_READY_STATUS = 'TOSS_COMPLETED';

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getPlayerId(player) {
  return String(player?._id || player?.id || player);
}

function buildLineupPayload(lineupState = {}) {
  return Object.entries(lineupState)
    .filter(([, value]) => value.selected)
    .map(([player, value]) => ({
      player,
      isCaptain: Boolean(value.isCaptain),
      isWicketKeeper: Boolean(value.isWicketKeeper),
    }));
}

function getLineupSummary(lineupState = {}) {
  const selected = buildLineupPayload(lineupState);
  return {
    selectedCount: selected.length,
    captainCount: selected.filter((entry) => entry.isCaptain).length,
    wicketKeeperCount: selected.filter((entry) => entry.isWicketKeeper).length,
  };
}

function isLineupReady(lineupState = {}) {
  const summary = getLineupSummary(lineupState);
  return summary.selectedCount === 11 && summary.captainCount === 1 && summary.wicketKeeperCount === 1;
}

function createEmptyLineup(match) {
  const nextState = { team1: {}, team2: {} };

  ['team1', 'team2'].forEach((side) => {
    (match?.playingXI?.[side] || []).forEach((entry) => {
      const playerId = getPlayerId(entry.player);
      nextState[side][playerId] = {
        selected: true,
        isCaptain: Boolean(entry.isCaptain),
        isWicketKeeper: Boolean(entry.isWicketKeeper),
      };
    });
  });

  return nextState;
}

function TeamLineupPicker({ label, team, lineup, search, onSearchChange, onTogglePlayer, onSetCaptain, onSetWicketKeeper }) {
  const squadPlayers = team?.squadPlayers || [];
  const normalizedSearch = search.trim().toLowerCase();
  const visiblePlayers = squadPlayers.filter((player) => {
    if (!normalizedSearch) return true;
    return [player.name, player.role, player.country].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
  });
  const summary = getLineupSummary(lineup);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <h4 className="text-lg font-bold text-slate-950">{team?.name || 'Team'}</h4>
          </div>
          <div className="flex gap-2">
            <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {summary.selectedCount}/11
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
              summary.captainCount === 1
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                : 'bg-amber-50 text-amber-700 ring-amber-100'
            }`}>
              C {summary.captainCount}/1
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
              summary.wicketKeeperCount === 1
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                : 'bg-amber-50 text-amber-700 ring-amber-100'
            }`}>
              WK {summary.wicketKeeperCount}/1
            </span>
          </div>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search squad"
          className="mt-3 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {visiblePlayers.length === 0 ? (
          <div className="p-5 text-center text-sm text-slate-500">No squad players found.</div>
        ) : (
          visiblePlayers.map((player) => {
            const playerId = getPlayerId(player);
            const state = lineup[playerId] || {};
            const isSelected = Boolean(state.selected);

            return (
              <div key={playerId} className="grid grid-cols-[1fr_48px_48px] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                <label className="flex min-w-0 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTogglePlayer(playerId)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-950">{player.name}</span>
                    <span className="text-xs text-slate-500">{player.role} - {player.country}</span>
                  </span>
                </label>

                <label className={`flex items-center justify-center text-xs font-bold ${isSelected ? 'text-slate-700' : 'text-slate-300'}`}>
                  <input
                    type="radio"
                    name={`${label}-captain`}
                    checked={Boolean(state.isCaptain)}
                    disabled={!isSelected}
                    onChange={() => onSetCaptain(playerId)}
                    className="sr-only"
                  />
                  <span className={`rounded-md px-2 py-1 ring-1 ${state.isCaptain ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white ring-slate-200'}`}>
                    C
                  </span>
                </label>

                <label className={`flex items-center justify-center text-xs font-bold ${isSelected ? 'text-slate-700' : 'text-slate-300'}`}>
                  <input
                    type="radio"
                    name={`${label}-wicket-keeper`}
                    checked={Boolean(state.isWicketKeeper)}
                    disabled={!isSelected}
                    onChange={() => onSetWicketKeeper(playerId)}
                    className="sr-only"
                  />
                  <span className={`rounded-md px-2 py-1 ring-1 ${state.isWicketKeeper ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white ring-slate-200'}`}>
                    WK
                  </span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function PlayingXiModal({ matchId, onClose }) {
  const toast = useToast();
  const { data: match, isLoading } = useGetPlayingXiQuery(matchId, { skip: !matchId });
  const [savePlayingXi, saveState] = useSavePlayingXiMutation();
  const [search, setSearch] = useState({ team1: '', team2: '' });
  const [lineups, setLineups] = useState({ team1: {}, team2: {} });

  useEffect(() => {
    if (match?._id) {
      setLineups(createEmptyLineup(match));
      setSearch({ team1: '', team2: '' });
    }
  }, [match]);

  const ready = isLineupReady(lineups.team1) && isLineupReady(lineups.team2);

  const setSearchForSide = (side, value) => {
    setSearch((current) => ({ ...current, [side]: value }));
  };

  const togglePlayer = (side, playerId) => {
    setLineups((current) => {
      const sideState = current[side] || {};
      const currentPlayer = sideState[playerId] || {};
      const selectedCount = getLineupSummary(sideState).selectedCount;
      const nextSelected = !currentPlayer.selected;

      if (nextSelected && selectedCount >= 11) {
        return current;
      }

      return {
        ...current,
        [side]: {
          ...sideState,
          [playerId]: {
            selected: nextSelected,
            isCaptain: nextSelected ? Boolean(currentPlayer.isCaptain) : false,
            isWicketKeeper: nextSelected ? Boolean(currentPlayer.isWicketKeeper) : false,
          },
        },
      };
    });
  };

  const setExclusiveFlag = (side, playerId, flag) => {
    setLineups((current) => {
      const sideState = current[side] || {};
      const nextSideState = Object.fromEntries(
        Object.entries(sideState).map(([id, value]) => [
          id,
          {
            ...value,
            [flag]: id === playerId,
          },
        ])
      );

      return {
        ...current,
        [side]: {
          ...nextSideState,
          [playerId]: {
            ...(nextSideState[playerId] || {}),
            selected: true,
            [flag]: true,
          },
        },
      };
    });
  };

  const handleConfirm = async () => {
    if (!ready || !matchId) return;

    try {
      await savePlayingXi({
        matchId,
        body: {
          team1: buildLineupPayload(lineups.team1),
          team2: buildLineupPayload(lineups.team2),
        },
      }).unwrap();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to save Playing XI');
    }
  };

  return (
    <Modal isOpen={Boolean(matchId)} onClose={saveState.isLoading ? undefined : onClose} title="Select Playing XI" maxWidth="max-w-6xl">
      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading match squads...</div>
      ) : !match ? (
        <div className="py-10 text-center text-sm text-slate-500">Match not found.</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {getTeamName(match.team1)} vs {getTeamName(match.team2)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {match.series?.name || 'Series'} - {formatDateTime(match.scheduledAt)} - {match.status}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLineupPicker
              label="Team 1"
              team={match.team1}
              lineup={lineups.team1}
              search={search.team1}
              onSearchChange={(value) => setSearchForSide('team1', value)}
              onTogglePlayer={(playerId) => togglePlayer('team1', playerId)}
              onSetCaptain={(playerId) => setExclusiveFlag('team1', playerId, 'isCaptain')}
              onSetWicketKeeper={(playerId) => setExclusiveFlag('team1', playerId, 'isWicketKeeper')}
            />

            <TeamLineupPicker
              label="Team 2"
              team={match.team2}
              lineup={lineups.team2}
              search={search.team2}
              onSearchChange={(value) => setSearchForSide('team2', value)}
              onTogglePlayer={(playerId) => togglePlayer('team2', playerId)}
              onSetCaptain={(playerId) => setExclusiveFlag('team2', playerId, 'isCaptain')}
              onSetWicketKeeper={(playerId) => setExclusiveFlag('team2', playerId, 'isWicketKeeper')}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className={`text-sm font-semibold ${ready ? 'text-emerald-700' : 'text-amber-700'}`}>
              {ready ? 'Ready to confirm' : 'Each team needs 11 players, 1 captain, and 1 wicket keeper'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saveState.isLoading}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!ready || saveState.isLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saveState.isLoading ? 'Confirming...' : 'Confirm XI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function PlayingXiPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeMatchId, setActiveMatchId] = useState('');
  const { data: matchesResponse = { data: [], meta: null }, isLoading, isFetching } = useGetMatchesQuery({
    page,
    limit,
    status: PLAYING_XI_READY_STATUS,
  });
  const matches = matchesResponse.data || [];
  const meta = matchesResponse.meta;

  const handleLimitChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <>
      <ModulePage
        eyebrow="Match setup"
        title="Playing XI"
        description="Only toss-completed matches appear here so XI selection starts at the correct lifecycle step."
        permission="playingXi:manage"
        primaryAction={null}
      >
        <div className="space-y-5 p-4 sm:p-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">Eligible status: {PLAYING_XI_READY_STATUS}</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Fixture</th>
                  <th className="px-6 py-3 font-semibold">Series</th>
                  <th className="px-6 py-3 font-semibold">Schedule</th>
                  <th className="px-6 py-3 font-semibold">Venue</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading eligible matches...</td>
                  </tr>
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      No toss-completed matches ready for Playing XI.
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => (
                    <tr key={match._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                      </td>
                      <td className="px-6 py-4">{match.series?.name || 'Series'}</td>
                      <td className="px-6 py-4">{formatDateTime(match.scheduledAt)}</td>
                      <td className="px-6 py-4">{match.venue || 'Not set'}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                          {match.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveMatchId(match._id)}
                          className="font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Select XI
                        </button>
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

            {isFetching && !isLoading && (
              <div className="border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500">
                Updating eligible matches...
              </div>
            )}
          </div>
        </div>
      </ModulePage>

      <PlayingXiModal matchId={activeMatchId} onClose={() => setActiveMatchId('')} />
    </>
  );
}

export default PlayingXiPage;
