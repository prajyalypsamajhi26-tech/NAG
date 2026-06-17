// ==================== SMS Gateway ====================
// Supports: Fast2SMS (India), Twilio, TextBelt, or simulated

class SMSGateway {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'simulated';
  }

  async sendSMS(phoneNumber, message) {
    console.log(`[SMS] → ${phoneNumber}: ${message}`);
    try {
      if (this.provider === 'fast2sms') return await this._sendViaFast2SMS(phoneNumber, message);
      if (this.provider === 'twilio')   return await this._sendViaTwilio(phoneNumber, message);
      if (this.provider === 'textbelt') return await this._sendViaTextBelt(phoneNumber, message);
      return await this._simulate(phoneNumber, message);
    } catch (err) {
      console.error('[SMS] Send failed:', err.message);
      return await this._simulate(phoneNumber, message);
    }
  }

  // ── Fast2SMS (India) ─────────────────────────────────────────────────────
  // Sign up free at https://www.fast2sms.com — get API key from Dashboard
  // Add to .env:  SMS_PROVIDER=fast2sms  FAST2SMS_API_KEY=your_key_here
  async _sendViaFast2SMS(phoneNumber, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey || apiKey === 'your_fast2sms_api_key_here') {
      console.warn('[Fast2SMS] API key not set — falling back to simulation');
      return this._simulate(phoneNumber, message);
    }

    // Strip country code — Fast2SMS needs 10-digit Indian numbers
    const num = String(phoneNumber).replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',          // quick/transactional route
        message,
        language: 'english',
        flash: 0,
        numbers: num,
      }),
    });

    const data = await res.json();
    if (data.return) {
      console.log(`[Fast2SMS] Sent! request_id: ${data.request_id}`);
      return { success: true, provider: 'fast2sms', messageId: data.request_id };
    } else {
      console.error('[Fast2SMS] Failed:', data.message);
      return this._simulate(phoneNumber, message);
    }
  }

  async _sendViaTextBelt(phoneNumber, message) {
    console.log(`[SMS] Sending real SMS via TextBelt to ${phoneNumber}...`);
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        key: 'textbelt', // Free tier key (1 free message per day per IP)
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log(`[TextBelt] Success! Message ID: ${data.textId}`);
      return { success: true, provider: 'textbelt', messageId: data.textId };
    } else {
      console.error(`[TextBelt] Failed: ${data.error}`);
      return this._simulate(phoneNumber, message);
    }
  }

  async _sendViaTwilio(phoneNumber, message) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || sid === 'your_account_sid' || sid === 'your_twilio_account_sid_here') {
      console.warn('[SMS] Twilio credentials not set — falling back to simulation');
      return this._simulate(phoneNumber, message);
    }

    let twilio;
    try {
      twilio = require('twilio');
    } catch {
      console.warn('[SMS] twilio package not installed — run: npm install twilio');
      return this._simulate(phoneNumber, message);
    }

    const client = twilio(sid, token);
    const result = await client.messages.create({
      body: message,
      from,
      to: phoneNumber
    });

    console.log(`[Twilio] Message SID: ${result.sid}`);
    return { success: true, provider: 'twilio', messageId: result.sid };
  }

  async makeCall(phoneNumber, message) {
    console.log(`[CALL] → ${phoneNumber}: ${message}`);
    
    if (this.provider !== 'twilio') {
      console.log(`[CALL] Skipped. Voice calls require Twilio. Current provider: ${this.provider}`);
      return { success: false, reason: 'Requires Twilio' };
    }

    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || sid === 'your_twilio_account_sid_here') return { success: false };

    let twilio;
    try { twilio = require('twilio'); } catch { return { success: false }; }

    try {
      const client = twilio(sid, token);
      // Create simple TwiML for text-to-speech
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say({ voice: 'alice' }, message);

      const call = await client.calls.create({
        twiml: twiml.toString(),
        to: phoneNumber,
        from: from
      });
      console.log(`[Twilio Call] Call SID: ${call.sid}`);
      return { success: true, callId: call.sid };
    } catch (err) {
      console.error('[Twilio Call] Failed:', err.message);
      return { success: false };
    }
  }

  async _simulate(phoneNumber, message) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📱 SIMULATED SMS`);
    console.log(`   To:      ${phoneNumber}`);
    console.log(`   Message: ${message}`);
    console.log(`${'─'.repeat(50)}\n`);
    return { success: true, provider: 'simulated', phoneNumber, message };
  }
}

module.exports = new SMSGateway();
