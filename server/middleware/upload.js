const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// Cloudflare R2 Client configuration
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // e.g. https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Cloudinary storage for bank slip images (Payment uploads by students).
 * Stored under the 'educator/slips' folder.
 */
const slipStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'educator/slips',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

/**
 * Cloudinary storage for course/lesson pack images.
 */
const courseImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'educator/courses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

/**
 * Cloudflare R2 storage for PDF and Video materials
 */
const materialStorage = multerS3({
  s3: s3,
  bucket: process.env.R2_BUCKET_NAME || 'my-bucket',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'pdfs';
    const ext = file.mimetype.startsWith('video/') ? 'mp4' : 'pdf';
    cb(null, `${folder}/mat-${uniqueSuffix}.${ext}`);
  }
});

// ── Multer instances ─────────────────────────────────────────────────────────

/** Use for payment slip uploads (image) */
const uploadSlip = multer({
  storage: slipStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

/** Use for Material uploads (PDF or Video) */
const uploadMaterial = multer({
  storage: materialStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Video files are allowed'), false);
    }
  },
});

// Helper function to delete from R2
const deleteFromR2 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await s3.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
  }
};

/**
 * Cloudinary storage for profile images.
 */
const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'educator/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }],
  },
});

/** Use for course images */
const uploadCourseImage = multer({
  storage: courseImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

/** Use for profile images */
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = { uploadSlip, uploadMaterial, uploadCourseImage, uploadProfileImage, deleteFromR2 };
