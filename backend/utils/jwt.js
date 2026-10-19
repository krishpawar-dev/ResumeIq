const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'resumeiq_jwt_super_secure_secret_key_2026_production_grade_tokens';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, {
    expiresIn
  });
};

/**
 * Verify a JWT token
 * @param {string} token 
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'resumeiq_jwt_super_secure_secret_key_2026_production_grade_tokens';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
