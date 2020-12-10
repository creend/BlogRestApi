import Joi from 'joi';
import { USER_TYPES } from '../models/User.js';

const registerValidation = Joi.object({
  email: Joi.string()
    .required()
    .min(6)
    .max(255)
    .email({ minDomainSegments: 2 }),
  username: Joi.string().required().min(6).max(255),
  password: Joi.string().required().min(6),
  retypedPassword: Joi.string().required().min(6),
  type: Joi.string()
    .required()
    .valid(...USER_TYPES),
  date: Joi.string(),
});

const loginValidation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const validateRegister = (data) => registerValidation.validate(data);
export const validateLogin = (data) => loginValidation.validate(data);
