import mongoose from 'mongoose';
import { MatchStatus } from '../../shared/constants/matchStatus.js';

const SERIES_STATUSES = Object.freeze(['UPCOMING', 'LIVE', 'COMPLETED']);
const SERIES_FORMATS = Object.freeze(['A', 'B', 'C']);
const SERIES_GROUPS = Object.freeze(['A', 'B']);

const seriesTeamSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    group: {
      type: String,
      enum: [...SERIES_GROUPS, null],
      default: null,
    },
  },
  { _id: false }
);

const seriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    season: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: SERIES_STATUSES,
      default: 'UPCOMING',
    },
    format: {
      type: String,
      enum: SERIES_FORMATS,
      required: true,
    },
    numberOfMatches: {
      type: Number,
      required: true,
      min: 1,
    },
    teams: [seriesTeamSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

seriesSchema.index({ name: 1, season: 1 }, { unique: true });

const seriesMatchSchema = new mongoose.Schema(
  {
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      required: true,
    },
    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.UPCOMING,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

seriesMatchSchema.index({ series: 1, scheduledAt: 1 });

const Series = mongoose.models.Series || mongoose.model('Series', seriesSchema);
const SeriesMatch = mongoose.models.SeriesMatch || mongoose.model('SeriesMatch', seriesMatchSchema, 'matches');

export {
  SERIES_FORMATS,
  SERIES_GROUPS,
  SERIES_STATUSES,
  SeriesMatch,
};
export default Series;
