import mongoose from 'mongoose';

export const USER_TYPES = ['admin', 'moderator', 'normal'];

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  type: {
    type: String,
    enum: USER_TYPES,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('User', UserSchema);
