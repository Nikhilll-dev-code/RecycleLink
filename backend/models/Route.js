const { Schema, model } = require('mongoose');

const routeSchema = new Schema(
  {
    driverId:        { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    date:            { type: Date, required: true },
    // Ordered array of pickupRequest ObjectIds representing the optimised sequence
    pickupSequence:  [{ type: Schema.Types.ObjectId, ref: 'PickupRequest' }],
    status:          { type: String, enum: ['Pending', 'Active', 'Completed'], default: 'Pending' },
    totalDistanceKm: { type: Number },
    fuelSavedPct:    { type: Number },
  },
  { timestamps: true }
);

module.exports = model('Route', routeSchema);
