// routes/adminRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getAllProperties,
  updatePropertyStatus,
  VALID_STATUSES,
} = require('../services/sheetsService');
const photoRoutes = require('./photoRoutes');

// ─── Simple JWT auth middleware ───────────────────────────────────────────────
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

// ─── GET /api/admin/verify ────────────────────────────────────────────────────
// Lightweight token check used by the remember-me flow on the login page.
// Returns 200 if the token is valid, 401 if expired or invalid (via adminAuth).
router.get('/verify', adminAuth, (req, res) => {
  res.json({ valid: true });
});

// ─── GET /api/admin/properties ────────────────────────────────────────────────
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
router.use(adminAuth, photoRoutes);

module.exports = router;