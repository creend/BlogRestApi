import Joi from 'joi';
import { USER_TYPES } from '../models/User.js';

const postValidation = Joi.object({
  title: Joi.string().required().min(1),
  content: Joi.string().required().min(1),
  author: Joi.string().required().min(6),
  userType: Joi.string()
    .required()
    .valid(...USER_TYPES),
  createdAt: Joi.string(),
  edited: Joi.boolean(),
});

export const validatePost = (data) => postValidation.validate(data);
