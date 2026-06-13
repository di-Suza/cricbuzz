import mongoose from 'mongoose';
import {
  PLAYER_BATTING_STYLES,
  PLAYER_BOWLING_STYLES,
  PLAYER_ROLES,
} from './player.constants.js';

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null, // ImageKit URL
    },
    role: {
      type: String,
      enum: PLAYER_ROLES,
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    battingStyle: {
      type: String,
      enum: PLAYER_BATTING_STYLES,
      required: true,
    },
    bowlingStyle: {
      type: String,
      enum: [...PLAYER_BOWLING_STYLES, null],
      default: null,
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

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

export default Player;
