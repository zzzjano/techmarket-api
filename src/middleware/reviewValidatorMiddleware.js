const { body, validationResult } = require('express-validator');

const validateReview = [
    body('rating').isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

    body('comment').isString().isLength({ min: 3 })
    .withMessage('Comment must be at least 3 characters')
];

const reviewValidatorMiddleware = [
    ...validateReview,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = reviewValidatorMiddleware;