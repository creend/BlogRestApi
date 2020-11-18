import Joi from 'joi';
import { USER_TYPES } from '../models/User.js';

const postValidation = Joi.object({
  author: Joi.string().required().min(6),
  userType: Joi.string()
    .required()
    .valid(...USER_TYPES),
  title: Joi.string().required().min(1),
  content: Joi.string().required().min(1),
  date: Joi.string(),
});

export const validatePost = (data) => postValidation.validate(data);
