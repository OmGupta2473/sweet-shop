const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set in environment');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id, user.role);
    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ message: 'GOOGLE_CLIENT_ID not configured on server' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, email_verified } = payload || {};
    if (!email || (email_verified === false)) return res.status(400).json({ message: 'Google token invalid or email not verified' });

    let user = await User.findOne({ email });
    if (!user) {
      // Create a user with a random password (hashed) so existing auth paths remain compatible
      const randomPwd = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(randomPwd, salt);
      user = await User.create({ name: name || email.split('@')[0], email, password: hashed });
    }

    const token = generateToken(user._id, user.role);
    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error('Google auth error', err);
    res.status(500).json({ message: 'Google auth failed' });
  }
};

// Note: `/me` endpoint removed. Only register and login are part of the contract.
