import Joi from 'joi';
import { USER_TYPES } from '../models/User.js';

const registerValidation = Joi.object({
  username: Joi.string().required().min(6).max(255),
  email: Joi.string()
    .required()
    .min(6)
    .max(255)
    .email({ minDomainSegments: 2 }),
  password: Joi.string().required().min(6),
  type: Joi.string()
    .required()
    .valid(...USER_TYPES),
  retypedPassword: Joi.string().required().min(6),
});

const loginValidation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const validateRegister = (data) => registerValidation.validate(data);
export const validateLogin = (data) => loginValidation.validate(data);
