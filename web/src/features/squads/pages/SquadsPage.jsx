import { useMemo, useState } from 'react';

import { useGetPlayersQuery } from '../../players/api/playersApi.js';
import { PLAYER_ROLE_OPTIONS, formatPlayerOptionValue } from '../../players/constants/playerOptions.js';
import { useGetTeamByIdQuery, useGetTeamsQuery } from '../../teams/api/teamsApi.js';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import {
  useAddPlayerToSquadMutation,
  useRemovePlayerFromSquadMutation,
} from '../api/squadsApi.js';

function getPlayerId(player) {
  return player?._id || player?.id || player;
}

function getTeamId(team) {
  return team?._id || team?.id || team;
}

function formatRole(role = '') {
  return formatPlayerOptionValue(role);
}

function SquadsPage() {
  const [teamPage, setTeamPage] = useState(1);
  const [teamLimit, setTeamLimit] = useState(10);
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [playerPage, setPlayerPage] = useState(1);
  const [playerLimit, setPlayerLimit] = useState(10);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [activePlayerId, setActivePlayerId] = useState(null);

  const { data: teamsResponse = { data: [], meta: null }, isLoading: isTeamsLoading } = useGetTeamsQuery({
    page: teamPage,
    limit: teamLimit,
    search: teamSearch,
  });
  const { data: selectedTeam, isFetching: isTeamFetching } = useGetTeamByIdQuery(selectedTeamId, {
    skip: !selectedTeamId,
  });
  const { data: playersResponse = { data: [], meta: null }, isFetching: isPlayersFetching } = useGetPlayersQuery(
    {
      page: playerPage,
      limit: playerLimit,
      search: playerSearch,
      role: playerRole,
      availableForTeam: selectedTeamId,
    },
    { skip: !selectedTeamId }
  );
  const [addPlayerToSquad, addState] = useAddPlayerToSquadMutation();
  const [removePlayerFromSquad, removeState] = useRemovePlayerFromSquadMutation();

  const teams = teamsResponse.data || [];
  const teamsMeta = teamsResponse.meta;
  const squadPlayers = selectedTeam?.squadPlayers || [];
  const squadPlayerIds = useMemo(
    () => new Set(squadPlayers.map((player) => String(getPlayerId(player)))),
    [squadPlayers]
  );
  const availablePlayers = (playersResponse.data || []).filter(
    (player) => !squadPlayerIds.has(String(getPlayerId(player)))
  );
  const isSquadFull = squadPlayers.length >= 20;
  const isMatchReady = squadPlayers.length >= 11;

  function handleTeamSearchChange(event) {
    setTeamSearch(event.target.value);
    setTeamPage(1);
  }

  function handleTeamLimitChange(nextLimit) {
    setTeamLimit(nextLimit);
    setTeamPage(1);
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

  function handleSelectTeam(teamId) {
    setSelectedTeamId(teamId);
    setPlayerPage(1);
    setPlayerSearch('');
    setPlayerRole('');
  }

  async function handleAddPlayer(playerId) {
    if (!selectedTeamId || !playerId || isSquadFull) return;

    setActivePlayerId(playerId);

    try {
      await addPlayerToSquad({ teamId: selectedTeamId, playerId }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Unable to add player to squad');
    } finally {
      setActivePlayerId(null);
    }
  }

  async function handleRemovePlayer(playerId) {
    if (!selectedTeamId || !playerId) return;

    setActivePlayerId(playerId);

    try {
      await removePlayerFromSquad({ teamId: selectedTeamId, playerId }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Unable to remove player from squad');
    } finally {
      setActivePlayerId(null);
    }
  }

  return (
    <ModulePage
      eyebrow="Selection"
      title="Squads"
      description="Choose a team and assign up to 20 eligible players to its squad."
      permission="squads:manage"
      primaryAction={null}
    >
      <div className="grid min-h-[640px] lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-white p-4">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teams</span>
              <input
                type="search"
                value={teamSearch}
                onChange={handleTeamSearchChange}
                placeholder="Find team"
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="divide-y divide-slate-200">
            {isTeamsLoading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No teams found.</div>
            ) : (
              teams.map((team) => {
                const teamId = getTeamId(team);
                const isSelected = String(teamId) === String(selectedTeamId);

                return (
                  <button
                    type="button"
                    key={teamId}
                    onClick={() => handleSelectTeam(teamId)}
                    className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                      isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {team.name?.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-950">{team.name}</span>
                      <span className="text-xs font-medium text-slate-500">{team.shortName}</span>
                    </span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {team.squadPlayers?.length || 0}/20
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <PaginationBar
            meta={teamsMeta}
            limit={teamLimit}
            onLimitChange={handleTeamLimitChange}
            onPageChange={setTeamPage}
          />
        </aside>

        <section className="bg-white">
          {!selectedTeamId ? (
            <div className="flex min-h-[420px] items-center justify-center p-8 text-center text-slate-500">
              Select a team to manage its squad.
            </div>
          ) : (
            <div className="space-y-6 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-4">
                  {selectedTeam?.logo ? (
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                      {selectedTeam?.name?.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {selectedTeam?.shortName || 'Team'}
                    </p>
                    <h3 className="text-xl font-bold text-slate-950">{selectedTeam?.name || 'Loading team'}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                    {squadPlayers.length}/20 players
                  </span>
                  <span
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ring-1 ${
                      isMatchReady
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                        : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}
                  >
                    {isMatchReady ? 'Match ready' : 'Need 11+'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available players</span>
                      <input
                        type="search"
                        value={playerSearch}
                        onChange={handlePlayerSearchChange}
                        placeholder="Search unassigned players"
                        disabled={isSquadFull}
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </label>

                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
                      <select
                        value={playerRole}
                        onChange={handlePlayerRoleChange}
                        disabled={isSquadFull}
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                </div>

                <div className="overflow-x-auto">
                  <div className="grid min-w-[660px] grid-cols-[1.4fr_1fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Player</span>
                    <span>Role</span>
                    <span className="text-right">Action</span>
                  </div>

                  <div className="min-w-[660px] divide-y divide-slate-100">
                    {isSquadFull ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">Squad already has 20 players.</div>
                    ) : availablePlayers.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        {isPlayersFetching || isTeamFetching ? 'Loading players...' : 'No eligible players found.'}
                      </div>
                    ) : (
                      availablePlayers.map((player) => {
                        const playerId = getPlayerId(player);
                        const isAdding = addState.isLoading && String(activePlayerId) === String(playerId);

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
                                onClick={() => handleAddPlayer(playerId)}
                                disabled={isSquadFull || addState.isLoading}
                                className="h-9 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isAdding ? 'Adding' : 'Add'}
                              </button>
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <PaginationBar
                  meta={playersResponse.meta}
                  limit={playerLimit}
                  onLimitChange={handlePlayerLimitChange}
                  onPageChange={setPlayerPage}
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <div className="grid min-w-[760px] grid-cols-[1.4fr_1fr_1fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Squad player</span>
                  <span>Role</span>
                  <span>Country</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="min-w-[760px] divide-y divide-slate-100">
                  {squadPlayers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">No players assigned to this squad yet.</div>
                  ) : (
                    squadPlayers.map((player) => {
                      const playerId = getPlayerId(player);
                      const isRemoving = removeState.isLoading && String(activePlayerId) === String(playerId);

                      return (
                        <div key={playerId} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center px-4 py-4 text-sm">
                          <span className="font-semibold text-slate-950">{player.name}</span>
                          <span className="text-slate-600">{formatRole(player.role)}</span>
                          <span className="text-slate-600">{player.country}</span>
                          <span className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(playerId)}
                              disabled={removeState.isLoading}
                              className="h-9 rounded-md border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isRemoving ? 'Removing' : 'Remove'}
                            </button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </ModulePage>
  );
}

export default SquadsPage;
