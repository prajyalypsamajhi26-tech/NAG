const { ordersDb, trackingDb } = require('../models/Database');
const smsGateway = require('../models/SMSGateway');

// POST /api/delivery/near-me
exports.sendNearMeNotification = async (req, res) => {
  try {
    const { orderId, deliveryExecutiveId } = req.body;
    const order = ordersDb.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const msg = `DoorPilot 🛵: Your delivery partner is almost at your door! Please be ready.`;
    try { await smsGateway.sendSMS(order.customerPhone, msg); } catch {}
    try { await smsGateway.makeCall(order.customerPhone, msg); } catch {}

    trackingDb.add({ orderId, deliveryExecutiveId, event: 'near_me', timestamp: new Date() });

    if (req.io) {
      req.io.to(`order-${orderId}`).emit('delivery-near', { orderId, message: msg });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('sendNearMeNotification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// POST /api/delivery/wrong-door
exports.sendWrongDoorNotification = async (req, res) => {
  try {
    const { orderId, deliveryExecutiveId } = req.body;
    const order = ordersDb.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const msg = `DoorPilot 🛵: Your delivery partner is at the wrong location. Please re-share your exact location or call them.`;
    try { await smsGateway.sendSMS(order.customerPhone, msg); } catch {}
    try { await smsGateway.makeCall(order.customerPhone, msg); } catch {}

    trackingDb.add({ orderId, deliveryExecutiveId, event: 'wrong_door', timestamp: new Date() });

    if (req.io) {
      req.io.to(`order-${orderId}`).emit('delivery-wrong-door', { orderId, message: msg });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('sendWrongDoorNotification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// POST /api/delivery/update-location
exports.updateLocation = (req, res) => {
  try {
    const { orderId, deliveryExecutiveId, latitude, longitude } = req.body;

    const tracking = trackingDb.add({
      orderId, deliveryExecutiveId,
      event: 'location_update',
      latitude, longitude,
      timestamp: new Date()
    });

    if (req.io) {
      req.io.to(`order-${orderId}`).emit('delivery-location-update', {
        orderId, deliveryExecutiveId, latitude, longitude, timestamp: new Date()
      });
    }

    res.json({ success: true, tracking });
  } catch (err) {
    console.error('updateLocation error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// GET /api/delivery/tracking/:orderId
exports.getTrackingHistory = (req, res) => {
  const history = trackingDb.findAll().filter(t => t.orderId === req.params.orderId);
  res.json(history);
};
