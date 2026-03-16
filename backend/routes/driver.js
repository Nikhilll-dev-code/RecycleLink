const router        = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const Driver        = require('../models/Driver');
const PickupRequest = require('../models/PickupRequest');
const Reward        = require('../models/Reward');
const Route         = require('../models/Route');

const RATE = PickupRequest.REWARD_RATE;

// ─── GET /api/driver/routes ── today's optimised route + pickup list ─────────
router.get('/routes', authenticate, authorize('Driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's Route document (if admin has created one)
    const route = await Route.findOne({
      driverId: driver._id,
      date:     { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    // Always attach today's active pickups regardless of whether a Route doc exists
    const pickups = await PickupRequest
      .find({
        driverId:   driver._id,
        status:     { $nin: ['Completed', 'Cancelled'] },
        pickupTime: { $gte: startOfDay, $lte: endOfDay },
      })
      .sort({ pickupTime: 1 })
      .lean();

    if (!route) {
      return res.json({ pickups, message: 'No route assigned for today' });
    }

    res.json({ ...route, pickups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/driver/verify ── QR scan + weight entry at household ──────────
router.post('/verify', authenticate, authorize('Driver'), async (req, res) => {
  const { qrCode, actualWeight } = req.body;

  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

    // Find the pickup that matches this QR AND is assigned to this driver
    const pickup = await PickupRequest.findOne({
      qrCode,
      driverId: driver._id,
    });
    if (!pickup) {
      return res.status(404).json({ error: 'QR code not found or not assigned to you' });
    }

    // Mark completed and record actual weight
    pickup.status       = 'Completed';
    pickup.actualWeight = actualWeight;
    await pickup.save();

    // Calculate and persist reward
    const rate    = RATE[pickup.wasteCategory] || 5;
    const points  = Math.round(actualWeight * rate);
    const payment = parseFloat((actualWeight * rate * 0.1).toFixed(2));

    await Reward.create({
      userId:        pickup.userId,
      pickupId:      pickup._id,
      points,
      paymentAmount: payment,
      description:   `Verified pickup: ${pickup.wasteCategory} ${actualWeight}kg`,
    });

    res.json({ pickup, reward: { points, payment } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
