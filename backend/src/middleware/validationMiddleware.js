const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { SELF_REGISTERABLE_ROLES } = require('../constants/roles');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(' ');
    throw new AppError(message, 400);
  }
  next();
}

const registerValidation = [
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.').normalizeEmail(),
  body('password').isString()
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),
  body('role').optional().isIn(SELF_REGISTERABLE_ROLES)
    .withMessage('Role must be either "client" or "freelancer" (admin accounts are provisioned separately).'),
  handleValidation,
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  handleValidation,
];

module.exports = { registerValidation, loginValidation };