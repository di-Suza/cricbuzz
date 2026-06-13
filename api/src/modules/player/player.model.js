import mongoose from 'mongoose';

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
      enum: ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'],
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    battingStyle: {
      type: String,
    },
    bowlingStyle: {
      type: String,
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
