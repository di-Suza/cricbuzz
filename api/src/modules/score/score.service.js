import { MatchStatus } from '../../shared/constants/matchStatus.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/index.js';
import { emitToMatch } from '../../sockets/socketGateway.js';
import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import scoreRepository from './score.repository.js';

const MATCH_SCORING_RULES = Object.freeze({
  T20: { maxInnings: 2, maxBallsPerInnings: 120, maxOvers: 20 },
  ODI: { maxInnings: 2, maxBallsPerInnings: 300, maxOvers: 50 },
  TEST: { maxInnings: 4, maxBallsPerInnings: null, maxOvers: null },
});

class ScoreService extends ScaffoldService {
  constructor(repository = scoreRepository) {
    super('score', repository);
  }

  getUserId(user) {
    return user?.id || user?._id || null;
  }

  getTeamId(team) {
    return String(team?._id || team?.id || team);
  }

  getPlayerId(player) {
    return String(player?._id || player?.id || player?.player || player || '');
  }

  formatOvers(balls) {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  calculateRunRate(runs, balls) {
    if (!balls) return 0;
    return Number((runs / (balls / 6)).toFixed(2));
  }

  isLegalBall(extraType) {
    return !['WIDE', 'NO_BALL'].includes(extraType);
  }

  getScoringRules(match) {
    return MATCH_SCORING_RULES[match?.matchType] || MATCH_SCORING_RULES.T20;
  }

  isInningsComplete(score, rules) {
    if (!score) return false;
    if (score.wickets >= 10) return true;
    if (rules.maxBallsPerInnings && score.balls >= rules.maxBallsPerInnings) return true;
    if (score.target && score.runs >= score.target) return true;
    return false;
  }

  getScoreByInnings(scores = [], innings) {
    return scores.find((score) => Number(score.innings) === Number(innings)) || null;
  }

  getLineupForTeam(match, teamId) {
    const requestedTeamId = String(teamId);
    if (requestedTeamId === this.getTeamId(match.team1)) return match.playingXI?.team1 || [];
    if (requestedTeamId === this.getTeamId(match.team2)) return match.playingXI?.team2 || [];
    return [];
  }

  getLineupPlayerIds(match, teamId) {
    return new Set(this.getLineupForTeam(match, teamId).map((entry) => this.getPlayerId(entry.player)));
  }

  getOppositeTeamId(match, teamId) {
    const team1Id = this.getTeamId(match.team1);
    const team2Id = this.getTeamId(match.team2);
    if (String(teamId) === team1Id) return team2Id;
    if (String(teamId) === team2Id) return team1Id;
    return null;
  }

  getExpectedFirstBattingTeam(match) {
    if (!match?.tossWinner || !match?.tossDecision) return null;
    const tossWinner = this.getTeamId(match.tossWinner);
    return match.tossDecision === 'BAT' ? tossWinner : this.getOppositeTeamId(match, tossWinner);
  }

  assertLiveMatch(match) {
    if (!match) throw new NotFoundError('Match not found');
    if (match.status !== MatchStatus.LIVE) {
      throw new ConflictError('Score can only be updated for live matches');
    }
  }

  resolveBowlingTeam(match, battingTeamId) {
    const team1Id = this.getTeamId(match.team1);
    const team2Id = this.getTeamId(match.team2);

    if (String(battingTeamId) === team1Id) return team2Id;
    if (String(battingTeamId) === team2Id) return team1Id;

    throw new BadRequestError('Batting team must be one of the match teams');
  }

  assertExpectedBattingTeam(match, data) {
    if (Number(data.innings) !== 1) return;

    const expectedTeam = this.getExpectedFirstBattingTeam(match);
    if (expectedTeam && expectedTeam !== String(data.battingTeam)) {
      throw new BadRequestError('First innings batting team must follow the toss decision');
    }
  }

  assertPlayerInLineup(playerId, allowedIds, label) {
    if (!playerId || !allowedIds.has(String(playerId))) {
      throw new BadRequestError(`${label} must be selected in the Playing XI`);
    }
  }

  getDismissedPlayerIds(events = [], innings) {
    return new Set(
      events
        .filter((event) => Number(event.innings) === Number(innings) && event.dismissedPlayer)
        .map((event) => this.getPlayerId(event.dismissedPlayer))
    );
  }

  resolveBallPlayers(match, score, data, events = []) {
    const battingIds = this.getLineupPlayerIds(match, data.battingTeam);
    const bowlingTeam = this.resolveBowlingTeam(match, data.battingTeam);
    const bowlingIds = this.getLineupPlayerIds(match, bowlingTeam);
    const striker = data.striker || this.getPlayerId(score?.currentStriker);
    const nonStriker = data.nonStriker || this.getPlayerId(score?.currentNonStriker);
    const bowler = data.bowler || this.getPlayerId(score?.currentBowler);

    if (!striker || !nonStriker || !bowler) {
      throw new BadRequestError('Striker, non-striker, and bowler are required before scoring a ball');
    }

    if (striker === nonStriker) {
      throw new BadRequestError('Striker and non-striker must be different players');
    }

    this.assertPlayerInLineup(striker, battingIds, 'Striker');
    this.assertPlayerInLineup(nonStriker, battingIds, 'Non-striker');
    this.assertPlayerInLineup(bowler, bowlingIds, 'Bowler');

    const dismissedPlayer = data.isWicket ? data.dismissedPlayer || striker : null;
    if (dismissedPlayer && ![striker, nonStriker].includes(String(dismissedPlayer))) {
      throw new BadRequestError('Dismissed player must be the striker or non-striker');
    }

    const dismissedIds = this.getDismissedPlayerIds(events, data.innings);
    if (dismissedIds.has(striker) || dismissedIds.has(nonStriker)) {
      throw new ConflictError('Dismissed players cannot continue batting');
    }

    if (data.newBatter) {
      this.assertPlayerInLineup(data.newBatter, battingIds, 'New batter');
      if ([striker, nonStriker].includes(String(data.newBatter)) || dismissedIds.has(String(data.newBatter))) {
        throw new BadRequestError('New batter must be an available batting player');
      }
    }

    return {
      striker,
      nonStriker,
      bowler,
      bowlingTeam,
      dismissedPlayer,
      newBatter: data.newBatter || null,
    };
  }

  shouldSwapForRuns(runs, extras, extraType) {
    const runningRuns = Number(runs || 0) + (['BYE', 'LEG_BYE'].includes(extraType) ? Number(extras || 0) : 0);
    return runningRuns % 2 === 1;
  }

  resolveNextStrike(participants, data, isLegalBall, nextBalls, nextWickets) {
    let striker = participants.striker;
    let nonStriker = participants.nonStriker;

    if (data.isWicket && participants.dismissedPlayer && nextWickets < 10) {
      if (!participants.newBatter) {
        throw new BadRequestError('New batter is required unless the innings is all out');
      }

      if (participants.dismissedPlayer === striker) {
        striker = participants.newBatter;
      } else if (participants.dismissedPlayer === nonStriker) {
        nonStriker = participants.newBatter;
      }
    }

    if (this.shouldSwapForRuns(data.runs, data.extras, data.extraType || 'NONE')) {
      [striker, nonStriker] = [nonStriker, striker];
    }

    if (isLegalBall && nextBalls % 6 === 0) {
      [striker, nonStriker] = [nonStriker, striker];
    }

    return { striker, nonStriker };
  }

  async assertInningsCanStart(match, data) {
    const rules = this.getScoringRules(match);
    this.assertExpectedBattingTeam(match, data);

    if (data.innings > rules.maxInnings) {
      throw new BadRequestError(`${match.matchType || 'T20'} matches can have only ${rules.maxInnings} innings`);
    }

    const scores = await this.repository.findScores(match._id);

    if (data.innings > 1) {
      const previousScore = this.getScoreByInnings(scores, data.innings - 1);

      if (!this.isInningsComplete(previousScore, rules)) {
        throw new ConflictError(`Innings ${data.innings} can start only after innings ${data.innings - 1} is complete`);
      }
    }

    if (['T20', 'ODI'].includes(match.matchType) && data.innings === 2) {
      const firstInnings = this.getScoreByInnings(scores, 1);
      if (firstInnings && this.getTeamId(firstInnings.battingTeam) === String(data.battingTeam)) {
        throw new BadRequestError('Second innings batting team must be the opposite team');
      }
    }

    return {
      rules,
      scores,
    };
  }

  async getScoreboard(matchId) {
    const match = await this.repository.findMatch(matchId);
    if (!match) throw new NotFoundError('Match not found');

    const [scores, recentEvents, events] = await Promise.all([
      this.repository.findScores(matchId),
      this.repository.findRecentEvents(matchId),
      this.repository.findAllEvents(matchId),
    ]);

    return {
      match,
      scores,
      recentEvents,
      stats: this.calculateScoreStats(match, scores, events),
    };
  }

  async getOrCreateScore(match, data, scores, participants, requester = null) {
    const score = await this.repository.findScore(match._id, data.innings);
    const bowlingTeam = participants.bowlingTeam;
    const previousScore = data.innings > 1 ? this.getScoreByInnings(scores, data.innings - 1) : null;
    const target = previousScore ? previousScore.runs + 1 : null;

    if (score) {
      if (this.getTeamId(score.battingTeam) !== String(data.battingTeam)) {
        throw new ConflictError('This innings already belongs to another batting team');
      }

      return score;
    }

    return this.repository.createScore({
      match: match._id,
      innings: data.innings,
      battingTeam: data.battingTeam,
      bowlingTeam,
      target,
      currentStriker: participants.striker,
      currentNonStriker: participants.nonStriker,
      currentBowler: participants.bowler,
      ...(this.getUserId(requester) ? { createdBy: this.getUserId(requester), updatedBy: this.getUserId(requester) } : {}),
    });
  }

  createPlayerStat(player) {
    return {
      player,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      overs: '0.0',
      runsConceded: 0,
      wickets: 0,
    };
  }

  calculateScoreStats(match, scores = [], events = []) {
    return scores.map((score) => {
      const battingIds = this.getLineupPlayerIds(match, score.battingTeam);
      const bowlingIds = this.getLineupPlayerIds(match, score.bowlingTeam);
      const batting = new Map();
      const bowling = new Map();

      this.getLineupForTeam(match, score.battingTeam).forEach((entry) => {
        batting.set(this.getPlayerId(entry.player), this.createPlayerStat(entry.player));
      });

      this.getLineupForTeam(match, score.bowlingTeam).forEach((entry) => {
        bowling.set(this.getPlayerId(entry.player), this.createPlayerStat(entry.player));
      });

      events
        .filter((event) => Number(event.innings) === Number(score.innings))
        .forEach((event) => {
          const strikerId = this.getPlayerId(event.striker);
          const bowlerId = this.getPlayerId(event.bowler);

          if (battingIds.has(strikerId)) {
            const stat = batting.get(strikerId) || this.createPlayerStat(event.striker);
            stat.runs += Number(event.batterRuns || event.runs || 0);
            if (event.isLegalBall) stat.balls += 1;
            if (Number(event.batterRuns || event.runs) === 4) stat.fours += 1;
            if (Number(event.batterRuns || event.runs) === 6) stat.sixes += 1;
            batting.set(strikerId, stat);
          }

          const dismissedId = this.getPlayerId(event.dismissedPlayer);
          if (dismissedId && batting.has(dismissedId)) {
            batting.get(dismissedId).isOut = true;
          }

          if (bowlingIds.has(bowlerId)) {
            const stat = bowling.get(bowlerId) || this.createPlayerStat(event.bowler);
            if (event.isLegalBall) stat.balls += 1;
            stat.runsConceded += Number(event.runs || 0) + (['WIDE', 'NO_BALL'].includes(event.extraType) ? Number(event.extras || 0) : 0);
            if (event.isWicket && !['RUN_OUT', 'RETIRED_HURT'].includes(event.wicketType)) stat.wickets += 1;
            stat.overs = this.formatOvers(stat.balls);
            bowling.set(bowlerId, stat);
          }
        });

      return {
        innings: score.innings,
        batting: Array.from(batting.values()),
        bowling: Array.from(bowling.values()),
      };
    });
  }

  async addBall(matchId, data, requester = null) {
    const match = await this.repository.findMatch(matchId);
    this.assertLiveMatch(match);
    const { rules, scores } = await this.assertInningsCanStart(match, data);
    const events = await this.repository.findAllEvents(matchId);
    const existingScore = await this.repository.findScore(match._id, data.innings);
    const initialParticipants = this.resolveBallPlayers(match, existingScore, data, events);
    const score = await this.getOrCreateScore(match, data, scores, initialParticipants, requester);
    const participants = this.resolveBallPlayers(match, score, data, events);
    if (this.isInningsComplete(score, rules)) {
      throw new ConflictError('This innings is already complete');
    }

    const extraType = data.extraType || 'NONE';
    const extras = Number(data.extras || 0);
    const runs = Number(data.runs || 0);
    const isLegalBall = this.isLegalBall(extraType);
    const wicketDelta = data.isWicket ? 1 : 0;
    const nextWickets = score.wickets + wicketDelta;

    if (nextWickets > 10) {
      throw new BadRequestError('Wickets cannot be more than 10');
    }

    if (extraType === 'NONE' && extras > 0) {
      throw new BadRequestError('Extra type is required when extras are added');
    }

    if (rules.maxBallsPerInnings && score.balls >= rules.maxBallsPerInnings) {
      throw new ConflictError(`Innings cannot exceed ${rules.maxOvers} overs`);
    }

    const eventOver = Math.floor(score.balls / 6);
    const eventBall = (score.balls % 6) + 1;
    const nextRuns = score.runs + runs + extras;
    const nextBalls = score.balls + (isLegalBall ? 1 : 0);
    const nextStrike = this.resolveNextStrike(participants, { ...data, extraType }, isLegalBall, nextBalls, nextWickets);
    const userId = this.getUserId(requester);

    const event = await this.repository.createEvent({
      match: match._id,
      score: score._id,
      innings: score.innings,
      battingTeam: this.getTeamId(score.battingTeam),
      bowlingTeam: this.getTeamId(score.bowlingTeam),
      striker: participants.striker,
      nonStriker: participants.nonStriker,
      bowler: participants.bowler,
      dismissedPlayer: participants.dismissedPlayer,
      newBatter: participants.newBatter,
      over: eventOver,
      ball: eventBall,
      runs,
      batterRuns: runs,
      extras,
      extraType,
      totalRuns: runs + extras,
      isLegalBall,
      isWicket: Boolean(data.isWicket),
      wicketType: data.isWicket ? data.wicketType || 'OTHER' : null,
      note: data.note || '',
      ...(userId ? { createdBy: userId } : {}),
    });

    const updatedScore = await this.repository.updateScore(score._id, {
      runs: nextRuns,
      wickets: nextWickets,
      balls: nextBalls,
      overs: this.formatOvers(nextBalls),
      runRate: this.calculateRunRate(nextRuns, nextBalls),
      currentStriker: nextStrike.striker,
      currentNonStriker: nextStrike.nonStriker,
      currentBowler: participants.bowler,
      ...(userId ? { updatedBy: userId } : {}),
    });

    const payload = {
      matchId: String(match._id),
      score: updatedScore,
      event,
    };

    emitToMatch(match._id, 'score.updated', payload);
    return payload;
  }
}

export { ScoreService };
export default new ScoreService();
