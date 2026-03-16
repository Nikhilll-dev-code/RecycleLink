const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:   { type: String, trim: true },
    password:{ type: String, required: true },
    role:    { type: String, enum: ['Resident', 'Driver', 'Admin'], required: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

// Never return password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = model('User', userSchema);
