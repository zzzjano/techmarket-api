const { body, validationResult } = require('express-validator');

const validateUser = [
    body('email').isEmail().optional()
    .withMessage('Email must be a valid email address'),

    body('password').isString().isLength({ min: 8 }).optional()
    .withMessage('Password must be at least 8 characters'),

    body('firstName').isString().isLength({ min: 3, max: 100 }).optional()
    .withMessage('First name must be between 3 and 100 characters'),

    body('lastName').isString().isLength({ min: 3, max: 100 }).optional()
    .withMessage('Last name must be between 3 and 100 characters'),
];

const userValidatorMiddleware = [
    ...validateUser,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = userValidatorMiddleware;