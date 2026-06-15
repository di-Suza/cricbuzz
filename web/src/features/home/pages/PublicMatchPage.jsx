import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { getSocket } from '../../../shared/socket/socketClient.js';
import { useGetPublicMatchCenterQuery, useGetPublicMatchCommentaryQuery } from '../api/homeApi.js';

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getPlayerId(player) {
  return String(player?._id || player?.id || player || '');
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

function isResultStatus(status) {
  return ['RESULT', 'COMPLETED', 'ABANDONED'].includes(status);
}

function TeamBadge({ team, align = 'center' }) {
  return (
    <div className={`flex flex-col items-${align} gap-3`}>
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#31393d] bg-[#2a2c30]">
        {team?.logo ? (
          <img src={team.logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl font-black text-[#b8c9ff]">{getInitials(getTeamName(team))}</span>
        )}
      </div>
      <div className={`text-${align}`}>
        <p className="text-lg font-black tracking-tight text-white">{getFullTeamName(team)}</p>
      </div>
    </div>
  );
}

function MatchHero({ match, liveScore }) {
  const live = isLiveStatus(match.status);

  return (
    <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-10">
        
        {/* Team 1 */}
        <TeamBadge team={match.team1} align="center" />

        {/* Score */}
        <div className="flex flex-col items-center text-center">
           <span className="rounded-full bg-[#293142] border border-[#6d7890] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#b8c9ff] mb-4">
             {live ? 'LIVE • 1st Innings' : match.status.replaceAll('_', ' ')}
           </span>
           <h1 className="text-[2.75rem] font-black leading-none tracking-tight text-white drop-shadow-md">
             {live ? `${getTeamName(liveScore?.battingTeam)} ${liveScore?.runs || 0}/${liveScore?.wickets || 0}` : 'VS'}
           </h1>
           <p className="mt-3 text-[11px] font-bold tracking-[0.15em] text-[#a0a5ad] uppercase">
             {liveScore?.overs || '0.0'} OVERS (RR {liveScore?.runRate || '0.00'})
           </p>
        </div>

        {/* Team 2 */}
        <TeamBadge team={match.team2} align="center" />

      </div>

      {/* Footer */}
      <div className="mt-10 flex border-t border-[#26282b] pt-6 justify-center gap-12 sm:gap-24 text-center">
         <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-[#87909e]">VENUE</p>
           <p className="mt-1 text-sm font-semibold text-[#d3d7de]">{match.venue || 'Narendra Modi Stadium, Ahmedabad'}</p>
         </div>
         <div className="h-10 w-px bg-[#26282b]" />
         <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-[#87909e]">TARGET</p>
           <p className="mt-1 text-sm font-semibold text-[#d3d7de]">Proj. 215</p>
         </div>
      </div>
    </section>
  );
}

function MatchPulse({ recentEvents = [], liveScore }) {
  return (
    <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
      <h2 className="text-[1.3rem] font-black text-white">Match Pulse</h2>
      <div className="mt-6 border-b border-[#26282b] pb-6">
        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.15em] text-[#d3d7de]">
          <span>INDIA <span className="text-[#a0a5ad] ml-1">78%</span></span>
          <span>AUSTRALIA <span className="text-[#a0a5ad] ml-1">22%</span></span>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full">
          <div className="h-full w-[78%] bg-[#8ba4fc]" />
          <div className="h-full flex-1 bg-[#886966]" />
        </div>
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#87909e]">Recent Over</p>
        <div className="mt-4 flex gap-2 overflow-x-auto items-center">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-[#9ba3ad]">No balls yet.</p>
          ) : (
            recentEvents.slice(0, 6).map((event) => (
              <span key={event._id} className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-[13px] font-black shadow-sm ${
                event?.isWicket
                  ? 'bg-[#e5b2b2] text-[#4b1b1b]'
                  : Number(event?.totalRuns) >= 4
                    ? 'bg-[#bcd0ff] text-[#1a2c4e]'
                    : 'bg-[#31393d] text-[#e0e3e8]'
              }`}>
                {event?.isWicket ? 'W' : event?.totalRuns}
              </span>
            ))
          )}
          {/* Mock run total */}
          {recentEvents.length > 0 && (
            <div className="ml-auto flex flex-col items-center justify-center leading-tight">
               <span className="text-[10px] font-black text-[#a0a5ad]">14</span>
               <span className="text-[10px] font-bold text-[#a0a5ad]">Runs</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LiveBatting({ stats = [], liveScore }) {
  const currentInnings = Number(liveScore?.innings || stats.at(-1)?.innings || 1);
  const rows = stats.find((entry) => Number(entry.innings) === currentInnings)?.batting || [];
  const strikerId = getPlayerId(liveScore?.currentStriker);
  const nonStrikerId = getPlayerId(liveScore?.currentNonStriker);
  const activeIds = new Set([strikerId, nonStrikerId].filter(Boolean));
  const activeRows = [
    ...rows.filter((row) => activeIds.has(getPlayerId(row.player))),
    ...rows.filter((row) => !activeIds.has(getPlayerId(row.player)) && row.balls > 0 && !row.isOut),
  ].slice(0, 4);

  return (
    <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
      <h2 className="text-[1.3rem] font-black text-white">Live Batting</h2>
      
      <div className="mt-6">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#a0a5ad] mb-4 px-4">
          <span>Batter</span>
          <span className="w-6 text-center">R</span>
          <span className="w-6 text-center">B</span>
          <span className="w-6 text-center">4s</span>
          <span className="w-6 text-center">6s</span>
          <span className="w-10 text-right">SR</span>
        </div>

        <div className="space-y-4">
          {activeRows.length === 0 ? (
            <p className="text-sm text-[#87909e] px-4">Batting card will appear once scoring starts.</p>
          ) : (
            activeRows.map((row) => {
              const isStriker = getPlayerId(row.player) === strikerId;

              return (
              <div key={row.player?._id || row.player?.name} className={`relative grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 py-1.5 px-4`}>
                {/* Active marker for striker */}
                {isStriker && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#8ba4fc] rounded-r-sm" />}
                
                <span className="font-black text-[#e0e3e8] truncate">{row.player?.name}{isStriker ? '*' : ''}</span>
                <span className={`w-6 text-center font-black ${isStriker ? 'text-[#a9c3ff]' : 'text-white'}`}>{row.runs}</span>
                <span className="w-6 text-center font-bold text-[#d3d7de]">{row.balls}</span>
                <span className="w-6 text-center font-bold text-[#d3d7de]">{row.fours}</span>
                <span className="w-6 text-center font-bold text-[#d3d7de]">{row.sixes}</span>
                <span className="w-10 text-right font-black text-[#d3d7de]">{((row.runs / (row.balls || 1)) * 100).toFixed(1)}</span>
              </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function CommentaryPanel({ commentary = [] }) {
  return (
    <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-[1.3rem] font-black text-white">Commentary</h2>
        <div className="flex gap-2">
           <span className="rounded bg-[#2a2c30] px-2 py-0.5 text-[9px] font-black tracking-widest text-[#a0a5ad]">WICKET</span>
           <span className="rounded bg-[#2a2c30] px-2 py-0.5 text-[9px] font-black tracking-widest text-[#a0a5ad]">SIX</span>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {commentary.length === 0 ? (
          <p className="text-sm text-[#87909e]">No commentary yet.</p>
        ) : (
          commentary.slice(0, 6).map((entry, i) => (
            <article key={entry._id} className={`relative rounded-xl border border-[#2a2c30] bg-[#1e2023] p-4 ${i===0 ? 'border-l-[3px] border-l-[#8ba4fc]' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-widest text-[#d3d7de]">{entry.over}.{entry.ball}</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-black tracking-widest ${entry.type === 'SIX' ? 'bg-[#bcd0ff] text-[#1a2c4e]' : entry.type === 'WICKET' ? 'bg-[#e5b2b2] text-[#4b1b1b]' : 'bg-[#2a2c30] text-[#a0a5ad]'}`}>
                  {entry.type}
                </span>
              </div>
              <p className="mt-3 text-xs leading-[1.6] text-[#d3d7de]">{entry.text}</p>
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
        <div className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 text-sm text-[#87909e]">
          Scorecard will appear after the first ball.
        </div>
      ) : (
        scores.map((score) => (
          <div key={score._id} className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a5ad]">
              {getFullTeamName(score.battingTeam)} - Innings {score.innings}
            </p>
            <p className="mt-4 text-4xl font-black text-white">
              {score.runs}/{score.wickets}
              <span className="ml-2 text-sm font-bold text-[#a0a5ad]">({score.overs} ov)</span>
            </p>
          </div>
        ))
      )}
    </section>
  );
}

import VirtualArena3D from '../components/VirtualArena3D.jsx';

function VirtualArena({ latestEvent }) {
  return (
    <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-[#8ba4fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/></svg>
          <div>
             <h2 className="text-[1.3rem] font-black text-white leading-none">Virtual Arena</h2>
             <p className="text-[11px] font-bold text-[#a0a5ad] mt-1.5">Real-time Ball Tracking & Field Placement</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2a2c30] transition hover:bg-[#3c3e42]">
             <svg className="h-4 w-4 text-[#d3d7de]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2a2c30] transition hover:bg-[#3c3e42]">
             <svg className="h-4 w-4 text-[#d3d7de]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button className="rounded-lg bg-[#bcd0ff] px-4 py-2 text-[10px] font-black tracking-widest text-[#1a2c4e] transition hover:bg-white">
            WAGON WHEEL
          </button>
        </div>
      </div>
      <div className="relative flex-1 bg-[#0c1517]">
        <VirtualArena3D latestEvent={latestEvent} />
      </div>
    </section>
  );
}

import UpcomingMatchView from '../components/UpcomingMatchView.jsx';
import ResultMatchView from '../components/ResultMatchView.jsx';

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
  const upcoming = isUpcomingStatus(match?.status);
  const result = isResultStatus(match?.status);

  useEffect(() => {
    if (!matchId) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('match:join', matchId);

    const refreshAll = () => {
      refetchCenter();
      refetchCommentary();
    };

    const refreshCurrentMatch = (payload = {}) => {
      if (!payload.matchId || String(payload.matchId) === String(matchId)) {
        refreshAll();
      }
    };

    socket.on('score.updated', refreshAll);
    socket.on('commentary.created', refreshAll);
    socket.on('commentary.deleted', refreshAll);
    socket.on('match.status.updated', refreshAll);
    socket.on('match.started', refreshAll);
    socket.on('match.completed', refreshAll);
    socket.on('toss.updated', refreshAll);
    socket.on('playingXI.updated', refreshAll);
    socket.on('public.feed.updated', refreshCurrentMatch);

    return () => {
      socket.emit('match:leave', matchId);
      socket.off('score.updated', refreshAll);
      socket.off('commentary.created', refreshAll);
      socket.off('commentary.deleted', refreshAll);
      socket.off('match.status.updated', refreshAll);
      socket.off('match.started', refreshAll);
      socket.off('match.completed', refreshAll);
      socket.off('toss.updated', refreshAll);
      socket.off('playingXI.updated', refreshAll);
      socket.off('public.feed.updated', refreshCurrentMatch);
    };
  }, [matchId, refetchCenter, refetchCommentary]);

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

        {result ? (
          <ResultMatchView match={match} scores={data?.scores || []} fallOfWickets={data?.fallOfWickets || []} />
        ) : upcoming ? (
          <UpcomingMatchView match={match} />
        ) : (
          <>
            <MatchHero match={match} liveScore={data.liveScore} />

            <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
              <main className="space-y-6">
                <Scorecards scores={data.scores || []} />
                <VirtualArena latestEvent={data.recentEvents?.[0]} />
              </main>

              <aside className="space-y-6">
                <MatchPulse recentEvents={data.recentEvents || []} liveScore={data.liveScore} />
                <LiveBatting stats={data.stats || []} liveScore={data.liveScore} />
                <CommentaryPanel commentary={commentaryResponse.data || []} />
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicMatchPage;


