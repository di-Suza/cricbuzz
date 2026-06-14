import { Link } from 'react-router';

import { useGetHomeStatusQuery } from '../api/homeApi.js';

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function formatMatchTime(value) {
  if (!value) return 'Schedule pending';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function scoreText(match) {
  if (!match.liveScore) return match.result || 'VS';
  return `${match.liveScore.battingTeam?.shortName || getTeamName(match.liveScore.battingTeam)} ${match.liveScore.runs}/${match.liveScore.wickets}`;
}

function TeamToken({ team }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#3d454a] bg-[#202626]">
        {team?.logo ? <img src={team.logo} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-black text-[#b8c9ff]">{getTeamName(team).slice(0, 2)}</span>}
      </span>
      <span className="font-black text-white">{getTeamName(team)}</span>
    </span>
  );
}

function MatchCard({ match, tone = 'live' }) {
  const statusLabel = match.status.replaceAll('_', ' ');

  return (
    <Link
      to={`/matches/${match._id}`}
      className="group block rounded-2xl border border-[#31393d] bg-[#1a1f20] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-[#a9c3ff]/60"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-md px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
          tone === 'live' ? 'bg-[#4b1517] text-[#ffb7b7]' : tone === 'result' ? 'bg-[#273040] text-[#b8c9ff]' : 'bg-[#2d332c] text-[#c2e8b7]'
        }`}>
          {statusLabel}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9ba3ad]">{match.series?.matchType || match.matchType || 'Match'}</span>
      </div>

      <div className="mt-6 space-y-4">
        <TeamToken team={match.team1} />
        <TeamToken team={match.team2} />
      </div>

      <div className="mt-7 border-t border-[#2d3336] pt-5">
        <p className="text-3xl font-black tracking-tight text-white">{scoreText(match)}</p>
        <p className="mt-2 text-sm font-semibold text-[#aeb5c0]">{match.result || formatMatchTime(match.scheduledAt)}</p>
      </div>
    </Link>
  );
}

function StoryCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#31393d] bg-[#1a1f20]">
      <div className="relative h-64 bg-[radial-gradient(circle_at_20%_10%,rgba(169,195,255,0.26),transparent_25%),linear-gradient(180deg,#142020,#0c1111)]">
        <div className="absolute inset-x-10 top-8 h-16 rounded-full bg-[#d8f6ff]/20 blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1a1f20] to-transparent" />
      </div>
      <div className="p-6">
        <span className="rounded-md bg-[#a9c3ff] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0d1211]">Analysis</span>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white">The changing dynamics of the middle-over strategy</h2>
        <p className="mt-4 text-sm leading-6 text-[#aeb5c0]">
          Teams are reshaping batting tempo with deeper squads, flexible all-rounders, and sharper matchup plans.
        </p>
      </div>
    </article>
  );
}

function HomePage() {
  const { data, isLoading } = useGetHomeStatusQuery();
  const liveMatches = data?.liveMatches || [];
  const upcomingMatches = data?.upcomingMatches || [];
  const recentMatches = data?.recentMatches || [];
  const heroMatch = liveMatches[0] || upcomingMatches[0] || recentMatches[0];

  return (
    <section className="min-h-screen bg-[#0d1211] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#2e363a] bg-[#151a1b] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#a9c3ff] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0d1211]">
                <span className="h-2 w-2 rounded-full bg-white" />
                Live Cricket
              </span>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
                Scores, fixtures, and match updates
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#aeb5c0]">
                Follow live rooms, upcoming previews, completed scorecards, and real-time commentary from the public match center.
              </p>
            </div>

            <div className="rounded-2xl border border-[#31393d] bg-[#202526] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9ba3ad]">Featured</p>
              {isLoading ? (
                <p className="mt-5 text-sm text-[#aeb5c0]">Loading feed...</p>
              ) : heroMatch ? (
                <Link to={`/matches/${heroMatch._id}`} className="mt-5 block rounded-xl bg-[#111616] p-4 transition hover:bg-[#161d1d]">
                  <p className="text-lg font-black">{getTeamName(heroMatch.team1)} vs {getTeamName(heroMatch.team2)}</p>
                  <p className="mt-3 text-4xl font-black text-[#dce6ff]">{scoreText(heroMatch)}</p>
                  <p className="mt-2 text-sm text-[#aeb5c0]">{heroMatch.status.replaceAll('_', ' ')}</p>
                </Link>
              ) : (
                <p className="mt-5 text-sm text-[#aeb5c0]">No matches available right now.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {isLoading ? (
            <div className="rounded-2xl border border-[#31393d] bg-[#1a1f20] p-6 text-sm text-[#aeb5c0] lg:col-span-3">
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

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]">
          <StoryCard />
          <aside className="rounded-2xl border border-[#31393d] bg-[#1a1f20] p-6">
            <h2 className="text-2xl font-black text-white">League Standings</h2>
            <div className="mt-6 space-y-3">
              {['India', 'Australia', 'South Africa', 'England'].map((team, index) => (
                <div key={team} className="flex items-center justify-between rounded-xl bg-[#24292c] px-4 py-3">
                  <span className="font-black text-[#dce6ff]">{index + 1}</span>
                  <span className="font-semibold text-white">{team}</span>
                  <span className="font-black text-[#dce6ff]">{120 - index * 8} Pts</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
