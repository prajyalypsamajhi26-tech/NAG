const express = require('express');
const router  = express.Router();
const { execLinksDb } = require('../models/Database');
const smsGateway = require('../models/SMSGateway');

// Generate a random 8-char alphanumeric ID
function shortId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() +
         Math.random().toString(36).slice(2, 6).toUpperCase();
}

// POST /api/exec-links  — store payload, return short ID
router.post('/', (req, res) => {
  try {
    const { payload, execPhone, customerName } = req.body;
    if (!payload) return res.status(400).json({ error: 'payload required' });

    const id = shortId();
    const record = execLinksDb.add({ shortId: id, payload, createdAt: new Date() });

    const base    = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const link    = `${base}/exec/${id}`;
    const otpLine = payload.otp ? `\nOTP: ${payload.otp}` : '';
    const name    = customerName ? ` for ${customerName}` : '';

    // Auto-send SMS if exec phone provided
    if (execPhone) {
      const msg = `DoorPilot Delivery Guide${name}:\n${link}${otpLine}\nStep-by-step navigation to customer's door.`;
      smsGateway.sendSMS(execPhone, msg).catch(e => console.error('SMS error:', e));
    }

    res.json({ success: true, shortId: id, link });
  } catch (err) {
    console.error('exec-links POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exec-links/:id  — fetch payload by short ID
router.get('/:id', (req, res) => {
  const record = execLinksDb.findAll().find(r => r.shortId === req.params.id);
  if (!record) return res.status(404).json({ error: 'Link not found or expired' });

  // Check expiry
  if (record.payload.exp && Date.now() > record.payload.exp) {
    return res.status(410).json({ error: 'Link expired' });
  }

  res.json({ success: true, payload: record.payload });
});

module.exports = router;
