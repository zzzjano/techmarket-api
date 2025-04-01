const User = require('./userSchema');
const Product = require('./productSchema');
const Category = require('./categorySchema');
const { Review } = require('./reviewSchema');
const Cart = require('./cartSchema');

module.exports = {
  User,
  Product,
  Category,
  Review,
  Cart
};
