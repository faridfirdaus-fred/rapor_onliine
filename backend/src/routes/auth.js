import express from 'express';
import crypto from 'crypto';
import { User, ResetToken } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendResetPasswordEmail, sendWelcomeEmail } from '../utils/email.js';

const router = express.Router();

// Register new user (DISABLED - accounts are pre-created)
router.post('/register', async (req, res) => {
  res.status(403).json({ 
    error: 'Registration is disabled. Please use provided credentials.',
    message: 'Contact admin for account access.'
  });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: User.sanitize(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot password - request reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Delete any existing reset tokens for this user
    await ResetToken.deleteByUserId(user.id);

    // Create new reset token
    await ResetToken.create(user.id, resetToken);

    // Send email
    const emailResult = await sendResetPasswordEmail(user.email, resetToken);

    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      ...(emailResult.token && { resetToken: emailResult.token }) // Include token in test mode
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find reset token
    const resetToken = await ResetToken.findByToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    await User.updatePassword(resetToken.userId, newPassword);

    // Delete reset token
    await ResetToken.delete(resetToken.id);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get current user (requires auth middleware)
router.get('/me', async (req, res) => {
  try {
    // This would be called with auth middleware
    // For now, just return error
    res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

export default router;
