const express = require('express');
const cors = require('cors');
const { loadData, getData } = require('./dataStore');

const app = express();
const PORT = 3000;

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

// Start server
app.listen(PORT, () => {
  console.log(`⚡️ Server started on port ${PORT}`);
});