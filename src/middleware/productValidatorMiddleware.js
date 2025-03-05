const { body, validationResult } = require('express-validator');

const validateProduct = [
    body('name').isString().isLength({ min: 3, max: 255 })
    .withMessage('Name must be between 3 and 255 characters'),

    body('category').isString().isLength({ min: 3, max: 100 })
    .withMessage('Category must be between 3 and 100 characters'),

    body('description').isString().isLength({ min: 3 })
    .withMessage('Description must be at least 3 characters'),

    body('price').isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0.01'),

    body('stockCount').isInt({ min: 0 })
    .withMessage('Stock count must be an integer greater than or equal to 0'),

    body('brand').isString().isLength({ min: 3, max: 100 })
    .withMessage('Brand must be between 3 and 100 characters'),

    body('imageUrl').isString().isLength({ min: 10 })
    .withMessage('Image URL must be at least 10 characters'),

    body('isAvailable').isBoolean()
    .withMessage('Is available must be a boolean value')
];

const productValidatorMiddleware = [
    ...validateProduct,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = productValidatorMiddleware;