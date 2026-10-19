const mongoose = require('mongoose');

/**
 * Validate that a string or param is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

/**
 * Middleware to validate :id parameter
 */
const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid identifier format for parameter: ${paramName}`
      });
    }
    next();
  };
};

/**
 * Sanitize query object against MongoDB operator injection ($gt, $ne, $where, etc.)
 * Only allows primitive values (string, number, boolean)
 */
const sanitizeQuery = (allowedFields = []) => {
  return (req, res, next) => {
    const sanitized = {};
    for (const key of Object.keys(req.query)) {
      // Check field is in whitelist if specified
      if (allowedFields.length > 0 && !allowedFields.includes(key)) {
        continue;
      }
      const val = req.query[key];
      // Strip any nested objects containing $ operators
      if (typeof val === 'string') {
        sanitized[key] = val.trim();
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        sanitized[key] = val;
      }
    }
    req.sanitizedQuery = sanitized;
    next();
  };
};

module.exports = {
  isValidObjectId,
  validateObjectIdParam,
  sanitizeQuery
};
