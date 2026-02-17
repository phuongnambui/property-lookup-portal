const express = require('express');
const cors = require('cors');
const { loadData, getData } = require('./dataStore');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Load data on startup
loadData();

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Customer login
app.get('/api/customer/:customerCode', (req, res) => {
  const { customerCode } = req.params;
  
  const data = getData();
  const properties = data.properties.filter(p => p.customer_code === customerCode);
  
  if (properties.length === 0) {
    return res.status(404).json({ error: 'Customer code not found' });
  }
  
  const customer = data.customers.find(c => c.customer_code === customerCode);
  
  return res.json({
    customer,
    properties
  });
});

const { adminLogin, verifyAdminToken, adminLogout } = require('./adminStore');
const { importCSV } = require('./dataStore');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await adminLogin(username, password);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);
    const result = adminLogout(token);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

// Admin CSV upload endpoint
app.post('/api/admin/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Import the CSV
    const result = await importCSV(req.file.path);

    // Delete uploaded file after processing
    fs.unlinkSync(req.file.path);

    return res.json({
      message: 'CSV uploaded successfully',
      customersImported: result.customers,
      propertiesImported: result.properties
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin get all customers
app.get('/api/admin/customers', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);

    const data = getData();
    return res.json({ customers: data.customers });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

// Admin get all properties
app.get('/api/admin/properties', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);

    const data = getData();
    return res.json({ properties: data.properties });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

const { updatePropertyStatus, updateDeficiencyPhoto, STATUS_FLOW } = require('./dataStore');

// Get status workflow 
app.get('/api/status-flow', (req, res) => {
  return res.json({ statuses: STATUS_FLOW });
});

// Admin update property status
app.put('/api/admin/property/:id/status', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);

    const propertyId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedProperty = updatePropertyStatus(propertyId, status);
    return res.json({ 
      message: 'Status updated successfully',
      property: updatedProperty 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Admin upload deficiency photo
app.post('/api/admin/property/:id/photo', upload.single('photo'), (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    verifyAdminToken(token);

    const propertyId = parseInt(req.params.id);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Move file to permanent storage location
    const photoDir = path.join(__dirname, '../uploads/deficiency-photos');
    if (!fs.existsSync(photoDir)) {
      fs.mkdirSync(photoDir, { recursive: true });
    }

    const newPath = path.join(photoDir, `${propertyId}-${Date.now()}${path.extname(req.file.originalname)}`);
    fs.renameSync(req.file.path, newPath);

    // Store relative path in database
    const photoUrl = `uploads/deficiency-photos/${path.basename(newPath)}`;
    const updatedProperty = updateDeficiencyPhoto(propertyId, photoUrl);

    return res.json({
      message: 'Photo uploaded successfully',
      property: updatedProperty
    });
  } catch (error) {
    // Clean up file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: error.message });
  }
});

// Serve uploaded photos (static file serving)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`⚡️ Server started on port ${PORT}`);
});

