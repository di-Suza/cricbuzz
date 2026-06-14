import { useEffect, useState } from 'react';

import ConfirmModal from '../../../shared/components/ConfirmModal.jsx';
import ModulePage from '../../../shared/components/ModulePage.jsx';
import PaginationBar from '../../../shared/components/PaginationBar.jsx';
import { useToast } from '../../../shared/components/ToastProvider.jsx';
import { getSocket } from '../../../shared/socket/socketClient.js';
import { useGetMatchesQuery } from '../../matches/api/matchesApi.js';
import { useGetScoreboardQuery } from '../../scoring/api/scoringApi.js';
import { useCreateCommentaryMutation, useDeleteCommentaryMutation, useGetCommentaryQuery } from '../api/commentaryApi.js';

const COMMENTARY_TYPES = ['NORMAL', 'FOUR', 'SIX', 'WICKET', 'MILESTONE'];

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getTeamName(team) {
  return team?.shortName || team?.name || 'Team';
}

function formatBall(event) {
  if (!event) return 'Latest ball';
  const parts = [`${event.over}.${event.ball}`, `${event.totalRuns} run${event.totalRuns === 1 ? '' : 's'}`];
  if (event.extraType && event.extraType !== 'NONE') parts.push(event.extraType);
  if (event.isWicket) parts.push('WICKET');
  return parts.join(' - ');
}

function CommentaryPage() {
  const toast = useToast();
  const [activeMatchId, setActiveMatchId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [form, setForm] = useState({
    scoreEventId: '',
    type: 'NORMAL',
    text: '',
  });
  const [commentaryToDelete, setCommentaryToDelete] = useState(null);

  const { data: matchesResponse = { data: [] }, isLoading: isMatchesLoading, refetch: refetchMatches } = useGetMatchesQuery({
    page: 1,
    limit: 100,
    status: 'LIVE',
  });
  const liveMatches = matchesResponse.data || [];
  const activeMatch = liveMatches.find((match) => String(match._id) === String(activeMatchId)) || null;
  const { data: scoreboard, refetch: refetchScoreboard } = useGetScoreboardQuery(activeMatchId, { skip: !activeMatchId });
  const {
    data: commentaryResponse = { data: [], meta: null },
    isLoading: isCommentaryLoading,
    isFetching: isCommentaryFetching,
    refetch: refetchCommentary,
  } = useGetCommentaryQuery({ matchId: activeMatchId, page, limit }, { skip: !activeMatchId });
  const [createCommentary, createState] = useCreateCommentaryMutation();
  const [deleteCommentary, deleteState] = useDeleteCommentaryMutation();

  const recentEvents = scoreboard?.recentEvents || [];
  const commentary = commentaryResponse.data || [];
  const meta = commentaryResponse.meta;

  useEffect(() => {
    if (!activeMatchId && liveMatches.length > 0) {
      setActiveMatchId(liveMatches[0]._id);
    }
  }, [activeMatchId, liveMatches]);

  useEffect(() => {
    if (form.scoreEventId && !recentEvents.some((event) => event._id === form.scoreEventId)) {
      setForm((current) => ({ ...current, scoreEventId: '' }));
    }
  }, [form.scoreEventId, recentEvents]);

  useEffect(() => {
    if (!activeMatchId) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('match:join', activeMatchId);

    const refreshScore = () => {
      refetchScoreboard();
      refetchMatches();
    };
    const refreshCommentary = () => {
      refetchCommentary();
    };

    socket.on('score.updated', refreshScore);
    socket.on('commentary.created', refreshCommentary);
    socket.on('commentary.deleted', refreshCommentary);
    socket.on('match.status.updated', refreshScore);

    return () => {
      socket.emit('match:leave', activeMatchId);
      socket.off('score.updated', refreshScore);
      socket.off('commentary.created', refreshCommentary);
      socket.off('commentary.deleted', refreshCommentary);
      socket.off('match.status.updated', refreshScore);
    };
  }, [activeMatchId, refetchCommentary, refetchMatches, refetchScoreboard]);

  function handleLimitChange(nextLimit) {
    setLimit(nextLimit);
    setPage(1);
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!activeMatchId || !form.text.trim()) return;

    try {
      await createCommentary({
        matchId: activeMatchId,
        body: {
          scoreEventId: form.scoreEventId,
          type: form.type,
          text: form.text,
        },
      }).unwrap();
      setForm((current) => ({ ...current, text: '' }));
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to add commentary');
    }
  }

  async function handleDeleteCommentary() {
    if (!activeMatchId || !commentaryToDelete?._id) return;

    try {
      await deleteCommentary({ matchId: activeMatchId, id: commentaryToDelete._id }).unwrap();
      setCommentaryToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to delete commentary');
    }
  }

  return (
    <ModulePage
      eyebrow="Live"
      title="Commentary"
      description="Publish and manage ball commentary for live match coverage."
      permission="commentary:manage"
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
                    onClick={() => {
                      setActiveMatchId(match._id);
                      setPage(1);
                      setForm({ scoreEventId: '', type: 'NORMAL', text: '' });
                    }}
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
              Move a match to LIVE to add commentary.
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
                  LIVE
                </span>
              </div>

              <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ball</span>
                    <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2 xl:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setField('scoreEventId', '')}
                        className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                          form.scoreEventId
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        }`}
                      >
                        Latest ball
                      </button>
                      {recentEvents.map((event) => (
                        <button
                          type="button"
                          key={event._id}
                          onClick={() => setField('scoreEventId', event._id)}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                            form.scoreEventId === event._id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          <span className="block font-bold">{event.over}.{event.ball}</span>
                          <span className="mt-1 block text-xs">{formatBall(event)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</span>
                    <select
                      value={form.type}
                      onChange={(event) => setField('type', event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {COMMENTARY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Commentary</span>
                  <textarea
                    value={form.text}
                    onChange={(event) => setField('text', event.target.value)}
                    rows={4}
                    placeholder="Write ball commentary"
                    className="mt-2 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
                  <button
                    type="submit"
                    disabled={createState.isLoading || !form.text.trim()}
                    className="h-11 rounded-lg bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createState.isLoading ? 'Publishing...' : 'Publish Commentary'}
                  </button>
                </div>
              </form>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                  <h3 className="text-base font-bold text-slate-950">Timeline</h3>
                  {isCommentaryFetching && !isCommentaryLoading ? (
                    <span className="text-xs font-semibold text-slate-500">Syncing</span>
                  ) : null}
                </div>

                <div className="divide-y divide-slate-100">
                  {isCommentaryLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading commentary...</div>
                  ) : commentary.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No commentary yet.</div>
                  ) : (
                    commentary.map((entry) => (
                      <article key={entry._id} className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                              {entry.over}.{entry.ball}
                            </span>
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                              {entry.type}
                            </span>
                            <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommentaryToDelete(entry)}
                            disabled={deleteState.isLoading}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{entry.text}</p>
                      </article>
                    ))
                  )}
                </div>

                <PaginationBar
                  meta={meta}
                  limit={limit}
                  onLimitChange={handleLimitChange}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={Boolean(commentaryToDelete)}
        title="Delete Commentary"
        message="This commentary entry will be removed from the match timeline."
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onClose={() => setCommentaryToDelete(null)}
        onConfirm={handleDeleteCommentary}
      />
    </ModulePage>
  );
}

export default CommentaryPage;
