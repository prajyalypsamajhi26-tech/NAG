// ==================== Voice Recording Utilities ====================
class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks   = [];
    this.isRecording   = false;
    this.startTime     = null;
    this._stream       = null;
    this._stopPromise  = null;
    this._resolveStop  = null;
  }

  // Pick the best MIME type the browser supports
  _getBestMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  }

  async startRecording() {
    // Clean up any previous session first
    this._cleanup();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        '🎤 Microphone Access Info:\n\n' +
        'Browsers require localhost or HTTPS to use live microphone recording.\n\n' +
        '• On this computer: Open http://localhost:3000 to record live audio.\n' +
        '• On phone/LAN IP: Use the "📁 Upload audio file" option below to pick a voice note!'
      );
      return false;
    }

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
    } catch (err) {
      console.error('Mic access error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Microphone permission denied.\nClick the lock/settings icon in the address bar → Allow microphone.');
      } else {
        alert('Could not access microphone: ' + err.message);
      }
      return false;
    }

    try {
      this.mediaRecorder = new MediaRecorder(this._stream);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this._stream, { mimeType: 'audio/webm' });
    }

    this.audioChunks = [];
    this.startTime   = Date.now();
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    // Resolve the stop promise once all data is collected
    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      const usedType = (this.mediaRecorder && this.mediaRecorder.mimeType) || 'audio/webm';
      const blob = new Blob(this.audioChunks, { type: usedType });

      console.log(`[VoiceRecorder] Stopped. Chunks: ${this.audioChunks.length}, Blob size: ${blob.size} bytes`);
      this._stopStream();

      if (this._resolveStop) {
        this._resolveStop(blob);
        this._resolveStop = null;
      }
    };

    // Standard continuous recording (100% reliable on Android/iOS/Desktop)
    this.mediaRecorder.start();
    console.log('Recording started');
    return true;
  }

  // Returns Promise<Blob> — safe to await
  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) {
      return Promise.resolve(null);
    }

    this._stopPromise = new Promise((resolve) => {
      this._resolveStop = resolve;
    });

    try {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      } else {
        this._resolveStop && this._resolveStop(null);
      }
    } catch (e) {
      console.error('Error stopping recorder:', e);
      this._resolveStop && this._resolveStop(null);
    }

    return this._stopPromise;
  }

  _stopStream() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  }

  _cleanup() {
    this._stopStream();
    this.audioChunks  = [];
    this.startTime    = null;
    this._resolveStop = null;
    this._stopPromise = null;
    this.isRecording  = false;
    this.mediaRecorder = null;
  }

  getRecordingDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Call this only AFTER stopRecording() has resolved
  reset() {
    this.audioChunks = [];
  }
}

// Global instance
const voiceRecorder = new VoiceRecorder();

// Helper: format seconds as m:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
