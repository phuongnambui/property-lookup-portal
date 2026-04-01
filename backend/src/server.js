require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { adminLogin, verifyAdminToken } = require('./adminStore');
const {
  getPropertiesByCustomerCode,
  getAllProperties,
  updatePropertyStatus,
  updatePhotoUrl,
  updatePdfUrl,
  VALID_STATUSES,
} = require('./services/sheetsService');
const photoRoutes = require('./routes/photoRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

function getToken(req) {
  return req.headers.authorization?.replace('Bearer ', '');
}

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/status-flow', (req, res) => {
  res.json({ statuses: VALID_STATUSES });
});

// ── Customer ──────────────────────────────────────────────────────────────────

app.get('/api/customer/:customerCode', async (req, res) => {
  try {
    const { customerCode } = req.params;
    const data = await getPropertiesByCustomerCode(customerCode);
    if (!data) return res.status(404).json({ error: 'Customer code not found' });
    return res.json(data);
  } catch (error) {
    console.error('Customer lookup error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data. Please try again.' });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await adminLogin(username, password);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.get('/api/admin/verify', (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.get('/api/admin/properties', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    const properties = await getAllProperties();
    return res.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    return res.status(500).json({ error: 'Failed to fetch properties from Google Sheets.' });
  }
});

app.patch('/api/admin/properties/:rowId/status', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    const rowId = parseInt(req.params.rowId, 10);
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }
    await updatePropertyStatus(rowId, status);
    return res.json({ success: true, rowId, status });
  } catch (error) {
    console.error('Status update error:', error.message);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

app.use('/api/admin', (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}, photoRoutes);

app.delete('/api/admin/properties/:rowId/photo', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    const rowId = parseInt(req.params.rowId, 10);
    await updatePhotoUrl(rowId, '');
    return res.json({ success: true });
  } catch (error) {
    console.error('Photo remove error:', error.message);
    return res.status(500).json({ error: 'Failed to remove photo.' });
  }
});

app.delete('/api/admin/properties/:rowId/pdf', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    verifyAdminToken(token);
    const rowId = parseInt(req.params.rowId, 10);
    await updatePdfUrl(rowId, '');
    return res.json({ success: true });
  } catch (error) {
    console.error('PDF remove error:', error.message);
    return res.status(500).json({ error: 'Failed to remove PDF.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`⚡️ Server started on port ${PORT}`);
});