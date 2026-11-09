const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { SELF_REGISTERABLE_ROLES } = require('../constants/roles');
const { AUDIT_EVENTS, AUDIT_OUTCOMES } = require('../constants/auditEvents');

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

const passwordRules = (field) => body(field).isString()
  .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.')
  .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
  .matches(/[0-9]/).withMessage('Password must contain a number.');

const forgotPasswordValidation = [
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.').normalizeEmail(),
  handleValidation,
];

const resetPasswordValidation = [
  // The token is 32 random bytes in hex, so anything else can be rejected before touching the database.
  body('token').isString().matches(/^[a-f0-9]{64}$/).withMessage('Reset link is invalid or has expired.'),
  passwordRules('password'),
  handleValidation,
];

const createGigValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.')
    .isLength({ max: 120 }).withMessage('Title must be under 120 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.')
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be under 50 characters.'),
  handleValidation,
];

const updateGigValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Title must be under 120 characters.'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be under 2000 characters.'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be under 50 characters.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false.'),
  handleValidation,
];

const bookingValidation = [
  body('gigId').isMongoId().withMessage('A valid gig id is required.'),
  handleValidation,
];

const mongoIdParamValidation = [
  param('id').isMongoId().withMessage('A valid id is required.'),
  handleValidation,
];

// Whitelists every query value so nothing user-controlled can reach the database filter.
const auditQueryValidation = [
  query('event').optional().isString().isIn(Object.values(AUDIT_EVENTS)).withMessage('Unknown event filter.'),
  query('outcome').optional().isString().isIn(AUDIT_OUTCOMES).withMessage('Unknown outcome filter.'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1 and 200.'),
  handleValidation,
];

module.exports = {
  auditQueryValidation,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  createGigValidation,
  updateGigValidation,
  bookingValidation,
  mongoIdParamValidation,
};