// routes/photoRoutes.js
// Handles deficiency photo uploads via Cloudinary.
// Photos are stored permanently on Cloudinary — URL is written back to Google Sheets.
//
// Required env vars:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//
// Install deps:
//   npm install cloudinary multer multer-storage-cloudinary

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');
const { updatePhotoUrl } = require('../services/sheetsService');

// ─── Cloudinary config ───────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer + Cloudinary storage ─────────────────────────────────────────────

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vnco-deficiency-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
});

// ─── POST /api/admin/upload-photo ────────────────────────────────────────────
//
// Multipart form fields:
//   photo    — the image file
//   rowId    — the sheet row id (1-based, from sheetsService)
//
// Returns: { success: true, photoUrl: "https://res.cloudinary.com/..." }

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided.' });
    }

    const rowId = parseInt(req.body.rowId, 10);
    if (!rowId || isNaN(rowId)) {
      return res.status(400).json({ error: 'rowId is required and must be a number.' });
    }

    const photoUrl = req.file.path; // Cloudinary URL

    // Write the URL back to Google Sheets column G
    await updatePhotoUrl(rowId, photoUrl);

    return res.json({ success: true, photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// ─── DELETE /api/admin/delete-photo ──────────────────────────────────────────
//
// Body: { rowId, publicId }   (publicId from Cloudinary — optional convenience)

router.delete('/delete-photo', async (req, res) => {
  try {
    const { rowId, publicId } = req.body;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    if (rowId) {
      await updatePhotoUrl(parseInt(rowId, 10), '');
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete photo error:', err);
    return res.status(500).json({ error: 'Delete failed.' });
  }
});

module.exports = router;