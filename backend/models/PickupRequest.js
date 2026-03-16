const { Schema, model } = require('mongoose');

const REWARD_RATE = {
  'E-Waste': 50,
  'Metal':   30,
  'Plastic': 15,
  'Glass':   10,
  'Paper':    8,
  'Organic':  5,
  'Other':    5,
};

const pickupSchema = new Schema(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wasteCategory:   {
      type: String,
      enum: ['E-Waste', 'Metal', 'Plastic', 'Glass', 'Paper', 'Organic', 'Other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Transit', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    pickupTime:      { type: Date, required: true },

    // Flat lat/lng — no PostGIS or GeoJSON required
    locationLat:     { type: Number, required: true },
    locationLng:     { type: Number, required: true },

    address:         { type: String, trim: true },
    imageUrl:        { type: String, trim: true },
    estimatedWeight: { type: Number },
    actualWeight:    { type: Number },
    driverId:        { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
    qrCode:          { type: String, unique: true, sparse: true },
    notes:           { type: String, trim: true },
  },
  { timestamps: true }
);

// Expose reward rate map so routes can import it from one place
pickupSchema.statics.REWARD_RATE = REWARD_RATE;

module.exports = model('PickupRequest', pickupSchema);
