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

export {
  MatchStatus,
  MATCH_STATUS_LIST,
};
