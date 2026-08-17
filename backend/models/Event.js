const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'other']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  agenda: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  eventType: {
    type: String,
    enum: ['standard', 'multi-sport'],
    default: 'standard'
  },
  sports: [{
    name: { type: String, required: true },
    maxPlayers: { type: Number, default: 50 },
    date: { type: Date },
    time: { type: String },
    venue: { type: String },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
  }],
  leaderboard: [{
    team: { type: String },
    sport: { type: String },
    points: { type: Number, default: 0 }
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
