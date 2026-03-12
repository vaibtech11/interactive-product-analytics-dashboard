import { body } from 'express-validator';

/*
-------------------------------------
Registration Validation
-------------------------------------
*/
export const registerValidation = [

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .toInt()
    .withMessage('Invalid age. Must be between 13 and 120'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other')

];


/*
-------------------------------------
Login Validation
-------------------------------------
*/
export const loginValidation = [

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')

];


/*
-------------------------------------
Legacy Validators (optional helpers)
-------------------------------------
*/

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateEventData = (data) => {
  return data && data.event_name && data.event_type;
};