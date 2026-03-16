const router        = require('express').Router();
const mongoose      = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');
const Driver        = require('../models/Driver');
const Reward        = require('../models/Reward');

const RATE = PickupRequest.REWARD_RATE;

// Helper: generate a short unique QR code string
const genQR = () =>
  'RL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

// ─── POST /api/pickups ── resident submits new request ───────────────────────
router.post('/', authenticate, authorize('Resident'), async (req, res) => {
  const {
    wasteCategory, pickupTime, locationLat, locationLng,
    address, imageUrl, estimatedWeight, notes,
  } = req.body;

  try {
    const pickup = await PickupRequest.create({
      userId: req.user.id,
      wasteCategory,
      pickupTime,
      locationLat,
      locationLng,
      address,
      imageUrl,
      estimatedWeight,
      notes,
      qrCode: genQR(),
    });
    res.status(201).json(pickup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/pickups/user ── resident views history + rewards ───────────────
router.get('/user', authenticate, authorize('Resident'), async (req, res) => {
  try {
    // Fetch pickups and their associated rewards in parallel
    const pickups = await PickupRequest
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const pickupIds = pickups.map((p) => p._id);
    const rewards   = await Reward.find({ pickupId: { $in: pickupIds } }).lean();

    // Map rewardsByPickupId for O(1) lookup
    const rewardMap = {};
    for (const r of rewards) rewardMap[r.pickupId.toString()] = r;

    const result = pickups.map((p) => ({
      ...p,
      reward: rewardMap[p._id.toString()] || null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/pickups/driver ── driver views today's assigned pickups ────────
router.get('/driver', authenticate, authorize('Driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const pickups = await PickupRequest
      .find({
        driverId:   driver._id,
        status:     { $nin: ['Completed', 'Cancelled'] },
        pickupTime: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('userId', 'name phone')   // replaces JOIN users
      .sort({ pickupTime: 1 })
      .lean();

    // Rename populated field to match original API shape
    const result = pickups.map(({ userId: resident, ...rest }) => ({
      ...rest,
      residentName:  resident?.name,
      residentPhone: resident?.phone,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/pickups/status ── update request status ────────────────────────
router.put('/status', authenticate, async (req, res) => {
  const { pickupId, status, actualWeight } = req.body;

  const ALLOWED = ['Pending', 'Assigned', 'In Transit', 'Completed', 'Cancelled'];
  if (!ALLOWED.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const update = { status };
    if (actualWeight != null) update.actualWeight = actualWeight;

    const pickup = await PickupRequest.findByIdAndUpdate(
      pickupId,
      update,
      { new: true }  // return the updated document
    );
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });

    // Auto-create reward when a pickup is marked Completed with a weight
    if (status === 'Completed' && pickup.actualWeight) {
      const rate    = RATE[pickup.wasteCategory] || 5;
      const points  = Math.round(pickup.actualWeight * rate);
      const payment = parseFloat((pickup.actualWeight * rate * 0.1).toFixed(2));

      await Reward.create({
        userId:        pickup.userId,
        pickupId:      pickup._id,
        points,
        paymentAmount: payment,
        description:   `${pickup.wasteCategory} pickup — ${pickup.actualWeight}kg`,
      });
    }

    res.json(pickup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
