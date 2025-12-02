import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rapor-digital-secret-key-change-in-production';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request object (without password)
    req.user = User.sanitize(user);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user has access to specific kelas
export const kelasAccess = (req, res, next) => {
  // Admin can access all kelas
  if (req.user.role === 'admin') {
    return next();
  }

  // Guru can only access their own kelas
  const kelasId = req.params.kelasId || req.params.id || req.body.kelasId;
  
  if (!kelasId) {
    return next(); // Let route handler deal with missing kelasId
  }

  if (req.user.kelasId !== kelasId) {
    return res.status(403).json({ error: 'Access denied. You can only access your own class.' });
  }

  next();
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};
