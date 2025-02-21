// server/models/Hospital.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: (v) => /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    password: { type: String, required: true, minlength: 8 },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, default: [0, 0] } // [longitude, latitude]
    },
    bedsAvailable: { type: Number, required: true, default: 0 },
    oxygenCylinders: { type: Number, required: true, default: 0 },
  },
  { strict: true, versionKey: false }
);

hospitalSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

hospitalSchema.index({ email: 1, city: 1 });
hospitalSchema.index({ location: '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
