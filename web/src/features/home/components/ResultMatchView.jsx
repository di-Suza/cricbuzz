import React from 'react';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function FallOfWicketCard({ over, player, runs, balls, score, wickets, dismissal, isLast }) {
  return (
    <div className="relative pl-8">
      {/* Timeline Line */}
      {!isLast && <div className="absolute left-[15px] top-[30px] bottom-[-30px] w-px bg-[#3c3e42]" />}
      
      {/* Timeline Node */}
      <div className={`absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#3c3e42] bg-[#2a2c30]`}>
        <span className="text-[10px] font-black text-[#a0a5ad]">X</span>
      </div>

      {/* Card Content */}
      <div className="rounded-xl border border-[#26282b] bg-[#1e2023] p-5 shadow-sm transition hover:border-[#3c3e42]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#a0a5ad]">OVER {over}</p>
            <p className="mt-2 text-lg font-black text-white">
              {player} <span className="text-sm font-bold text-[#87909e] ml-1">{runs}({balls})</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-[#6d7480]">DISMISSAL</p>
            <p className="mt-1 text-xs font-bold text-[#d3d7de] max-w-[140px] truncate">{dismissal}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end border-t border-[#2a2c30] pt-3">
          <p className="text-[10px] font-black text-[#a0a5ad]">Score: {score}/{wickets}</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultMatchView({ match, scores, fallOfWickets }) {
  const team1Name = match?.team1?.name || 'New Zealand';
  const team2Name = match?.team2?.name || 'Pakistan';
  const fow = fallOfWickets || [];
  const resultText = match?.result || `${team1Name} won by 18 runs`;

  const t1Score = scores?.[0] || { runs: 224, wickets: 7, overs: 20.0, runRate: '11.20', innings: 1 };
  const t2Score = scores?.[1] || { runs: 206, wickets: 10, overs: 19.4, runRate: '10.60', innings: 2 };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Match Hero Concluded */}
          <section className="relative overflow-hidden rounded-3xl border border-[#2a2d33] bg-[#212328] p-8 shadow-sm">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(42,44,48,0.6),transparent_100%)]" />
             
             <div className="relative">
                <span className="inline-flex rounded-full border border-[#3c3e42] bg-[#2a2c30] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#d3d7de]">
                  MATCH CONCLUDED
                </span>

                <div className="mt-8 flex items-center justify-between">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#31393d] bg-[#1a1c1e]">
                      {match?.team1?.logo ? (
                         <img src={match.team1.logo} alt={team1Name} className="h-full w-full object-cover" />
                      ) : (
                         <span className="text-xl font-black text-[#a0a5ad]">{getInitials(team1Name)}</span>
                      )}
                    </div>
                    <p className="mt-4 text-center text-sm font-black text-white">{team1Name}</p>
                  </div>

                  {/* Result Text */}
                  <div className="flex-1 px-4 text-center">
                    <h1 className="text-4xl font-black leading-tight text-white drop-shadow-sm sm:text-5xl">
                      {resultText.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {word} {i === 0 ? <br /> : ''}
                        </React.Fragment>
                      ))}
                    </h1>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#31393d] bg-[#1a1c1e]">
                      {match?.team2?.logo ? (
                         <img src={match.team2.logo} alt={team2Name} className="h-full w-full object-cover" />
                      ) : (
                         <span className="text-xl font-black text-[#a0a5ad]">{getInitials(team2Name)}</span>
                      )}
                    </div>
                    <p className="mt-4 text-center text-sm font-black text-white">{team2Name}</p>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <p className="text-[11px] font-bold tracking-widest text-[#87909e]">
                    {match?.venue || 'University Oval, Dunedin'}
                  </p>
                </div>
             </div>
          </section>

          {/* Fall of Wickets */}
          <section className="mt-8">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-black text-white">
              <svg className="h-5 w-5 text-[#87909e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Fall of Wickets - {team2Name} Innings
            </h2>
            <div className="space-y-6">
              {fow.length === 0 ? (
                <p className="text-sm text-[#87909e]">No wickets fell in this innings.</p>
              ) : (
                fow.map((wicket, idx) => (
                  <FallOfWicketCard key={idx} {...wicket} />
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* First Innings Scorecard */}
          <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#87909e]" />
                <h3 className="text-lg font-black text-white">{team1Name}</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#a0a5ad]">1ST INNINGS</span>
            </div>
            <div className="mt-5">
              <p className="text-[2.5rem] font-black leading-none text-white">
                {t1Score.runs}/{t1Score.wickets} <span className="text-lg font-bold text-[#87909e]">({t1Score.overs} OV)</span>
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="rounded-xl bg-[#24272c] border border-[#2a2d33] p-4">
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#87909e]">RR</p>
                 <p className="mt-1 text-lg font-black text-[#d3d7de]">{t1Score.runRate}</p>
               </div>
               <div className="rounded-xl bg-[#24272c] border border-[#2a2d33] p-4">
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#87909e]">BOUNDARIES</p>
                 <p className="mt-1 text-xs font-black text-[#d3d7de] leading-tight">18 x 4s,<br/>12 x 6s</p>
               </div>
            </div>
          </section>

          {/* Second Innings Scorecard */}
          <section className="rounded-2xl border border-[#26282b] bg-[#1a1c1e] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#87909e]" />
                <h3 className="text-lg font-black text-white">{team2Name}</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#a0a5ad]">2ND INNINGS</span>
            </div>
            <div className="mt-5">
              <p className="text-[2.5rem] font-black leading-none text-white">
                {t2Score.runs}/{t2Score.wickets} <span className="text-lg font-bold text-[#87909e]">({t2Score.overs} OV)</span>
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="rounded-xl bg-[#24272c] border border-[#2a2d33] p-4">
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#87909e]">REQUIRED RR</p>
                 <p className="mt-1 text-lg font-black text-[#d3d7de]">Ended</p>
               </div>
               <div className="rounded-xl bg-[#24272c] border border-[#2a2d33] p-4">
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#87909e]">TARGET</p>
                 <p className="mt-1 text-lg font-black text-[#d3d7de]">225 Runs</p>
               </div>
            </div>
            
            {/* Win Probability Graph (Mock) */}
            <div className="mt-8">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#87909e] mb-4">WIN PROBABILITY OVER TIME</p>
              <div className="flex items-end gap-1.5 h-16">
                 {[40, 50, 45, 60, 30, 20, 10, 40, 70, 40, 15].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#4a4e58] rounded-sm transition-all hover:bg-[#87909e]" style={{ height: `${h}%` }} />
                 ))}
              </div>
            </div>
          </section>

          {/* Bottom Pills */}
          <div className="flex flex-col items-start gap-3">
             <div className="flex items-center gap-2 rounded-full border border-[#2a2d33] bg-[#24272c] px-4 py-2 shadow-sm">
               <span className="text-xs font-black text-[#e6d08e]">★</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#d3d7de]">POM: DARYL MITCHELL</span>
             </div>
             <div className="flex items-center gap-2 rounded-full border border-[#2a2d33] bg-[#24272c] px-4 py-2 shadow-sm">
               <svg className="h-3.5 w-3.5 text-[#87909e]" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#d3d7de]">ATTENDANCE: 12,400</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
