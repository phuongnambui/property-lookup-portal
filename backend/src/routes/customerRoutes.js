// routes/customerRoutes.js
// Replaces old CSV-based customer lookup.
// GET /api/customer/:code  →  returns customer + their properties from Google Sheets.

const express = require('express');
const router  = express.Router();
const { getPropertiesByCustomerCode } = require('../services/sheetsService');

router.get('/:code', async (req, res) => {
  const code = req.params.code.trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ error: 'Customer code is required.' });
  }

  try {
    const data = await getPropertiesByCustomerCode(code);

    if (!data) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    res.json(data);
  } catch (err) {
    console.error('Customer lookup error:', err.message);
    res.status(500).json({ error: 'Failed to fetch data. Please try again.' });
  }
});

module.exports = router;