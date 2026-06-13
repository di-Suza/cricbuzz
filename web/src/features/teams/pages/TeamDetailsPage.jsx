import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';

import { useGetPlayersQuery } from '../../players/api/playersApi.js';
import { PLAYER_ROLE_OPTIONS, formatPlayerOptionValue } from '../../players/constants/playerOptions.js';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import {
  useAssignPlayerToTeamMutation,
  useGetTeamByIdQuery,
  useRemovePlayerFromTeamMutation,
} from '../api/teamsApi.js';

function getPlayerId(player) {
  return player?._id || player?.id || player;
}

function formatRole(role = '') {
  return formatPlayerOptionValue(role);
}

function TeamDetailsPage() {
  const { id } = useParams();
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [playerPage, setPlayerPage] = useState(1);
  const [playerLimit, setPlayerLimit] = useState(10);
  const [activeAssignId, setActiveAssignId] = useState(null);
  const { data: team, isLoading: isTeamLoading } = useGetTeamByIdQuery(id);
  const { data: playersResponse = { data: [], meta: null }, isFetching: isPlayersFetching } = useGetPlayersQuery({
    page: playerPage,
    limit: playerLimit,
    search: playerSearch,
    role: playerRole,
  });
  const [assignPlayer, assignState] = useAssignPlayerToTeamMutation();
  const [removePlayer, removeState] = useRemovePlayerFromTeamMutation();

  const players = playersResponse.data || [];
  const playersMeta = playersResponse.meta;
  const squadPlayers = team?.squadPlayers || [];
  const squadPlayerIds = useMemo(
    () => new Set(squadPlayers.map((player) => String(getPlayerId(player)))),
    [squadPlayers]
  );
  const availablePlayers = players.filter((player) => !squadPlayerIds.has(String(getPlayerId(player))));
  const isSquadFull = squadPlayers.length >= 11;

  async function handleAssignPlayer(playerId) {
    if (!playerId || isSquadFull) return;

    setActiveAssignId(playerId);

    try {
      await assignPlayer({ teamId: id, playerId }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Unable to assign player');
    } finally {
      setActiveAssignId(null);
    }
  }

  async function handleRemovePlayer(playerId) {
    try {
      await removePlayer({ teamId: id, playerId }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Unable to remove player');
    }
  }

  function handlePlayerSearchChange(event) {
    setPlayerSearch(event.target.value);
    setPlayerPage(1);
  }

  function handlePlayerRoleChange(event) {
    setPlayerRole(event.target.value);
    setPlayerPage(1);
  }

  function handlePlayerLimitChange(nextLimit) {
    setPlayerLimit(nextLimit);
    setPlayerPage(1);
  }

  if (isTeamLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading team...</div>;
  }

  if (!team) {
    return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Team not found.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link to="/teams" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to teams
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                {team.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{team.shortName}</p>
              <h2 className="text-2xl font-semibold text-slate-950">{team.name}</h2>
            </div>
          </div>

          <span className="rounded bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            {squadPlayers.length} / 11 players
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Assign player</h3>
            <p className="mt-1 text-sm text-slate-500">Search global players and add them to this squad.</p>
          </div>
          {isSquadFull && (
            <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              Squad full
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search players</span>
            <input
              type="search"
              value={playerSearch}
              onChange={handlePlayerSearchChange}
              placeholder="Find by player name"
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
            <select
              value={playerRole}
              onChange={handlePlayerRoleChange}
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">All roles</option>
              {PLAYER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid min-w-[640px] grid-cols-[1.4fr_1fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Available player</span>
            <span>Role</span>
            <span className="text-right">Action</span>
          </div>

          <div className="min-w-[640px] divide-y divide-slate-100">
            {availablePlayers.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                {isPlayersFetching ? 'Loading players...' : 'No available players found.'}
              </div>
            ) : (
              availablePlayers.map((player) => {
                const playerId = getPlayerId(player);
                const isAssigning = assignState.isLoading && activeAssignId === playerId;

                return (
                  <div key={playerId} className="grid grid-cols-[1.4fr_1fr_0.8fr] items-center px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="h-9 w-9 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                          {player.name?.charAt(0)}
                        </span>
                      )}
                      <div>
                        <div className="font-semibold text-slate-950">{player.name}</div>
                        <div className="text-xs text-slate-500">{player.country}</div>
                      </div>
                    </div>
                    <span className="text-slate-600">{formatRole(player.role)}</span>
                    <span className="text-right">
                      <button
                        type="button"
                        onClick={() => handleAssignPlayer(playerId)}
                        disabled={isSquadFull || assignState.isLoading}
                        className="h-9 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAssigning ? 'Assigning' : 'Assign'}
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <PaginationBar
            meta={playersMeta}
            limit={playerLimit}
            onLimitChange={handlePlayerLimitChange}
            onPageChange={setPlayerPage}
          />
        </div>

        {assignState.error && (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {assignState.error.data?.message || 'Unable to assign player'}
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[720px] grid-cols-[1.4fr_1fr_1fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Player</span>
          <span>Role</span>
          <span>Country</span>
          <span className="text-right">Action</span>
        </div>

        <div className="min-w-[720px] divide-y divide-slate-100">
          {squadPlayers.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No players assigned yet.</div>
          ) : (
            squadPlayers.map((player) => (
              <div key={getPlayerId(player)} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center px-4 py-4 text-sm">
                <span className="font-semibold text-slate-950">{player.name}</span>
                <span className="text-slate-600">{formatRole(player.role)}</span>
                <span className="text-slate-600">{player.country}</span>
                <span className="text-right">
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(getPlayerId(player))}
                    disabled={removeState.isLoading}
                    className="h-9 rounded-md border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default TeamDetailsPage;
