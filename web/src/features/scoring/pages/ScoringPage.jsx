import { useEffect, useMemo, useState } from 'react';

import ModulePage from '../../../shared/components/ModulePage.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import { getSocket } from '../../../shared/socket/socketClient.js';
import { useGetMatchesQuery } from '../../matches/api/matchesApi.js';
import { useAddScoreBallMutation, useGetScoreboardQuery } from '../api/scoringApi.js';

const RUN_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const EXTRA_TYPES = ['NONE', 'WIDE', 'NO_BALL', 'BYE', 'LEG_BYE'];
const WICKET_TYPES = ['BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'RETIRED_HURT', 'OTHER'];
const EMPTY_ARRAY = Object.freeze([]);
const MATCH_SCORING_RULES = {
  T20: { maxInnings: 2, maxBallsPerInnings: 120, maxOvers: 20 },
  ODI: { maxInnings: 2, maxBallsPerInnings: 300, maxOvers: 50 },
  TEST: { maxInnings: 4, maxBallsPerInnings: null, maxOvers: null },
};

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getTeamId(team) {
  return String(team?._id || team?.id || team || '');
}

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getPlayerName(player) {
  return player?.name || 'Player';
}

function getPlayerId(player) {
  return String(player?._id || player?.id || player?.player?._id || player?.player || player || '');
}

function formatEvent(event) {
  const parts = [`${event.over}.${event.ball}`, `${event.totalRuns} run${event.totalRuns === 1 ? '' : 's'}`];
  if (event.extraType && event.extraType !== 'NONE') parts.push(event.extraType);
  if (event.isWicket) parts.push('WICKET');
  return parts.join(' - ');
}

function getScoringRules(match) {
  return MATCH_SCORING_RULES[match?.matchType] || MATCH_SCORING_RULES.T20;
}

function isInningsComplete(score, rules) {
  if (!score) return false;
  if (score.wickets >= 10) return true;
  if (rules.maxBallsPerInnings && score.balls >= rules.maxBallsPerInnings) return true;
  if (score.target && score.runs >= score.target) return true;
  return false;
}

function getScoreByInnings(scores = [], innings) {
  return scores.find((score) => Number(score.innings) === Number(innings)) || null;
}

function getAvailableInnings(scores = [], rules) {
  return Array.from({ length: rules.maxInnings }, (_, index) => index + 1).filter((innings) => {
    if (innings === 1) return true;
    return isInningsComplete(getScoreByInnings(scores, innings - 1), rules);
  });
}

function getOppositeTeam(teams = [], teamId) {
  return teams.find((team) => getTeamId(team) !== String(teamId)) || null;
}

function getTossBattingTeam(match, teams = []) {
  if (!match?.tossWinner || !match?.tossDecision) return null;

  const tossWinnerId = getTeamId(match.tossWinner);
  if (match.tossDecision === 'BAT') {
    return teams.find((team) => getTeamId(team) === tossWinnerId) || match.tossWinner;
  }

  return getOppositeTeam(teams, tossWinnerId);
}

function getPlayingXiForTeam(match, teamId) {
  if (!match || !teamId) return [];
  if (String(teamId) === getTeamId(match.team1)) return match.playingXI?.team1 || [];
  if (String(teamId) === getTeamId(match.team2)) return match.playingXI?.team2 || [];
  return [];
}

function getLineupPlayers(match, teamId) {
  return getPlayingXiForTeam(match, teamId).map((entry) => entry.player).filter(Boolean);
}

function hasPlayer(players = [], playerId) {
  return players.some((player) => getPlayerId(player) === String(playerId));
}

function findPlayer(players = [], playerId) {
  return players.find((player) => getPlayerId(player) === String(playerId)) || null;
}

function getPlayerStat(stats = [], playerId) {
  return stats.find((row) => getPlayerId(row.player) === String(playerId)) || null;
}

function createEmptyBattingStat(player, isOut = false) {
  return {
    player,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut,
  };
}

function createEmptyBowlingStat(player) {
  return {
    player,
    overs: '0.0',
    runsConceded: 0,
    wickets: 0,
  };
}

function ScoreCard({ score, team }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Innings {score?.innings || '-'}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-950">{getTeamName(score?.battingTeam || team)}</h3>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-4xl font-black text-slate-950">{score?.runs ?? 0}/{score?.wickets ?? 0}</span>
        <span className="pb-1 text-sm font-semibold text-slate-500">({score?.overs || '0.0'} ov)</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Run Rate</p>
          <p className="mt-1 font-bold text-slate-950">{score?.runRate ?? 0}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Target</p>
          <p className="mt-1 font-bold text-slate-950">{score?.target || '-'}</p>
        </div>
      </div>
    </div>
  );
}

function PlayerStatsTable({ title, rows = [], type = 'batting' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h4 className="text-sm font-bold text-slate-950">{title}</h4>
      </div>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white text-slate-500">
            <tr>
              <th className="px-4 py-2 font-semibold">Player</th>
              {type === 'batting' ? (
                <>
                  <th className="px-3 py-2 font-semibold">R</th>
                  <th className="px-3 py-2 font-semibold">B</th>
                  <th className="px-3 py-2 font-semibold">4s</th>
                  <th className="px-3 py-2 font-semibold">6s</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 font-semibold">O</th>
                  <th className="px-3 py-2 font-semibold">R</th>
                  <th className="px-3 py-2 font-semibold">W</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-slate-500">No stats yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.player?._id || row.player?.id || row.player?.name}>
                  <td className="px-4 py-2 font-semibold text-slate-800">
                    {getPlayerName(row.player)}{row.isOut ? '' : type === 'batting' && row.balls > 0 ? '*' : ''}
                  </td>
                  {type === 'batting' ? (
                    <>
                      <td className="px-3 py-2">{row.runs}</td>
                      <td className="px-3 py-2">{row.balls}</td>
                      <td className="px-3 py-2">{row.fours}</td>
                      <td className="px-3 py-2">{row.sixes}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{row.overs}</td>
                      <td className="px-3 py-2">{row.runsConceded}</td>
                      <td className="px-3 py-2">{row.wickets}</td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatterCard({ label, player, stat }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{getPlayerName(player)}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {stat ? `${stat.runs} (${stat.balls}) - 4s ${stat.fours} - 6s ${stat.sixes}` : 'Yet to face'}
          </p>
        </div>
        {stat?.isOut ? (
          <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">OUT</span>
        ) : null}
      </div>
    </div>
  );
}

function ScoringPage() {
  const toast = useToast();
  const [activeMatchId, setActiveMatchId] = useState('');
  const [localDismissedByInnings, setLocalDismissedByInnings] = useState({});
  const [form, setForm] = useState({
    innings: 1,
    battingTeam: '',
    striker: '',
    nonStriker: '',
    bowler: '',
    runs: 0,
    extras: 0,
    extraType: 'NONE',
    isWicket: false,
    dismissedPlayer: '',
    newBatter: '',
    wicketType: 'OTHER',
    note: '',
  });

  const { data: matchesResponse = { data: [] }, isLoading: isMatchesLoading, refetch: refetchMatches } = useGetMatchesQuery({
    page: 1,
    limit: 100,
    status: 'LIVE',
  });
  const liveMatches = matchesResponse.data || [];
  const {
    data: scoreboard,
    isLoading: isScoreLoading,
    isFetching: isScoreFetching,
    refetch: refetchScoreboard,
  } = useGetScoreboardQuery(activeMatchId, { skip: !activeMatchId });
  const [addScoreBall, addState] = useAddScoreBallMutation();

  const activeMatch = scoreboard?.match || liveMatches.find((match) => String(match._id) === String(activeMatchId)) || null;
  const teams = useMemo(() => [activeMatch?.team1, activeMatch?.team2].filter(Boolean), [activeMatch]);
  const scoresByInnings = scoreboard?.scores || [];
  const recentEvents = scoreboard?.recentEvents || [];
  const scoringRules = useMemo(() => getScoringRules(activeMatch), [activeMatch]);
  const availableInnings = useMemo(() => getAvailableInnings(scoresByInnings, scoringRules), [scoresByInnings, scoringRules]);
  const selectedInnings = Number(form.innings);
  const selectedScore = getScoreByInnings(scoresByInnings, selectedInnings);
  const previousScore = selectedInnings > 1 ? getScoreByInnings(scoresByInnings, selectedInnings - 1) : null;
  const isSelectedInningsAvailable = availableInnings.includes(selectedInnings);
  const isSelectedInningsComplete = isInningsComplete(selectedScore, scoringRules);
  const expectedBattingTeam = useMemo(
    () => (
      selectedInnings === 1
        ? getTossBattingTeam(activeMatch, teams)
        : selectedInnings === 2 && ['T20', 'ODI'].includes(activeMatch?.matchType)
          ? getOppositeTeam(teams, getTeamId(getScoreByInnings(scoresByInnings, 1)?.battingTeam))
          : null
    ),
    [activeMatch, scoresByInnings, selectedInnings, teams]
  );
  const lockedBattingTeam = selectedScore?.battingTeam || expectedBattingTeam;
  const isBattingTeamLocked = Boolean(lockedBattingTeam);
  const bowlingTeam = useMemo(() => getOppositeTeam(teams, form.battingTeam), [form.battingTeam, teams]);
  const battingPlayers = useMemo(() => getLineupPlayers(activeMatch, form.battingTeam), [activeMatch, form.battingTeam]);
  const bowlingPlayers = useMemo(() => getLineupPlayers(activeMatch, getTeamId(bowlingTeam)), [activeMatch, bowlingTeam]);
  const inningsStats = useMemo(
    () => (scoreboard?.stats || []).find((entry) => Number(entry.innings) === selectedInnings) || null,
    [scoreboard?.stats, selectedInnings]
  );
  const inningsPlayerMeta = useMemo(
    () => (scoreboard?.inningsPlayerMeta || []).find((entry) => Number(entry.innings) === selectedInnings) || null,
    [scoreboard?.inningsPlayerMeta, selectedInnings]
  );
  const battingStats = inningsStats?.batting || EMPTY_ARRAY;
  const bowlingStats = inningsStats?.bowling || EMPTY_ARRAY;
  const metaDismissedIds = inningsPlayerMeta?.dismissedPlayerIds || EMPTY_ARRAY;
  const recentDismissedIds = useMemo(
    () => recentEvents
      .filter((event) => Number(event.innings) === selectedInnings && event.dismissedPlayer)
      .map((event) => getPlayerId(event.dismissedPlayer)),
    [recentEvents, selectedInnings]
  );
  const localDismissedIds = localDismissedByInnings[selectedInnings] || EMPTY_ARRAY;
  const dismissedBatterIds = useMemo(
    () => new Set([
      ...battingStats.filter((row) => row.isOut).map((row) => getPlayerId(row.player)),
      ...metaDismissedIds.map((playerId) => String(playerId)),
      ...recentDismissedIds,
      ...localDismissedIds,
    ]),
    [battingStats, localDismissedIds, metaDismissedIds, recentDismissedIds]
  );
  const availableBatters = useMemo(
    () => battingPlayers.filter((player) => !dismissedBatterIds.has(getPlayerId(player))),
    [battingPlayers, dismissedBatterIds]
  );
  const newBatterSource = inningsPlayerMeta ? (inningsPlayerMeta.availableNewBatters || EMPTY_ARRAY) : battingPlayers;
  const newBatterOptions = useMemo(
    () => newBatterSource.filter((player) => {
      const playerId = getPlayerId(player);
      return playerId
        && !dismissedBatterIds.has(playerId)
        && ![form.striker, form.nonStriker].includes(playerId);
    }),
    [dismissedBatterIds, form.nonStriker, form.striker, newBatterSource]
  );
  const battingRows = useMemo(
    () => (battingStats.length > 0
      ? battingStats
      : battingPlayers.map((player) => createEmptyBattingStat(player, dismissedBatterIds.has(getPlayerId(player))))),
    [battingPlayers, battingStats, dismissedBatterIds]
  );
  const bowlingRows = useMemo(
    () => (bowlingStats.length > 0 ? bowlingStats : bowlingPlayers.map((player) => createEmptyBowlingStat(player))),
    [bowlingPlayers, bowlingStats]
  );
  const strikerPlayer = findPlayer(battingPlayers, form.striker);
  const nonStrikerPlayer = findPlayer(battingPlayers, form.nonStriker);
  const strikerStat = getPlayerStat(battingRows, form.striker);
  const nonStrikerStat = getPlayerStat(battingRows, form.nonStriker);
  const isBattingPairLocked = Boolean(selectedScore?.currentStriker && selectedScore?.currentNonStriker);
  const needsNewBatter = Boolean(form.isWicket && (selectedScore?.wickets || 0) < 9);
  const canAddBall = Boolean(
    activeMatchId
    && form.battingTeam
    && form.striker
    && form.nonStriker
    && form.bowler
    && form.striker !== form.nonStriker
    && hasPlayer(availableBatters, form.striker)
    && hasPlayer(availableBatters, form.nonStriker)
    && (!needsNewBatter || (
      form.newBatter
      && hasPlayer(newBatterOptions, form.newBatter)
      && ![form.striker, form.nonStriker].includes(String(form.newBatter))
    ))
    && isSelectedInningsAvailable
    && !isSelectedInningsComplete
  );

  useEffect(() => {
    if (!activeMatchId && liveMatches.length > 0) {
      setActiveMatchId(liveMatches[0]._id);
    }
  }, [activeMatchId, liveMatches]);

  useEffect(() => {
    setLocalDismissedByInnings({});
  }, [activeMatchId]);

  useEffect(() => {
    if (!availableInnings.includes(Number(form.innings))) {
      setForm((current) => ({ ...current, innings: availableInnings[availableInnings.length - 1] || 1 }));
      return;
    }

    if (lockedBattingTeam && String(form.battingTeam) !== getTeamId(lockedBattingTeam)) {
      setForm((current) => ({ ...current, battingTeam: getTeamId(lockedBattingTeam) }));
      return;
    }

    const teamIds = teams.map((team) => getTeamId(team));
    if (teams.length > 0 && !teamIds.includes(String(form.battingTeam))) {
      setForm((current) => ({ ...current, battingTeam: getTeamId(teams[0]) }));
    }
  }, [availableInnings, form.battingTeam, form.innings, lockedBattingTeam, teams]);

  useEffect(() => {
    const currentStriker = getTeamId(selectedScore?.currentStriker);
    const currentNonStriker = getTeamId(selectedScore?.currentNonStriker);
    const currentBowler = getTeamId(selectedScore?.currentBowler);
    const next = {};

    if (!hasPlayer(availableBatters, form.striker)) {
      next.striker = hasPlayer(availableBatters, currentStriker) ? currentStriker : availableBatters[0]?._id || '';
    }

    const effectiveStriker = next.striker || form.striker;
    if (!hasPlayer(availableBatters, form.nonStriker) || form.nonStriker === effectiveStriker) {
      const fallbackNonStriker = hasPlayer(availableBatters, currentNonStriker) && currentNonStriker !== effectiveStriker
        ? currentNonStriker
        : availableBatters.find((player) => String(player._id) !== String(effectiveStriker))?._id || '';
      next.nonStriker = fallbackNonStriker;
    }

    if (!hasPlayer(bowlingPlayers, form.bowler)) {
      next.bowler = hasPlayer(bowlingPlayers, currentBowler) ? currentBowler : bowlingPlayers[0]?._id || '';
    }

    const effectiveNonStriker = next.nonStriker || form.nonStriker;
    if (form.dismissedPlayer && ![effectiveStriker, effectiveNonStriker].includes(form.dismissedPlayer)) {
      next.dismissedPlayer = '';
    }

    if (form.newBatter && (!hasPlayer(availableBatters, form.newBatter) || [effectiveStriker, effectiveNonStriker].includes(form.newBatter))) {
      next.newBatter = '';
    }

    if (form.newBatter && !hasPlayer(newBatterOptions, form.newBatter)) {
      next.newBatter = '';
    }

    if (Object.keys(next).length > 0) {
      setForm((current) => ({ ...current, ...next }));
    }
  }, [
    availableBatters,
    bowlingPlayers,
    form.bowler,
    form.dismissedPlayer,
    form.newBatter,
    form.nonStriker,
    form.striker,
    newBatterOptions,
    selectedScore?.currentBowler,
    selectedScore?.currentNonStriker,
    selectedScore?.currentStriker,
  ]);

  useEffect(() => {
    if (!activeMatchId) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('match:join', activeMatchId);

    const refresh = () => {
      refetchScoreboard();
      refetchMatches();
    };

    socket.on('score.updated', refresh);
    socket.on('match.status.updated', refresh);

    return () => {
      socket.emit('match:leave', activeMatchId);
      socket.off('score.updated', refresh);
      socket.off('match.status.updated', refresh);
    };
  }, [activeMatchId, refetchMatches, refetchScoreboard]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function swapBatters() {
    setForm((current) => ({
      ...current,
      striker: current.nonStriker,
      nonStriker: current.striker,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!activeMatchId || !form.battingTeam) return;

    const body = {
      innings: Number(form.innings),
      battingTeam: form.battingTeam,
      striker: form.striker,
      nonStriker: form.nonStriker,
      bowler: form.bowler,
      runs: Number(form.runs),
      extras: Number(form.extras || 0),
      extraType: form.extraType,
      isWicket: Boolean(form.isWicket),
      note: form.note,
      ...(form.isWicket ? {
        wicketType: form.wicketType,
        dismissedPlayer: form.dismissedPlayer || form.striker,
        newBatter: form.newBatter,
      } : {}),
    };

    try {
      const result = await addScoreBall({ matchId: activeMatchId, body }).unwrap();
      const nextScore = result?.score;
      const dismissedId = getPlayerId(result?.event?.dismissedPlayer || body.dismissedPlayer);

      if (dismissedId) {
        setLocalDismissedByInnings((current) => {
          const inningsKey = Number(body.innings);
          const existing = current[inningsKey] || [];
          return {
            ...current,
            [inningsKey]: Array.from(new Set([...existing, dismissedId])),
          };
        });
      }

      setForm((current) => ({
        ...current,
        striker: getTeamId(nextScore?.currentStriker) || current.striker,
        nonStriker: getTeamId(nextScore?.currentNonStriker) || current.nonStriker,
        bowler: getTeamId(nextScore?.currentBowler) || current.bowler,
        runs: 0,
        extras: 0,
        extraType: 'NONE',
        isWicket: false,
        dismissedPlayer: '',
        newBatter: '',
        wicketType: 'OTHER',
        note: '',
      }));
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update score');
    }
  }

  return (
    <ModulePage
      eyebrow="Live"
      title="Scoring"
      description="Run ball by ball score updates for active matches through protected scorer tools."
      permission="score:manage"
      primaryAction={null}
    >
      <div className="grid min-h-[680px] lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Matches</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{liveMatches.length} active</p>
          </div>

          <div className="divide-y divide-slate-200">
            {isMatchesLoading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading matches...</div>
            ) : liveMatches.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No live matches right now.</div>
            ) : (
              liveMatches.map((match) => {
                const isSelected = String(match._id) === String(activeMatchId);

                return (
                  <button
                    type="button"
                    key={match._id}
                    onClick={() => setActiveMatchId(match._id)}
                    className={`w-full px-4 py-4 text-left transition ${isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <span className="block font-semibold text-slate-950">
                      {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{match.series?.name || 'Series'} - {formatDateTime(match.scheduledAt)}</span>
                    <span className="mt-2 inline-flex rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-100">
                      LIVE
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="bg-white">
          {!activeMatchId ? (
            <div className="flex min-h-[420px] items-center justify-center p-8 text-center text-slate-500">
              Move a match to LIVE to start scoring.
            </div>
          ) : (
            <div className="space-y-5 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{activeMatch?.series?.name || 'Series'}</p>
                  <h3 className="text-xl font-bold text-slate-950">
                    {getTeamName(activeMatch?.team1)} vs {getTeamName(activeMatch?.team2)}
                  </h3>
                </div>
                <span className="rounded-md bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
                  {isScoreFetching && !isScoreLoading ? 'SYNCING' : 'LIVE'}
                </span>
              </div>

              <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Format</p>
                  <p className="mt-1 font-semibold">{activeMatch?.matchType || 'T20'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Innings Limit</p>
                  <p className="mt-1 font-semibold">{scoringRules.maxInnings} innings</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Overs Limit</p>
                  <p className="mt-1 font-semibold">{scoringRules.maxOvers ? `${scoringRules.maxOvers} overs per innings` : 'No fixed over limit'}</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_320px]">
                <ScoreCard score={scoresByInnings[0]} team={teams[0]} />
                <ScoreCard score={scoresByInnings[1]} team={teams[1]} />

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-950">Recent Balls</p>
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                    {recentEvents.length === 0 ? (
                      <p className="text-sm text-slate-500">No balls yet.</p>
                    ) : (
                      recentEvents.slice(0, 8).map((event) => (
                        <div key={event._id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                          <p className="font-semibold text-slate-950">{formatEvent(event)}</p>
                          {event.note ? <p className="mt-1 text-xs text-slate-500">{event.note}</p> : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <PlayerStatsTable title={`Innings ${selectedInnings} Batting`} rows={battingRows} type="batting" />
                <PlayerStatsTable title={`Innings ${selectedInnings} Bowling`} rows={bowlingRows} type="bowling" />
              </div>

              <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="grid gap-4 lg:grid-cols-[120px_1fr_1fr]">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Innings</span>
                    <select
                      value={form.innings}
                      onChange={(event) => setField('innings', Number(event.target.value))}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {Array.from({ length: scoringRules.maxInnings }, (_, index) => index + 1).map((innings) => (
                        <option key={innings} value={innings} disabled={!availableInnings.includes(innings)}>
                          Innings {innings}{availableInnings.includes(innings) ? '' : ' unavailable'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Batting Team</span>
                    <select
                      value={form.battingTeam}
                      onChange={(event) => setField('battingTeam', event.target.value)}
                      disabled={isBattingTeamLocked}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {teams.map((team) => (
                        <option key={getTeamId(team)} value={getTeamId(team)}>
                          {team.name || team.shortName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bowler</span>
                    <select
                      value={form.bowler}
                      onChange={(event) => setField('bowler', event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {bowlingPlayers.map((player) => (
                        <option key={player._id} value={player._id}>{getPlayerName(player)}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {isBattingPairLocked ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <BatterCard label="Striker" player={strikerPlayer} stat={strikerStat} />
                    <BatterCard label="Non-Striker" player={nonStrikerPlayer} stat={nonStrikerStat} />
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opening Striker</span>
                      <select
                        value={form.striker}
                        onChange={(event) => setField('striker', event.target.value)}
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      >
                        {availableBatters
                          .filter((player) => getPlayerId(player) !== String(form.nonStriker))
                          .map((player) => (
                            <option key={getPlayerId(player)} value={getPlayerId(player)}>
                              {getPlayerName(player)}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opening Non-Striker</span>
                      <select
                        value={form.nonStriker}
                        onChange={(event) => setField('nonStriker', event.target.value)}
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      >
                        {availableBatters
                          .filter((player) => getPlayerId(player) !== String(form.striker))
                          .map((player) => (
                            <option key={getPlayerId(player)} value={getPlayerId(player)}>
                              {getPlayerName(player)}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-600">
                    Strike auto-updates after odd runs and over changes.
                  </p>
                  <button
                    type="button"
                    onClick={swapBatters}
                    disabled={!form.striker || !form.nonStriker}
                    className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Swap Batters
                  </button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[120px_160px_1fr]">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extras</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={form.extras}
                      onChange={(event) => setField('extras', event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extra Type</span>
                    <select
                      value={form.extraType}
                      onChange={(event) => setField('extraType', event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {EXTRA_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bowling Team</p>
                    <p className="mt-1 font-bold text-slate-900">{getTeamName(bowlingTeam)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  {!isSelectedInningsAvailable ? (
                    <p className="font-semibold text-amber-700">
                      Innings {selectedInnings} is unavailable until the previous innings is complete, all out, or the chase is finished.
                    </p>
                  ) : isSelectedInningsComplete ? (
                    <p className="font-semibold text-emerald-700">Innings {selectedInnings} is complete.</p>
                  ) : (
                    <p className="font-semibold text-slate-700">
                      Innings {selectedInnings} is active
                      {previousScore ? ` - target ${previousScore.runs + 1}` : ''}
                      {scoringRules.maxOvers ? ` - ${scoringRules.maxOvers} overs max` : ''}.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Runs</span>
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {RUN_OPTIONS.map((run) => (
                      <button
                        type="button"
                        key={run}
                        onClick={() => setField('runs', run)}
                        disabled={!canAddBall}
                        className={`h-12 rounded-lg border text-lg font-black transition ${
                          Number(form.runs) === run
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
                        }`}
                      >
                        {run}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[140px_180px_1fr_1fr]">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={form.isWicket}
                      onChange={(event) => setField('isWicket', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-semibold text-slate-800">Wicket</span>
                  </label>

                  <select
                    value={form.wicketType}
                    onChange={(event) => setField('wicketType', event.target.value)}
                    disabled={!form.isWicket}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {WICKET_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={form.dismissedPlayer || form.striker}
                    onChange={(event) => setField('dismissedPlayer', event.target.value)}
                    disabled={!form.isWicket}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {[form.striker, form.nonStriker].filter(Boolean).map((playerId) => {
                      const player = battingPlayers.find((item) => getPlayerId(item) === String(playerId));
                      return (
                        <option key={playerId} value={playerId}>{getPlayerName(player)}</option>
                      );
                    })}
                  </select>

                  <select
                    value={form.newBatter}
                    onChange={(event) => setField('newBatter', event.target.value)}
                    disabled={!form.isWicket || (selectedScore?.wickets || 0) >= 9}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">New batter</option>
                    {newBatterOptions.map((player) => (
                      <option key={getPlayerId(player)} value={getPlayerId(player)}>{getPlayerName(player)}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <input
                    value={form.note}
                    onChange={(event) => setField('note', event.target.value)}
                    placeholder="Ball note"
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-600">
                    {canAddBall ? 'Ready for next ball' : 'Scoring disabled until innings rules are satisfied'}
                  </p>
                  <button
                    type="submit"
                    disabled={addState.isLoading || !canAddBall}
                    className="h-11 rounded-lg bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addState.isLoading ? 'Updating...' : 'Add Ball'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </ModulePage>
  );
}

export default ScoringPage;
