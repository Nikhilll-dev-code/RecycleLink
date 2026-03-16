const router        = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const Driver        = require('../models/Driver');
const PickupRequest = require('../models/PickupRequest');
const Reward        = require('../models/Reward');

// ─── GET /api/admin/fleet ── live vehicle locations + per-driver stats ────────
router.get('/fleet', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Populate userId so we get user name/phone without a separate query
    const drivers = await Driver.find()
      .populate('userId', 'name phone')
      .lean();

    // For each driver, count active and today-completed pickups in one aggregation
    const driverIds = drivers.map((d) => d._id);

    const pickupStats = await PickupRequest.aggregate([
      { $match: { driverId: { $in: driverIds } } },
      {
        $group: {
          _id: '$driverId',
          activePickups: {
            $sum: {
              $cond: [{ $in: ['$status', ['Pending', 'Assigned', 'In Transit']] }, 1, 0],
            },
          },
          completedToday: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'Completed'] },
                    { $gte: ['$updatedAt', startOfDay] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Index stats by driverId string for O(1) merge
    const statsMap = {};
    for (const s of pickupStats) statsMap[s._id.toString()] = s;

    const fleet = drivers.map((d) => {
      const stats = statsMap[d._id.toString()] || { activePickups: 0, completedToday: 0 };
      return {
        id:             d._id,
        name:           d.userId?.name,
        phone:          d.userId?.phone,
        status:         d.status,
        currentLat:     d.currentLat,
        currentLng:     d.currentLng,
        vehicle:        d.vehicle,
        activePickups:  stats.activePickups,
        completedToday: stats.completedToday,
        updatedAt:      d.updatedAt,
      };
    });

    res.json(fleet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/analytics ── EPR metrics for the last 30 days ─────────────
router.get('/analytics', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // ── 1. 30-day summary ────────────────────────────────────────────────────
    const [summaryRaw] = await PickupRequest.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: {
              $cond: [{ $in: ['$status', ['Assigned', 'In Transit']] }, 1, 0],
            },
          },
          totalWeightKg: { $sum: { $ifNull: ['$actualWeight', 0] } },
          divertedKg: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                { $ifNull: ['$actualWeight', 0] },
                0,
              ],
            },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const summary = summaryRaw || {
      totalRequests: 0, completed: 0, pending: 0,
      inProgress: 0, totalWeightKg: 0, divertedKg: 0,
    };

    // ── 2. Breakdown by waste category (completed only) ───────────────────────
    const byCategoryRaw = await PickupRequest.aggregate([
      {
        $match: {
          status:    'Completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id:      '$wasteCategory',
          requests: { $sum: 1 },
          weightKg: { $sum: { $ifNull: ['$actualWeight', 0] } },
        },
      },
      { $sort: { weightKg: -1 } },
      { $project: { _id: 0, wasteCategory: '$_id', requests: 1, weightKg: 1 } },
    ]);

    // ── 3. Daily trend for the last 14 days ───────────────────────────────────
    const trendRaw = await PickupRequest.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          requests: { $sum: 1 },
          weightKg: { $sum: { $ifNull: ['$actualWeight', 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', requests: 1, weightKg: 1 } },
    ]);

    // ── 4. 20 most recent pickups with resident name ───────────────────────────
    const recentPickups = await PickupRequest.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name')
      .lean();

    const recentFormatted = recentPickups.map((p) => ({
      id:           p._id,
      wasteCategory:p.wasteCategory,
      status:       p.status,
      actualWeight: p.actualWeight,
      createdAt:    p.createdAt,
      resident:     p.userId?.name,
    }));

    // ── 5. Compliance / completion rate ───────────────────────────────────────
    const complianceRate =
      summary.totalRequests > 0
        ? parseFloat(((summary.completed / summary.totalRequests) * 100).toFixed(1))
        : 0;

    res.json({
      summary,
      byCategory:    byCategoryRaw,
      trend:         trendRaw,
      recentPickups: recentFormatted,
      complianceRate,
      generatedAt:   new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/assign ── assign a driver to a pickup ───────────────────
router.post('/assign', authenticate, authorize('Admin'), async (req, res) => {
  const { pickupId, driverId } = req.body;
  try {
    const pickup = await PickupRequest.findByIdAndUpdate(
      pickupId,
      { driverId, status: 'Assigned' },
      { new: true }
    );
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
