const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, requireRole } = require('../middleware/auth');

// @route   GET /api/gc
// @desc    Get the active General Championship event
// @access  Public
router.get('/', async (req, res) => {
  try {
    const gcEvent = await Event.findOne({ eventType: 'multi-sport', status: 'approved' }).sort({ createdAt: -1 });
    if (!gcEvent) {
      return res.status(404).json({ success: false, message: 'No active General Championship found.' });
    }
    
    // Sort leaderboard by points descending
    gcEvent.leaderboard.sort((a, b) => b.points - a.points);
    
    res.json({ success: true, event: gcEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/gc/register/:eventId
// @desc    Register for a specific sport in GC
// @access  Protected
router.post('/register/:eventId', protect, async (req, res) => {
  try {
    const { sportName, team } = req.body;
    if (!sportName || !team) {
      return res.status(400).json({ success: false, message: 'Sport name and team are required for GC registration.' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event || event.eventType !== 'multi-sport') return res.status(404).json({ success: false, message: 'GC Event not found.' });
    
    const sport = event.sports.find(s => s.name === sportName);
    if (!sport) return res.status(404).json({ success: false, message: 'Sport not found in this GC.' });
    if (sport.status === 'closed') return res.status(400).json({ success: false, message: 'Registration for this sport is closed.' });

    const existing = await Registration.findOne({ event: event._id, user: req.user._id, sportName });
    if (existing && existing.status === 'registered') {
      return res.status(400).json({ success: false, message: `You are already registered for ${sportName}.` });
    }

    if (existing && existing.status === 'cancelled') {
      existing.status = 'registered';
      existing.team = team;
      await existing.save();
    } else {
      await Registration.create({ event: event._id, user: req.user._id, sportName, team });
    }

    res.status(201).json({ success: true, message: `Successfully registered for ${sportName} under team ${team}!` });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already registered for this sport.' });
    }
    console.error('GC Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/gc/points/:eventId
// @desc    Admin adds/updates points for a team in a sport
// @access  Admin
router.post('/points/:eventId', protect, requireRole('admin'), async (req, res) => {
  try {
    const { team, sport, points } = req.body;
    if (!team || !sport || points === undefined) {
      return res.status(400).json({ success: false, message: 'Team, sport, and points are required.' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event || event.eventType !== 'multi-sport') return res.status(404).json({ success: false, message: 'GC Event not found.' });

    // Check if leaderboard entry exists
    const entryIndex = event.leaderboard.findIndex(l => l.team === team && l.sport === sport);
    if (entryIndex !== -1) {
      event.leaderboard[entryIndex].points = points;
    } else {
      event.leaderboard.push({ team, sport, points });
    }

    await event.save();
    res.json({ success: true, message: 'Points updated successfully.', leaderboard: event.leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/gc/participants/:eventId
// @desc    Get participants for GC grouped by sport
// @access  Admin, Organizer
router.get('/participants/:eventId', protect, requireRole('admin', 'organizer'), async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId, status: 'registered' })
      .populate('user', 'fullName email registerNumber team');
    
    // Group by sport
    const grouped = {};
    registrations.forEach(reg => {
      if (!grouped[reg.sportName]) grouped[reg.sportName] = [];
      grouped[reg.sportName].push(reg);
    });

    res.json({ success: true, participants: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

const PDFDocument = require('pdfkit');

// @route   GET /api/gc/certificate/:regId
// @desc    Download certificate for a specific registration
// @access  Protected
router.get('/certificate/:regId', protect, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.regId).populate('event').populate('user');
    if (!reg || reg.status !== 'registered') return res.status(404).json({ success: false, message: 'Registration not found' });
    
    // Check if it's the user's registration
    if (reg.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${reg.user.fullName.replace(/\s+/g, '_')}_${reg.sportName || 'Event'}.pdf`);

    doc.pipe(res);

    // Simple Certificate Design
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#faf9f7');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#c7af6b');
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#c7af6b');

    doc.fontSize(40).fillColor('#a4893d').text('Certificate of Participation', { align: 'center', margin: 100 });
    doc.moveDown(1);
    doc.fontSize(20).fillColor('#333').text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(30).fillColor('#ff3a22').text(reg.user.fullName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#333').text('has successfully participated in', { align: 'center' });
    doc.moveDown(0.5);
    
    const eventNameText = reg.sportName ? `${reg.sportName} (${reg.event.title})` : reg.event.title;
    doc.fontSize(25).fillColor('#1565c0').text(eventNameText, { align: 'center' });
    
    if (reg.user.team && reg.user.team !== 'None') {
      doc.moveDown(0.5);
      doc.fontSize(18).fillColor('#555').text(`Representing Team: ${reg.user.team}`, { align: 'center' });
    }

    doc.moveDown(2);
    doc.fontSize(16).fillColor('#888').text('IIT Palakkad Campus Dashboard', { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error generating certificate.' });
  }
});

module.exports = router;
