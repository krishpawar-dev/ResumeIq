const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[Register Error]', error);

    // Mongoose duplicate key error fallback
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Login failed. Please try again.'
    });
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (JWT Protected)
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile.'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
