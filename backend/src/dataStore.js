const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// In-memory storage (like COMP1531)
let data = {
  customers: [],
  properties: []
};

const dataFilePath = path.join(__dirname, '../data/data.json');

// Load from JSON file (persistent storage - like COMP1531)
const loadFromFile = () => {
  if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(fileData);
    console.log(`📂 Loaded data from file: ${data.customers.length} customers, ${data.properties.length} properties`);
    return true;
  }
  return false;
};

// Save to JSON file (data persistence - like COMP1531)
const saveToFile = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Load CSV data into memory
const loadData = () => {
  const csvPath = path.join(__dirname, '../data/properties.csv');
  
  // First try to load from JSON file (if exists from previous run)
  if (loadFromFile()) {
    return;
  }

  // If no JSON file, load from CSV (initial setup)
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

      // Add property
      data.properties.push({
        id: data.properties.length + 1,
        customer_code: row.customer_code,
        address: row.address,
        service_type: row.service_type,
        order_date: row.order_date,
        payment_status: row.payment_status,
        inspection_status: row.inspection_status
      });
    })
    .on('end', () => {
      console.log(`✅ Loaded ${data.customers.length} customers and ${data.properties.length} properties from CSV`);
      saveToFile(); // Save to JSON after loading CSV
    });
};

// Import CSV (when admin uploads new CSV later)
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

        // Add property
        data.properties.push({
          id: data.properties.length + 1,
          customer_code: row.customer_code,
          address: row.address,
          service_type: row.service_type,
          order_date: row.order_date,
          payment_status: row.payment_status,
          inspection_status: row.inspection_status
        });
      })
      .on('end', () => {
        saveToFile(); // Save to JSON
        resolve({ 
          customers: data.customers.length, 
          properties: data.properties.length 
        });
      })
      .on('error', reject);
  });
};

const getData = () => data;

module.exports = { loadData, getData, importCSV, saveToFile };