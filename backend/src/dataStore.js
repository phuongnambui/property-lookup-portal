const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// In-memory storage
let data = {
  customers: [],
  properties: []
};

const dataFilePath = path.join(__dirname, '../data/data.json');

// Property status workflow
const STATUS_FLOW = [
  'Request Received',
  'Surveyed', 
  'Certificate Processing',
  'Submitted to City',
  'Pass',
  'Fail'
];

// Load from JSON file (persistent storage)
const loadFromFile = () => {
  if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(fileData);
    console.log(`📂 Loaded data from file: ${data.customers.length} customers, ${data.properties.length} properties`);
    return true;
  }
  return false;
};

// Save to JSON file
const saveToFile = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Load CSV data into memory
const loadData = () => {
  const csvPath = path.join(__dirname, '../data/properties.csv');
  
  // First try to load from JSON file
  if (loadFromFile()) {
    return;
  }

  // If no JSON file, load from CSV
  if (!fs.existsSync(csvPath)) {
    console.log('No data file found - using empty data');
    return;
  }

  // Reset data
  data.customers = [];
  data.properties = [];
  const customerSet = new Set();

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      // Add customer if not exists
      if (!customerSet.has(row.customer_code)) {
        data.customers.push({
          customer_code: row.customer_code,
          company_name: row.company_name
        });
        customerSet.add(row.customer_code);
      }

      // Parse status history from CSV
      // Expected format: "Request Received:2024-01-15,Surveyed:2024-01-16"
      const statusHistory = [];
      if (row.status_history) {
        const entries = row.status_history.split(',');
        entries.forEach(entry => {
          const [status, date] = entry.split(':');
          if (status && date) {
            statusHistory.push({
              status: status.trim(),
              date: date.trim(),
              timestamp: new Date(date.trim()).toISOString()
            });
          }
        });
      }

      // Determine current status (last in history or from current_status field)
      const currentStatus = statusHistory.length > 0 
        ? statusHistory[statusHistory.length - 1].status 
        : (row.current_status || 'Request Received');

      // Add property
      data.properties.push({
        id: data.properties.length + 1,
        customer_code: row.customer_code,
        address: row.address,
        service_type: row.service_type,
        order_date: row.order_date,
        current_status: currentStatus,
        status_history: statusHistory,
        has_deficiency: row.has_deficiency === 'true' || row.has_deficiency === 'TRUE',
        deficiency_photo_url: row.deficiency_photo_url || null,
        attempt_number: parseInt(row.attempt_number) || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    })
    .on('end', () => {
      console.log(`✅ Loaded ${data.customers.length} customers and ${data.properties.length} properties from CSV`);
      saveToFile();
    });
};

// Import CSV (when admin uploads new CSV)
const importCSV = (csvPath) => {
  return new Promise((resolve, reject) => {
    data.customers = [];
    data.properties = [];
    const customerSet = new Set();

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Add customer if not exists
        if (!customerSet.has(row.customer_code)) {
          data.customers.push({
            customer_code: row.customer_code,
            company_name: row.company_name
          });
          customerSet.add(row.customer_code);
        }

        // Parse status history
        const statusHistory = [];
        if (row.status_history) {
          const entries = row.status_history.split(',');
          entries.forEach(entry => {
            const [status, date] = entry.split(':');
            if (status && date) {
              statusHistory.push({
                status: status.trim(),
                date: date.trim(),
                timestamp: new Date(date.trim()).toISOString()
              });
            }
          });
        }

        const currentStatus = statusHistory.length > 0 
          ? statusHistory[statusHistory.length - 1].status 
          : (row.current_status || 'Request Received');

        // Add property
        data.properties.push({
          id: data.properties.length + 1,
          customer_code: row.customer_code,
          address: row.address,
          service_type: row.service_type,
          order_date: row.order_date,
          current_status: currentStatus,
          status_history: statusHistory,
          has_deficiency: row.has_deficiency === 'true' || row.has_deficiency === 'TRUE',
          deficiency_photo_url: row.deficiency_photo_url || null,
          attempt_number: parseInt(row.attempt_number) || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      })
      .on('end', () => {
        saveToFile();
        resolve({ 
          customers: data.customers.length, 
          properties: data.properties.length 
        });
      })
      .on('error', reject);
  });
};

// Update property status (move to next stage)
const updatePropertyStatus = (propertyId, newStatus) => {
  const property = data.properties.find(p => p.id === propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  // Check if status is valid
  if (!STATUS_FLOW.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  // If status is 'Fail', restart the timeline
  if (newStatus === 'Fail') {
    property.status_history.push({
      status: 'Fail',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    
    // Restart from beginning
    property.current_status = 'Request Received';
    property.attempt_number += 1;
    property.status_history.push({
      status: 'Request Received',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      note: `Attempt ${property.attempt_number} after failure`
    });
  } else if (property.current_status === 'Pass') {
    // Cannot change status after Pass
    throw new Error('Cannot update status - property already passed');
  } else {
    // Normal status update
    property.status_history.push({
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    property.current_status = newStatus;
  }

  property.updated_at = new Date().toISOString();
  saveToFile();
  
  return property;
};

// Update deficiency photo
const updateDeficiencyPhoto = (propertyId, photoUrl) => {
  const property = data.properties.find(p => p.id === propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  property.has_deficiency = true;
  property.deficiency_photo_url = photoUrl;
  property.updated_at = new Date().toISOString();
  saveToFile();
  
  return property;
};

const getData = () => data;

module.exports = { 
  loadData, 
  getData, 
  importCSV, 
  saveToFile,
  updatePropertyStatus,
  updateDeficiencyPhoto,
  STATUS_FLOW
};