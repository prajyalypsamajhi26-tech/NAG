const express = require('express');
const router = express.Router();

const smsGateway = require('../models/SMSGateway');

// POST /api/sms/send-test - Test endpoint to verify SMS sending
router.post('/send-test', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'phone is required' });
  }
  const result = await smsGateway.sendSMS(phone, message || 'Test message from DoorPilot');
  res.json(result);
});

// SMS webhook (for receiving SMS from providers)
router.post('/webhook', (req, res) => {
  console.log('SMS webhook received:', req.body);
  res.json({ success: true });
});

module.exports = router;
