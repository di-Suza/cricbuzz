const matchFields = Object.freeze({
  required: ['seriesId', 'team1', 'team2', 'venue', 'startTime'],
  optional: ['status', 'tossWinner', 'tossDecision', 'playingXI', 'winner', 'result'],
});

export default matchFields;
