const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper: email transporter
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

// Separate OTP stores for signup and password reset
const signupOtpStore = new Map();
const resetOtpStore = new Map();

// Helper: generate + store OTP
const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: send styled OTP email
const sendOtpEmail = async (to, otp, subject, heading) => {
  await createTransporter().sendMail({
    from: `"IIT Palakkad Campus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#faf9f7;border-radius:12px;">
        <h2 style="color:#a4893d;">${heading}</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background:linear-gradient(120deg,#ff3a22,#c7af6b);color:white;font-size:2rem;font-weight:bold;text-align:center;padding:20px;border-radius:10px;letter-spacing:8px;margin:20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#999;font-size:0.85rem;">IIT Palakkad Campus Dashboard</p>
      </div>`
  });
};

// ─────────────────────────────────────────
//  SIGNUP OTP  (new: verify email at signup)
// ─────────────────────────────────────────

// @route   POST /api/auth/send-signup-otp
// @desc    Send OTP to verify email before registration
// @access  Public
router.post('/send-signup-otp', async (req, res) => {
  res.json({
    success: true,
    message: "OTP verification skipped (Demo Mode)."
  });
});


// @route   POST /api/auth/register
// @desc    Register user after OTP verification (student role only; admin promotes to organizer)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, registerNumber } = req.body;

    if (!fullName || !email || !password ) {
      return res.status(400).json({ success: false, message: 'All fields including OTP are required.' });
    }

    // Verify signup OTP
    //const stored = signupOtpStore.get(email);
    //if (!stored) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    //if (Date.now() > stored.expiresAt) {
      //signupOtpStore.delete(email);
      //return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    //}
    //if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered.' });

    // All new users are students; admin promotes to organizer/admin
    const user = await User.create({
      fullName,
      email,
      password,
      role: 'student',
      registerNumber: registerNumber || ''
    });

    signupOtpStore.delete(email);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        role: user.role, registerNumber: user.registerNumber, profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────

// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(user._id);
    res.json({
      success: true, token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email, role: user.role,
        registerNumber: user.registerNumber, title: user.title,
        designation: user.designation, bio: user.bio, profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @access  Protected
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────

// @route   POST /api/auth/send-otp
// @desc    Send OTP for password reset
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    const otp = makeOtp();
    resetOtpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email, otp, 'Password Reset OTP - IIT Palakkad Campus Dashboard', 'Password Reset Request');
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
  }
});

// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = resetOtpStore.get(email);
  if (!stored) return res.status(400).json({ success: false, message: 'No OTP requested for this email.' });
  if (Date.now() > stored.expiresAt) { resetOtpStore.delete(email); return res.status(400).json({ success: false, message: 'OTP has expired.' }); }
  if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  res.json({ success: true, message: 'OTP verified.' });
});

// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = resetOtpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.password = newPassword;
    await user.save();
    resetOtpStore.delete(email);
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
