const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const { protect, requireRole } = require('../middleware/auth');

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// @route   GET /api/registrations/my
// @desc    Get my registered events
// @access  Protected
router.get('/my', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id, status: 'registered' })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get participants of an event
// @access  Organizer, Admin
router.get('/event/:eventId', protect, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId, status: 'registered' })
      .populate('user', 'fullName email registerNumber role')
      .sort({ createdAt: 1 });
    res.json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/registrations/:eventId
// @desc    Register for an event
// @access  Protected
router.post('/:eventId', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.status !== 'approved') return res.status(400).json({ success: false, message: 'This event is not open for registration.' });
    if (new Date() > new Date(event.registrationDeadline)) return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    if (event.participants.length >= event.maxParticipants) return res.status(400).json({ success: false, message: 'Event is full.' });

    const existing = await Registration.findOne({ event: req.params.eventId, user: req.user._id });
    if (existing && existing.status === 'registered') return res.status(400).json({ success: false, message: 'You are already registered for this event.' });

    if (existing && existing.status === 'cancelled') {
      existing.status = 'registered';
      await existing.save();
    } else {
      await Registration.create({ event: req.params.eventId, user: req.user._id });
    }

    if (!event.participants.includes(req.user._id)) {
      event.participants.push(req.user._id);
      await event.save();
    }

    // Send confirmation email (non-blocking)
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"IIT Palakkad Campus" <${process.env.EMAIL_USER}>`,
        to: req.user.email,
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf9f7; border-radius: 12px;">
            <h2 style="color: #a4893d;">Registration Confirmed! 🎉</h2>
            <p>Hi <strong>${req.user.fullName}</strong>, you have successfully registered for:</p>
            <div style="background: linear-gradient(120deg, #ff3a22, #c7af6b); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin:0;">${event.title}</h3>
              <p style="margin:8px 0 0;">📅 ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin:4px 0 0;">⏰ ${event.time} &nbsp; 📍 ${event.venue}</p>
            </div>
            <p style="color: #999; font-size: 0.85rem;">IIT Palakkad Campus Dashboard</p>
          </div>`
      });
    } catch (emailErr) {
      console.error('Confirmation email failed (non-fatal):', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Successfully registered for the event!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   DELETE /api/registrations/:eventId
// @desc    Cancel registration
// @access  Protected
router.delete('/:eventId', protect, async (req, res) => {
  try {
    const registration = await Registration.findOne({ event: req.params.eventId, user: req.user._id });
    if (!registration || registration.status === 'cancelled') {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    registration.status = 'cancelled';
    await registration.save();
    await Event.findByIdAndUpdate(req.params.eventId, { $pull: { participants: req.user._id } });

    res.json({ success: true, message: 'Registration cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
