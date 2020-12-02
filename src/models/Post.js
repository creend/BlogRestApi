import mongoose from 'mongoose';
import { USER_TYPES } from './User.js';

const PostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  userType: {
    enum: USER_TYPES,
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  edited: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Post', PostSchema);
