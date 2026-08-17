const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  },
  sportName: {
    type: String,
    default: ''
  },
  team: {
    type: String,
    default: 'None'
  }
}, { timestamps: true });

// Prevent duplicate registrations for same event/sport
registrationSchema.index({ event: 1, user: 1, sportName: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
