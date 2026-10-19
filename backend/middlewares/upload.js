const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// Allowed file types
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

// File filter checking both MIME type and file extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Invalid file extension: ${ext}. Only .pdf and .docx documents are supported.`),
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    return cb(
      new Error(`Invalid MIME type: ${mime}. Please upload a valid PDF or Word DOCX document.`),
      false
    );
  }

  cb(null, true);
};

// Max file size (default 5MB)
const maxSize = parseInt(process.env.MAX_FILE_SIZE_BYTES, 10) || 5 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxSize,
    files: 1
  },
  fileFilter
});

module.exports = upload;
