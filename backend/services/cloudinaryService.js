const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary from environment variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Upload a local file buffer or path to Cloudinary (with local fallback if unconfigured)
 * @param {string} filePath - Absolute path to temporary uploaded file
 * @param {string} originalFilename - Original filename
 * @returns {Promise<{ fileUrl: string, publicId: string }>}
 */
const uploadResumeFile = async (filePath, originalFilename) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'resumeiq/resumes',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true
      });

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id
      };
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err.message);
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
  }

  // Graceful local fallback for development environments without Cloudinary credentials
  const filename = path.basename(filePath);
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const destination = path.join(uploadsDir, filename);
  if (filePath !== destination && fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, destination);
  }

  const fileUrl = `/uploads/${filename}`;
  return {
    fileUrl,
    publicId: `local_${filename}`
  };
};

/**
 * Delete a resume file from Cloudinary (or local fallback)
 * @param {string} publicId
 * @param {string} fileUrl
 */
const deleteResumeFile = async (publicId, fileUrl) => {
  if (isCloudinaryConfigured && publicId && !publicId.startsWith('local_')) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('[Cloudinary Delete Warning]', err.message);
    }
    return;
  }

  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    try {
      const filename = path.basename(fileUrl);
      const localPath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.warn('[Local File Delete Warning]', err.message);
    }
  }
};

module.exports = {
  uploadResumeFile,
  deleteResumeFile,
  isCloudinaryConfigured
};
