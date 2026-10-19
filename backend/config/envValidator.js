/**
 * Validate essential environment variables at server startup
 * Fails fast with clear diagnostic message in production if critical secrets are missing
 */
const validateEnv = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // Critical Variables
  if (!process.env.MONGODB_URI) {
    if (isProd) {
      errors.push('MONGODB_URI is required in production.');
    } else {
      warnings.push('MONGODB_URI not set; using local fallback (mongodb://127.0.0.1:27017/resumeiq).');
    }
  }

  if (!process.env.JWT_SECRET) {
    if (isProd) {
      errors.push('JWT_SECRET must be explicitly configured in production.');
    } else {
      warnings.push('JWT_SECRET not set; using development fallback key.');
    }
  }

  // Recommended Cloud Integrations
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is not set. Intelligent AI features will operate with structured fallback heuristics.');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    warnings.push('Cloudinary credentials incomplete. Uploaded files will be stored in local backend/uploads directory.');
  }

  if (warnings.length > 0 && !isProd) {
    console.log('[Config Notice]');
    warnings.forEach((w) => console.log(` - ${w}`));
  }

  if (errors.length > 0) {
    console.error('[FATAL CONFIGURATION ERROR]');
    errors.forEach((e) => console.error(` - ${e}`));
    if (isProd) {
      process.exit(1);
    }
  }
};

module.exports = validateEnv;
