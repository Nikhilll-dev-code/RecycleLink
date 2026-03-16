const { Schema, model } = require('mongoose');

// Vehicle is embedded inside Driver — no separate collection needed
const vehicleSchema = new Schema(
  {
    vehicleType:  { type: String, trim: true },
    capacity:     { type: Number },           // max weight in kg
    licensePlate: { type: String, trim: true },
  },
  { _id: false }                              // embedded, no own _id
);

const driverSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, trim: true },
    status:        { type: String, enum: ['Active', 'Inactive', 'On Route'], default: 'Inactive' },
    vehicle:       { type: vehicleSchema, default: () => ({}) },
    currentLat:    { type: Number },
    currentLng:    { type: Number },
  },
  { timestamps: true }
);

module.exports = model('Driver', driverSchema);
