let products = require('../data/products.js');
const Product = require('../models/productModel.js');

const getProducts = (req, res) => {
    res.status(200).json(products);
};

const getProductById = (req, res, next) => {
    const product = products.find((product) => product.id === parseInt(req.params.id));
    if (product) {
        res.status(200).json(product);
    } else {
        next(new Error('Product not found'));
    }
};

const createProduct = (req, res, next) => {
    try{
    const product = req.body;
    const newProduct = new Product(
        product.id,
        product.name,
        product.category,
        product.description,
        product.price,
        product.stockCount,
        product.brand,
        product.imageUrl,
        product.isAvailable
    );
        products.push(newProduct);
        res.status(201).json(newProduct);
}catch(error){
    next(error);
}
}

const updateProduct = (req, res, next) => {
    const product = products.find((product) => product.id === parseInt(req.params.id));
    if (product) {
        const index = products.indexOf(product);
        const updatedProduct = { ...product, ...req.body };
        products[index] = updatedProduct;
        res.status(200).json(updatedProduct);
    } else {
        next(new Error('Product not found'));
    }
}

const deleteProduct = (req, res, next) => {
    const product = products.find((product) => product.id === parseInt(req.params.id));
    if (product) {
        products = products.filter((product) => product.id !== parseInt(req.params.id));
        res.status(200).json({ message: 'Product removed' });
    } else {
        next(new Error('Product not found'));
    }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

