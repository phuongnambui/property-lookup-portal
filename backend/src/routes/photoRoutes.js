// routes/photoRoutes.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary }    = require('cloudinary');
const { updatePhotoUrl, updatePdfUrl } = require('../services/sheetsService');

// ─── Cloudinary config ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Photo: uses CloudinaryStorage (same as before) ──────────────────────────
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'vnco-deficiency-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    transformation:  [{ width: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits:  { fileSize: 15 * 1024 * 1024 },
});

// ─── PDF: uses memoryStorage + upload_stream (resource_type raw) ──────────────
// CloudinaryStorage doesn't reliably support resource_type: raw,
// so we buffer in memory and stream directly to Cloudinary instead.
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

// ─── POST /api/admin/upload-photo ────────────────────────────────────────────
router.post('/upload-photo', uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided.' });
    }
    const rowId = parseInt(req.body.rowId, 10);
    if (!rowId || isNaN(rowId)) {
      return res.status(400).json({ error: 'rowId is required and must be a number.' });
    }
    const photoUrl = req.file.path;
    await updatePhotoUrl(rowId, photoUrl);
    return res.json({ success: true, photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// ─── POST /api/admin/upload-pdf ──────────────────────────────────────────────
router.post('/upload-pdf', uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided.' });
    }
    const rowId = parseInt(req.body.rowId, 10);
    if (!rowId || isNaN(rowId)) {
      return res.status(400).json({ error: 'rowId is required and must be a number.' });
    }

    const pdfUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder:        'vnco-deficiency-pdfs',
          public_id:     `property-${rowId}-${Date.now()}`,
          format:        'pdf',
        },
        (err, result) => (err ? reject(err) : resolve(result.secure_url)),
      );
      stream.end(req.file.buffer);
    });

    await updatePdfUrl(rowId, pdfUrl);
    return res.json({ success: true, pdfUrl });
  } catch (err) {
    console.error('PDF upload error:', err);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// ─── DELETE /api/admin/delete-photo ──────────────────────────────────────────
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