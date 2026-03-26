// services/sheetsService.js
const { google } = require('googleapis');

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID   = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1';

// ─── Actual Sheet columns ─────────────────────────────────────────
//  A: customer_code
//  B: company_name
//  C: address
//  D: service_type
//  E: current_status
//  F: submission_date
//  G: has_deficiency       TRUE or FALSE
//  H: deficiency_photo_url
//  I: attempt_number

const DATA_RANGE = `${SHEET_NAME}!A2:I`;

const VALID_STATUSES = [
  'Request Received',
  'Surveyed',
  'Certificate Processing',
  'Submitted to City',
  'Pass',
  'Fail',
];

function parseRow(row, rowIndex) {
  const [
    customer_code        = '',
    company_name         = '',
    address              = '',
    service_type         = '',
    current_status       = '',
    submission_date      = '',
    has_deficiency_raw   = 'FALSE',
    deficiency_photo_url = '',
    attempt_number_raw   = '1',
  ] = row;

  return {
    id:                   rowIndex, // 1-based (row 2 = id 1)
    customer_code:        customer_code.trim(),
    company_name:         company_name.trim(),
    address:              address.trim(),
    service_type:         service_type.trim(),
    current_status:       current_status.trim(),
    submission_date:      submission_date.trim(),
    has_deficiency:       has_deficiency_raw?.toString().toUpperCase() === 'TRUE',
    deficiency_photo_url: deficiency_photo_url.trim(),
    attempt_number:       parseInt(attempt_number_raw, 10) || 1,
  };
}

async function getPropertiesByCustomerCode(customerCode) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: DATA_RANGE,
  });

  const rows = res.data.values || [];
  const properties = rows
    .map((row, i) => parseRow(row, i + 1))
    .filter((p) => p.customer_code.toUpperCase() === customerCode.toUpperCase());

  if (properties.length === 0) return null;

  return {
    customer_code: customerCode.toUpperCase(),
    company_name:  properties[0].company_name,
    properties,
  };
}

async function getAllProperties() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: DATA_RANGE,
  });

  const rows = res.data.values || [];
  return rows.map((row, i) => parseRow(row, i + 1));
}

// Update deficiency_photo_url — column H
async function updatePhotoUrl(rowId, photoUrl) {
  const sheets   = getSheetsClient();
  const sheetRow = rowId + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range:         `${SHEET_NAME}!H${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody:   { values: [[photoUrl]] },
  });
}

// Update current_status 
async function updatePropertyStatus(rowId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const sheets   = getSheetsClient();
  const sheetRow = rowId + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range:         `${SHEET_NAME}!E${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody:   { values: [[newStatus]] },
  });
}

module.exports = {
  getPropertiesByCustomerCode,
  getAllProperties,
  updatePhotoUrl,
  updatePropertyStatus,
  VALID_STATUSES,
};