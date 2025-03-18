const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const productValidatorMiddleware = require('../middleware/productValidatorMiddleware');

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

router.post('/', productValidatorMiddleware, productController.createProduct);

router.put('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

module.exports = router;