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

// ─── Sheet columns ────────────────────────────────────────────────
//  A: customer_code
//  B: company_name
//  C: address
//  D: service_type
//  E: current_status
//  F: submission_date
//  G: has_deficiency       TRUE or empty
//  H: deficiency_photo_url
//  I: attempt_number

const DATA_RANGE = `${SHEET_NAME}!A2:I`;

// Canonical status names — these are what get stored in the sheet
const VALID_STATUSES = [
  'Request Received',
  'Processing',
  'Submitted to City',
  'Passed',
  'Failed',
];

// Normalise whatever the brother types into canonical form
function normaliseStatus(raw) {
  if (!raw) return '';
  const lower = raw.trim().toLowerCase();
  const match = VALID_STATUSES.find((s) => s.toLowerCase() === lower);
  return match || raw.trim(); // return original if no match (don't silently drop)
}

function parseRow(row, rowIndex) {
  const [
    customer_code        = '',
    company_name         = '',
    address              = '',
    service_type         = '',
    current_status_raw   = '',
    submission_date      = '',
    has_deficiency_raw   = '',
    deficiency_photo_url = '',
    attempt_number_raw   = '1',
  ] = row;

  const current_status = normaliseStatus(current_status_raw);

  // has_deficiency: TRUE (any case) = true, anything else (empty, FALSE, etc.) = false
  const has_deficiency = has_deficiency_raw?.toString().toUpperCase() === 'TRUE';

  // If passed, never show deficiency regardless of sheet value
  const isPassed = current_status.toLowerCase() === 'passed';

  return {
    id:                   rowIndex,
    customer_code:        customer_code.trim(),
    company_name:         company_name.trim(),
    address:              address.trim(),
    service_type:         service_type.trim(),
    current_status,
    submission_date:      submission_date.trim(),
    has_deficiency:       isPassed ? false : has_deficiency,
    deficiency_photo_url: isPassed ? '' : deficiency_photo_url.trim(),
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

// Update current_status — column E, normalise before writing
async function updatePropertyStatus(rowId, newStatus) {
  const canonical = normaliseStatus(newStatus);
  if (!VALID_STATUSES.map(s => s.toLowerCase()).includes(canonical.toLowerCase())) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const sheets   = getSheetsClient();
  const sheetRow = rowId + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range:         `${SHEET_NAME}!E${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody:   { values: [[canonical]] },
  });

  // If passed, auto-clear has_deficiency and photo URL in the Sheet
  if (canonical.toLowerCase() === 'passed') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range:         `${SHEET_NAME}!G${sheetRow}:H${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody:   { values: [['' , '']] },
    });
  }
}

module.exports = {
  getPropertiesByCustomerCode,
  getAllProperties,
  updatePhotoUrl,
  updatePropertyStatus,
  VALID_STATUSES,
};