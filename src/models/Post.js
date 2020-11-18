import mongoose from 'mongoose';
import mongooseURLSlugs from 'mongoose-url-slugs';
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
  date: {
    type: Date,
    default: Date.now(),
  },
  edited: {
    type: Boolean,
    default: false,
  },
});

PostSchema.plugin(mongooseURLSlugs('title', { field: 'slug', update: true }));

export default mongoose.model('Post', PostSchema);
