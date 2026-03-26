// routes/adminRoutes.js
// Replaces the old CSV-based admin routes entirely.
// All data comes from / goes to Google Sheets live.
//
// Mount in server.js:
//   const adminRoutes = require('./routes/adminRoutes');
//   app.use('/api/admin', adminRoutes);
//
// Deps: npm install googleapis multer multer-storage-cloudinary cloudinary

const express = require('express');
const router  = express.Router();
const {
  getAllProperties,
  updatePropertyStatus,
  VALID_STATUSES,
} = require('../services/sheetsService');
const photoRoutes = require('./photoRoutes');

// ─── Simple JWT auth middleware ───────────────────────────────────────────────
// If you already have authMiddleware in your project, import that instead.

const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.slice(7);
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── GET /api/admin/properties ────────────────────────────────────────────────
// Returns all properties live from Google Sheets.

router.get('/properties', adminAuth, async (req, res) => {
  try {
    const properties = await getAllProperties();
    res.json({ properties });
  } catch (err) {
    console.error('Error fetching properties:', err.message);
    res.status(500).json({ error: 'Failed to fetch properties from Google Sheets.' });
  }
});

// ─── PATCH /api/admin/properties/:rowId/status ───────────────────────────────
// Updates current_status and appends to status_history in the Sheet.
// Body: { status: "Surveyed" }

router.patch('/properties/:rowId/status', adminAuth, async (req, res) => {
  const rowId = parseInt(req.params.rowId, 10);
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    await updatePropertyStatus(rowId, status);
    res.json({ success: true, rowId, status });
  } catch (err) {
    console.error('Status update error:', err.message);
    res.status(500).json({ error: 'Failed to update status in Google Sheets.' });
  }
});

// ─── Photo upload routes (Cloudinary) ────────────────────────────────────────
// POST   /api/admin/upload-photo
// DELETE /api/admin/delete-photo

router.use(adminAuth, photoRoutes);

module.exports = router;