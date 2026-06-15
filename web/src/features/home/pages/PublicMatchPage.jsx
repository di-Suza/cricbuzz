import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { getSocket } from '../../../shared/socket/socketClient.js';
import { useGetPublicMatchCenterQuery, useGetPublicMatchCommentaryQuery } from '../api/homeApi.js';

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getFullTeamName(team) {
  return team?.name || team?.shortName || 'Team';
}

function getInitials(value = 'TM') {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value) {
  if (!value) return 'Schedule pending';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
}

function isLiveStatus(status) {
  return ['LIVE', 'INNINGS_BREAK'].includes(status);
}

function isUpcomingStatus(status) {
  return ['UPCOMING', 'TOSS_COMPLETED', 'PLAYING_XI_SELECTED'].includes(status);
}

function TeamBadge({ team, align = 'center' }) {
  return (
    <div className={`flex flex-col items-${align} gap-3`}>
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#526072] bg-[#1b2222] shadow-[0_0_24px_rgba(157,187,255,0.12)]">
        {team?.logo ? (
          <img src={team.logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl font-black text-[#b8c9ff]">{getInitials(getTeamName(team))}</span>
        )}
      </div>
      <div className={`text-${align}`}>
        <p className="text-xl font-black tracking-tight text-white">{getFullTeamName(team)}</p>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ba3ad]">{getTeamName(team)}</p>
      </div>
    </div>
  );
}

function ScoreLine({ score }) {
  if (!score) return <span className="text-[#a7afbd]">Yet to bat</span>;
  return (
    <span>
      {score.runs}/{score.wickets}
      <span className="ml-2 text-base font-bold text-[#c4c9d4]">({score.overs} ov)</span>
    </span>
  );
}

function EventPill({ event }) {
  const label = event?.isWicket ? 'W' : event?.totalRuns;
  return (
    <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-black ${
      event?.isWicket
        ? 'border-[#ffaaa5]/40 bg-[#3a2324] text-[#ffaaa5]'
        : Number(event?.totalRuns) >= 4
          ? 'border-[#a9c3ff]/50 bg-[#1d2a46] text-[#b8cbff]'
          : 'border-[#3c4448] bg-[#202525] text-[#d7dce4]'
    }`}>
      {label}
    </span>
  );
}

function MatchHero({ match, liveScore }) {
  const live = isLiveStatus(match.status);

  return (
    <section className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5 shadow-[inset_-80px_0_120px_rgba(255,255,255,0.03)] sm:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <TeamBadge team={match.team1} align="center" />

        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#6d7890] bg-[#293142] px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#b8c9ff]">
            {live ? 'Live Match' : match.status.replaceAll('_', ' ')}
          </span>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-white drop-shadow sm:text-6xl">
            {live ? <ScoreLine score={liveScore} /> : 'VS'}
          </h1>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.25em] text-[#c7cad1]">
            {match.series?.name || 'Series'}
          </p>
        </div>

        <TeamBadge team={match.team2} align="center" />
      </div>

      <div className="mt-8 grid gap-4 border-t border-[#2d3336] pt-6 text-center sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d949c]">Venue</p>
          <p className="mt-1 text-sm font-semibold text-[#e8ebf0]">{match.venue || 'Venue pending'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d949c]">Schedule</p>
          <p className="mt-1 text-sm font-semibold text-[#e8ebf0]">{formatDateTime(match.scheduledAt)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d949c]">Result</p>
          <p className="mt-1 text-sm font-semibold text-[#e8ebf0]">{match.result || 'Not declared'}</p>
        </div>
      </div>
    </section>
  );
}

function MatchPulse({ recentEvents = [], liveScore }) {
  return (
    <section className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5">
      <h2 className="text-2xl font-black text-white">Match Pulse</h2>
      <div className="mt-5">
        <div className="flex justify-between text-xs font-black uppercase tracking-[0.18em] text-[#cbd5e1]">
          <span>Current Score</span>
          <span>{liveScore ? `${liveScore.runs}/${liveScore.wickets}` : '-'}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#30363a]">
          <div className="h-full w-2/3 rounded-full bg-[#a9c3ff]" />
        </div>
      </div>
      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d949c]">Recent Balls</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-[#9ba3ad]">No balls yet.</p>
          ) : (
            recentEvents.slice(0, 8).map((event) => <EventPill key={event._id} event={event} />)
          )}
        </div>
      </div>
    </section>
  );
}

function LiveBatting({ stats = [] }) {
  const rows = stats.find((entry) => entry.batting?.some((row) => row.balls > 0))?.batting || stats.at(-1)?.batting || [];
  const activeRows = rows.filter((row) => row.balls > 0 || !row.isOut).slice(0, 4);

  return (
    <section className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5">
      <h2 className="text-2xl font-black text-white">Live Batting</h2>
      <div className="mt-5 space-y-3">
        {activeRows.length === 0 ? (
          <p className="text-sm text-[#9ba3ad]">Batting card will appear once scoring starts.</p>
        ) : (
          activeRows.map((row) => (
            <div key={row.player?._id || row.player?.name} className="rounded-xl bg-[#24292c] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-white">{row.player?.name}{row.isOut ? '' : '*'}</p>
                <p className="font-black text-[#dce6ff]">{row.runs}</p>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#aeb5c0]">
                {row.balls} balls - 4s {row.fours} - 6s {row.sixes}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function CommentaryPanel({ commentary = [] }) {
  return (
    <section className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5">
      <h2 className="text-2xl font-black text-white">Live Commentary</h2>
      <div className="mt-5 space-y-4">
        {commentary.length === 0 ? (
          <p className="text-sm text-[#9ba3ad]">No commentary yet.</p>
        ) : (
          commentary.slice(0, 6).map((entry) => (
            <article key={entry._id} className="border-l-2 border-[#a9c3ff] bg-[#24292c] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#303a4f] px-3 py-1 text-xs font-black text-[#bcd0ff]">{entry.over}.{entry.ball}</span>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#aeb5c0]">{entry.type}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#eef1f5]">{entry.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Scorecards({ scores = [] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {scores.length === 0 ? (
        <div className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5 text-sm text-[#9ba3ad]">
          Scorecard will appear after the first ball.
        </div>
      ) : (
        scores.map((score) => (
          <div key={score._id} className="rounded-2xl border border-[#343b40] bg-[#1a1e1f] p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#a9c3ff]">
              {getFullTeamName(score.battingTeam)} - Innings {score.innings}
            </p>
            <p className="mt-5 text-5xl font-black text-white">
              {score.runs}/{score.wickets}
              <span className="ml-2 text-lg text-[#d1d6df]">({score.overs} ov)</span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#24292c] p-3">
                <p className="text-xs font-bold uppercase text-[#9ba3ad]">Run Rate</p>
                <p className="mt-1 font-black text-[#dce6ff]">{score.runRate}</p>
              </div>
              <div className="rounded-xl bg-[#24292c] p-3">
                <p className="text-xs font-bold uppercase text-[#9ba3ad]">Target</p>
                <p className="mt-1 font-black text-[#dce6ff]">{score.target || '-'}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function PublicMatchPage() {
  const { matchId } = useParams();
  const {
    data,
    isLoading,
    refetch: refetchCenter,
  } = useGetPublicMatchCenterQuery(matchId, { skip: !matchId });
  const {
    data: commentaryResponse = { data: [] },
    refetch: refetchCommentary,
  } = useGetPublicMatchCommentaryQuery({ matchId, limit: 30 }, { skip: !matchId });

  const match = data?.matchInfo;
  const live = isLiveStatus(match?.status);
  const upcoming = isUpcomingStatus(match?.status);

  useEffect(() => {
    if (!matchId || !live) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('match:join', matchId);

    const refreshAll = () => {
      refetchCenter();
      refetchCommentary();
    };

    socket.on('score.updated', refreshAll);
    socket.on('commentary.created', refreshAll);
    socket.on('commentary.deleted', refreshAll);
    socket.on('match.status.updated', refreshAll);
    socket.on('match.completed', refreshAll);

    return () => {
      socket.emit('match:leave', matchId);
      socket.off('score.updated', refreshAll);
      socket.off('commentary.created', refreshAll);
      socket.off('commentary.deleted', refreshAll);
      socket.off('match.status.updated', refreshAll);
      socket.off('match.completed', refreshAll);
    };
  }, [live, matchId, refetchCenter, refetchCommentary]);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-[#aeb5c0]">Loading match...</div>;
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link to="/" className="text-sm font-bold text-[#a9c3ff]">Back to matches</Link>
        <p className="mt-6 text-2xl font-black text-white">Match not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1211] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/" className="inline-flex text-sm font-black uppercase tracking-[0.18em] text-[#a9c3ff]">Back to arena</Link>

        <MatchHero match={match} liveScore={data.liveScore} />

        {upcoming ? (
          <div className="rounded-2xl border border-[#755f10] bg-[#1d1705] p-5 text-[#ffd95e]">
            Playing XI is not yet selected. Stay tuned for toss updates on match day.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <main className="space-y-6">
            <Scorecards scores={data.scores || []} />

            <section className="overflow-hidden rounded-2xl border border-[#343b40] bg-[#1a1e1f]">
              <div className="relative min-h-[320px] bg-[radial-gradient(circle_at_50%_10%,rgba(80,159,178,0.32),transparent_30%),linear-gradient(180deg,#0c1517,#14201f)] p-6">
                <div className="absolute inset-x-8 bottom-8 h-32 rounded-[50%] bg-[#2f7333] shadow-[0_0_80px_rgba(94,195,130,0.24)]" />
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a9c3ff]">Virtual Arena</p>
                  <h2 className="mt-2 text-2xl font-black">Real-time Ball Tracking</h2>
                </div>
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <MatchPulse recentEvents={data.recentEvents || []} liveScore={data.liveScore} />
            <LiveBatting stats={data.stats || []} />
            <CommentaryPanel commentary={commentaryResponse.data || []} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PublicMatchPage;


