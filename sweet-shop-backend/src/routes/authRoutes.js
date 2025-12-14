const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], login);
router.post('/google', googleAuth);
// Note: only register and login endpoints are provided per spec.

module.exports = router;
