const MatchStatus = Object.freeze({
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
  TOSS_COMPLETED: 'TOSS_COMPLETED',
  PLAYING_XI_SELECTED: 'PLAYING_XI_SELECTED',
  LIVE: 'LIVE',
  INNINGS_BREAK: 'INNINGS_BREAK',
  COMPLETED: 'COMPLETED',
});

const MATCH_STATUS_LIST = Object.freeze(Object.values(MatchStatus));
const MATCH_STATUS_FLOW = Object.freeze([
  MatchStatus.DRAFT,
  MatchStatus.UPCOMING,
  MatchStatus.TOSS_COMPLETED,
  MatchStatus.PLAYING_XI_SELECTED,
  MatchStatus.LIVE,
  MatchStatus.INNINGS_BREAK,
  MatchStatus.COMPLETED,
]);
const PLAYING_XI_READY_STATUS = MatchStatus.TOSS_COMPLETED;

export {
  MATCH_STATUS_FLOW,
  MatchStatus,
  MATCH_STATUS_LIST,
  PLAYING_XI_READY_STATUS,
};
