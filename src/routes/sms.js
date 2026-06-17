const express    = require('express');
const router     = express.Router();
const smsGateway = require('../models/SMSGateway');

// POST /api/sms/send-exec-link
// Body: { execPhone, execLink, otp (optional), customerName }
router.post('/send-exec-link', async (req, res) => {
  const { execPhone, execLink, otp, customerName } = req.body;

  if (!execPhone || !execLink) {
    return res.status(400).json({ error: 'execPhone and execLink are required' });
  }

  const otpLine = otp ? `\nYour OTP: *${otp}*` : '';
  const name    = customerName ? ` for ${customerName}` : '';

  const message =
    `DoorPilot Delivery Guide${name}:\n${execLink}${otpLine}\n` +
    `Open this link for step-by-step navigation to the customer's door.`;

  try {
    const result = await smsGateway.sendSMS(execPhone, message);
    res.json({ success: true, result });
  } catch (err) {
    console.error('send-exec-link error:', err);
    res.status(500).json({ error: 'SMS send failed', details: err.message });
  }
});

// SMS webhook (for receiving SMS from providers)
router.post('/webhook', (req, res) => {
  console.log('SMS webhook received:', req.body);
  res.json({ success: true });
});

module.exports = router;
