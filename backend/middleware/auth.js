const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  JWT_SECRET is not set. Using fallback — set this in production!');
}

const SECRET = JWT_SECRET || 'stuman_fallback_secret_dev_only';

/**
 * Middleware: Verifies Bearer JWT token in Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Pass JWT errors to centralized error handler
    next(err);
  }
};

/**
 * Middleware factory: Restricts route to specified roles.
 * Must be used AFTER authenticateToken.
 * @param {string[]} roles - e.g. ['admin'] or ['admin', 'teacher']
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET: SECRET };
