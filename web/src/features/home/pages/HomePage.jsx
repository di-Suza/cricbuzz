import { useGetHomeStatusQuery } from '../api/homeApi.js';

const liveMatches = [
  {
    id: 'ind-aus',
    teams: 'India vs Australia',
    score: 'IND 184/3',
    status: 'Live',
    detail: '17.2 ov',
  },
  {
    id: 'eng-sa',
    teams: 'England vs South Africa',
    score: 'SA 92/1',
    status: 'Upcoming',
    detail: 'Starts 7:30 PM',
  },
  {
    id: 'nz-pak',
    teams: 'New Zealand vs Pakistan',
    score: 'NZ won by 18 runs',
    status: 'Result',
    detail: 'T20',
  },
];

function HomePage() {
  useGetHomeStatusQuery();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Live cricket</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Scores, fixtures, and match updates</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {liveMatches.map((match) => (
            <article key={match.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{match.teams}</p>
                <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                  {match.status}
                </span>
              </div>
              <p className="mt-5 text-2xl font-semibold text-white">{match.score}</p>
              <p className="mt-2 text-sm text-slate-400">{match.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
