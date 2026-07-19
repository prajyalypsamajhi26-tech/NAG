const dotenv = require('dotenv');
dotenv.config(); // Fast2SMS Integration Active

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const os         = require('os');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

// ── Auto-detect LAN IP and set BASE_URL ─────────────────────────────────────
function getLanIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
const LAN_IP = getLanIP();
// Always use LAN IP if a BASE_URL isn't provided in .env
process.env.BASE_URL = process.env.BASE_URL || `http://${LAN_IP}:${PORT}`;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// No-cache for HTML/JS/CSS so changes are always picked up
app.use((req, res, next) => {
  if (req.path === '/' || /\.(html|js|css)$/.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/orders',      require('./src/routes/orders'));
app.use('/api/delivery',    require('./src/routes/delivery'));
app.use('/api/upload',      require('./src/routes/uploads'));
app.use('/api/sms',         require('./src/routes/sms'));
app.use('/api/exec-links',  require('./src/routes/execLinks'));

// ── Geocoding (Nominatim — free, no key needed) ──────────────────────────────
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'DoorPilot/1.0' } }
    );
    const d = await r.json();
    if (d && d.length > 0) {
      res.json({ success: true, lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon), formatted: d[0].display_name });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (e) { res.status(500).json({ error: 'Geocoding failed' }); }
});

// ── Location search (proxied through server to avoid CORS) ───────────────────
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q required' });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&countrycodes=in`,
      { headers: { 'User-Agent': 'DoorPilot/1.0 (doorpilot@example.com)', 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    res.json(d);
  } catch (e) { res.status(500).json({ error: 'Search failed' }); }
});

app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'DoorPilot/1.0' } }
    );
    const d = await r.json();
    if (d && d.display_name) {
      res.json({ success: true, address: d.display_name });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (e) { res.status(500).json({ error: 'Reverse geocoding failed' }); }
});

// ── Delivery page routes ─────────────────────────────────────────────────────
// /exec/:id — serves exec.html for the delivery executive (short link)
app.get('/exec/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exec.html'));
});

// /delivery/:orderId  — serves delivery.html for the delivery executive
// Supports both:
//   /delivery/<orderId>?token=<findMeToken>   (from SMS link)
//   /delivery/<orderId>                        (direct)
app.get('/delivery/:orderId', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'delivery.html'));
});

// /find-me/:token — legacy redirect → delivery.html via token lookup
app.get('/find-me/:token', (req, res) => {
  const { ordersDb } = require('./src/models/Database');
  const order = ordersDb.findAll().find(o => o.findMeToken === req.params.token);
  if (!order) return res.status(404).send('Delivery link not found or expired.');
  res.redirect(`/delivery/${order.id}?token=${req.params.token}`);
});

// ── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('track-delivery', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} tracking order ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 DoorPilot is running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${LAN_IP}:${PORT}  ← share with your mate`);
  console.log(`   BASE_URL: ${process.env.BASE_URL}`);
  console.log(`\n📦 SMS provider: ${process.env.SMS_PROVIDER || 'simulated'}`);
  console.log(`🗺️  Geocoding: Nominatim (free)`);
  console.log(`📡 Routes: /api/orders  /api/delivery  /api/upload  /api/sms\n`);
});
