const { Schema, model } = require('mongoose');

const rewardSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pickupId:      { type: Schema.Types.ObjectId, ref: 'PickupRequest' },
    points:        { type: Number, required: true, default: 0 },
    paymentAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['UPI', 'Bank Transfer', 'Eco-Points', null], default: null },
    description:   { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = model('Reward', rewardSchema);
