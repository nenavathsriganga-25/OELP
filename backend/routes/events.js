const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, requireRole } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all approved events (with optional filters)
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    // Admin/organizer can see their own pending/rejected events; public sees approved
    if (req.user.role === 'admin') {
      if (status) query.status = status;
    } else if (req.user.role === 'organizer') {
      query = { $or: [{ status: 'approved' }, { organizer: req.user._id }] };
      if (status) query = { organizer: req.user._id, status };
    } else {
      query.status = 'approved';
    }

    if (category && category !== 'all') query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query)
      .populate('organizer', 'fullName email')
      .sort({ date: 1 });

    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/events/all
// @desc    Get ALL events (admin only)
// @access  Admin
router.get('/all', protect, requireRole('admin'), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/events/my
// @desc    Get events created by logged-in organizer
// @access  Organizer
router.get('/my', protect, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event details
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email designation')
      .populate('participants', 'fullName email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Organizer, Admin
router.post('/', protect, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { title, description, category, date, time, venue, registrationDeadline, maxParticipants, agenda, image, contact, instagram } = req.body;

    const event = await Event.create({
      title, description, category, date, time, venue,
      registrationDeadline, maxParticipants: maxParticipants || 100,
      agenda: agenda || '', image: image || '', contact: contact || '',
      instagram: instagram || '',
      organizer: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    await event.populate('organizer', 'fullName email');

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Organizer (own events), Admin
router.put('/:id', protect, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Organizers can only edit their own events
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'fullName email');

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   PATCH /api/events/:id/status
// @desc    Approve or reject an event
// @access  Admin
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('organizer', 'fullName email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Organizer (own), Admin
router.delete('/:id', protect, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
