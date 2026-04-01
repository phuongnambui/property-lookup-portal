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
//  G: job_number
//  H: deficiency_photo_url
//  I: deficiency_pdf_url

const DATA_RANGE = `${SHEET_NAME}!A2:I`;

// Canonical status names — these are what get stored in the sheet
const VALID_STATUSES = [
  'Request Received',
  'Processing',
  'Submitted to City',
  'Passed',
  'Failed',
  'Cancelled',
];

// Statuses that clear deficiency data — request is over, no action needed
const TERMINAL_STATUSES = ['passed', 'cancelled'];

// Normalise whatever the brother types into canonical form
function normaliseStatus(raw) {
  if (!raw) return '';
  const lower = raw.trim().toLowerCase();
  const match = VALID_STATUSES.find((s) => s.toLowerCase() === lower);
  return match || raw.trim();
}

function parseRow(row, rowIndex) {
  const [
    customer_code        = '',
    company_name         = '',
    address              = '',
    service_type         = '',
    current_status_raw   = '',
    submission_date      = '',
    job_number_raw       = '',
    deficiency_photo_url = '',
    deficiency_pdf_url   = '',
  ] = row;

  const current_status = normaliseStatus(current_status_raw);
  const isTerminal = TERMINAL_STATUSES.includes(current_status.toLowerCase());

  return {
    id:                   rowIndex,
    customer_code:        customer_code.trim(),
    company_name:         company_name.trim(),
    address:              address.trim(),
    service_type:         service_type.trim(),
    current_status,
    submission_date:      submission_date.trim(),
    job_number:           job_number_raw.trim(),
    deficiency_photo_url: isTerminal ? '' : deficiency_photo_url.trim(),
    deficiency_pdf_url:   isTerminal ? '' : deficiency_pdf_url.trim(),
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

// Update deficiency_pdf_url — column I
async function updatePdfUrl(rowId, pdfUrl) {
  const sheets   = getSheetsClient();
  const sheetRow = rowId + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range:         `${SHEET_NAME}!I${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody:   { values: [[pdfUrl]] },
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

  // For any terminal status, auto-clear photo and PDF URLs in the sheet
  if (TERMINAL_STATUSES.includes(canonical.toLowerCase())) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range:         `${SHEET_NAME}!H${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody:   { values: [['']] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range:         `${SHEET_NAME}!I${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody:   { values: [['']] },
    });
  }
}

// Update job_number — column G
async function updateJobNumber(rowId, jobNumber) {
  const sheets   = getSheetsClient();
  const sheetRow = rowId + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range:         `${SHEET_NAME}!G${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody:   { values: [[jobNumber]] },
  });
}

module.exports = {
  getPropertiesByCustomerCode,
  getAllProperties,
  updatePhotoUrl,
  updatePdfUrl,
  updatePropertyStatus,
  updateJobNumber,
  VALID_STATUSES,
};