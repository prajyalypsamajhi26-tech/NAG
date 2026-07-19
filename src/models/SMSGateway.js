// ==================== SMS Gateway ====================
// Supports: Twilio (real), or simulated (console log)

class SMSGateway {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'simulated';
  }

  async sendSMS(phoneNumber, message) {
    const provider = (process.env.SMS_PROVIDER || this.provider || 'simulated').toLowerCase();
    console.log(`[SMS] (${provider}) → ${phoneNumber}: ${message}`);

    try {
      if (provider === 'fast2sms') {
        return await this._sendViaFast2SMS(phoneNumber, message);
      } else if (provider === 'twilio') {
        return await this._sendViaTwilio(phoneNumber, message);
      } else if (provider === 'textbelt') {
        return await this._sendViaTextBelt(phoneNumber, message);
      }
      return await this._simulate(phoneNumber, message);
    } catch (err) {
      console.error('[SMS] Send failed:', err.message);
      return await this._simulate(phoneNumber, message);
    }
  }


  async _sendViaFast2SMS(phoneNumber, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.warn('[SMS] FAST2SMS_API_KEY missing — falling back to simulation');
      return this._simulate(phoneNumber, message);
    }

    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      console.error(`[Fast2SMS] Invalid phone number provided: ${phoneNumber}`);
      return { success: false, provider: 'fast2sms', error: 'Invalid 10-digit mobile number' };
    }

    console.log(`[Fast2SMS] Sending real SMS to ${cleanedPhone}...`);

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanedPhone
        })
      });

      const data = await response.json();
      if (data && (data.return === true || data.status_code === 200)) {
        console.log(`[Fast2SMS] Success! Message sent:`, data.message || data.request_id);
        return { success: true, provider: 'fast2sms', data };
      } else {
        console.error(`[Fast2SMS] Error response:`, data);
        return { success: false, provider: 'fast2sms', error: data.message || 'Fast2SMS returned error', data };
      }
    } catch (err) {
      console.error('[Fast2SMS] Request failed:', err.message);
      return { success: false, provider: 'fast2sms', error: err.message };
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
