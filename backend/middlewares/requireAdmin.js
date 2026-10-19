/**
 * requireAdmin middleware
 * Must be used AFTER the protect middleware.
 * Rejects non-admin users with HTTP 403 Forbidden.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

module.exports = { requireAdmin };
