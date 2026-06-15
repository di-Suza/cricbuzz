import { useEffect } from 'react';
import { Link } from 'react-router';
import { getSocket } from '../../../shared/socket/socketClient.js';
import { useGetHomeStatusQuery } from '../api/homeApi.js';

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function getTeamScore(match, teamId) {
  const score = match.scores?.find(s => s.battingTeam?._id === teamId || s.battingTeam === teamId);
  if (score) {
    return `${score.runs}/${score.wickets}`;
  }
  return '-';
}

function MatchCard({ match, tone = 'live' }) {
  const statusLabel = tone === 'result' ? 'RESULT' : match.status.replaceAll('_', ' ');

  return (
    <Link
      to={`/matches/${match._id}`}
      className="group flex flex-col rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#3c3e42] hover:bg-[#1e2023]"
    >
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#a0a5ad] mb-6">
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${tone === 'live' ? 'bg-[#e51d20] text-white' : 'bg-[#2a2c30] text-[#d3d7de]'}`}>
          {tone === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
          {statusLabel}
        </span>
        <span className="truncate ml-2 text-[#d3d7de]">{match.series?.matchType || match.matchType || 'Match'}, {match.venue?.split(',')[0] || 'Venue'}</span>
      </div>

      <div className="space-y-5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 overflow-hidden rounded-full border border-[#3c3e42] bg-[#2a2c30]">
              {match.team1?.logo ? <img src={match.team1.logo} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#3c3e42]" />}
            </div>
            <span className="text-lg font-black text-white">{getTeamName(match.team1)}</span>
          </div>
          {tone === 'upcoming' ? (
             <span className="text-2xl font-black italic text-[#a0a5ad] opacity-40">VS</span>
          ) : (
             <span className="text-2xl font-black text-white">{getTeamScore(match, match.team1?._id)}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 overflow-hidden rounded-full border border-[#3c3e42] bg-[#2a2c30]">
              {match.team2?.logo ? <img src={match.team2.logo} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#3c3e42]" />}
            </div>
            <span className={`text-lg font-black ${tone === 'live' ? 'text-[#87909e]' : 'text-white'}`}>{getTeamName(match.team2)}</span>
          </div>
          {tone === 'upcoming' ? (
             <span className="text-[11px] font-bold text-[#87909e]">Starts {new Date(match.scheduledAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
          ) : (
             <span className={`text-2xl font-black ${tone === 'live' ? 'text-[#87909e]' : 'text-white'}`}>{getTeamScore(match, match.team2?._id)}</span>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[#26282b] pt-4">
        {tone === 'upcoming' && (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a5ad]">
              MATCH DAY: {new Date(match.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[11px] font-black text-white hover:underline">Set Reminder</span>
          </>
        )}
        {tone === 'live' && (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a5ad]">
              {match.tossWinner ? `${getTeamName(match.tossWinner)} OPT TO ${match.tossDecision || 'BAT'}` : 'TOSS PENDING'}
            </span>
            <span className="text-[11px] font-black text-[#d3d7de]">{match.liveScore?.overs || '0.0'} Overs</span>
          </>
        )}
        {tone === 'result' && (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a5ad] truncate max-w-[80%]">{match.result || 'Match Ended'}</span>
            <svg className="h-5 w-5 text-[#87909e] flex-shrink-0 hover:text-white transition cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </>
        )}
      </div>
    </Link>
  );
}

function StoryCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#26282b] bg-[#1a1c1e]">
      <div className="flex h-full flex-col">
        <div className="relative h-64 bg-[#141517]">
          {/* Mock YouTube player background */}
          <img src="/stadium.png" alt="Video thumbnail" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e2023]/80 backdrop-blur border border-[#3c3e42] transition hover:bg-[#26282b] cursor-pointer">
              <svg className="h-5 w-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center bg-[#1a1c1e] p-8">
          <div className="flex items-center gap-3">
             <span className="rounded-full bg-[#2a2c30] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">Strategy</span>
             <span className="text-[10px] font-bold text-[#87909e] uppercase tracking-widest">8 min read</span>
          </div>
          <h2 className="mt-5 text-4xl font-black leading-[1.1] text-white">The changing dynamics of the middle-over strategy</h2>
          <p className="mt-4 text-sm leading-[1.7] text-[#a0a5ad]">
            In modern T20 cricket, the traditional approach of 'saving wickets' for the death overs is quickly becoming obsolete. Teams are reshaping batting tempo with deeper squads, flexible all-rounders, and sharper matchup plans.
          </p>
          <div className="mt-8 flex items-center gap-4 border-t border-[#2a2c30] pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2c30] border border-[#3c3e42]">
               <svg className="h-4 w-4 text-[#87909e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div>
               <p className="text-xs font-bold text-white">Rahul Sharma</p>
               <p className="text-[10px] font-semibold text-[#87909e] mt-0.5">Senior Analyst</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function HomePage() {
  const { data, isLoading, refetch } = useGetHomeStatusQuery();
  const liveMatches = data?.liveMatches || [];
  const upcomingMatches = data?.upcomingMatches || [];
  const recentMatches = data?.recentMatches || [];

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    const refreshHome = () => {
      refetch();
    };

    socket.on('public.feed.updated', refreshHome);

    return () => {
      socket.off('public.feed.updated', refreshHome);
    };
  }, [refetch]);

  return (
    <section className="min-h-screen bg-[#141517] text-white">
      <div className="mx-auto max-w-[1400px] px-8 py-10">
        
        {/* Header Hero */}
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f3f5] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#141517]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#87909e]" />
            Live Cricket
          </span>
          <h1 className="mt-5 text-4xl font-black leading-none tracking-tight text-white sm:text-[2.75rem]">
            Scores, fixtures, and match updates
          </h1>
          <div className="mt-8 flex gap-3">
            <button className="rounded-lg bg-[#e0e3e8] px-6 py-3 text-sm font-black text-[#141517] transition hover:bg-white shadow-[0_0_15px_rgba(224,227,232,0.15)]">Explore Live</button>
            <button className="rounded-lg bg-[#26282b] px-6 py-3 text-sm font-black text-[#d3d7de] transition hover:bg-[#3c3e42] border border-[#3c3e42]/50">Full Schedule</button>
          </div>
        </div>

        {/* Match Cards Grid */}
        <div className="grid gap-5 lg:grid-cols-3 xl:grid-cols-3">
          {isLoading ? (
            <div className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 text-sm text-[#a0a5ad] lg:col-span-3">
              Loading matches...
            </div>
          ) : (
            <>
              {liveMatches.slice(0, 3).map((match) => <MatchCard key={match._id} match={match} tone="live" />)}
              {upcomingMatches.slice(0, 3).map((match) => <MatchCard key={match._id} match={match} tone="upcoming" />)}
              {recentMatches.slice(0, 3).map((match) => <MatchCard key={match._id} match={match} tone="result" />)}
            </>
          )}
        </div>

        {/* Top Stories Header */}
        <div className="mt-16 flex items-end justify-between mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Top stories</h2>
          <a href="#" className="text-sm font-bold text-white hover:underline">View All News</a>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <StoryCard />
          
          <aside className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 flex flex-col">
            <h2 className="text-[1.3rem] font-black text-white tracking-tight">League Standings</h2>
            <div className="mt-8 space-y-4 flex-1">
              {['India', 'Australia', 'South Africa', 'England'].map((team, index) => (
                <div key={team} className="flex items-center justify-between rounded-xl bg-[#1e2023] border border-[#2a2c30] px-5 py-4 transition hover:border-[#3c3e42]">
                  <div className="flex items-center gap-4">
                    <span className="w-4 text-center font-black text-white">{index + 1}</span>
                    <span className="text-sm font-bold text-[#d3d7de]">{team}</span>
                  </div>
                  <span className="text-sm font-black text-white">{120 - index * 8} Pts</span>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full rounded-xl bg-[#26282b] py-3.5 text-xs font-black text-white transition hover:bg-[#3c3e42]">
               Full Points Table
            </button>
          </aside>
        </div>

      </div>
    </section>
  );
}

export default HomePage;
