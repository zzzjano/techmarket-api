const { Review, User, Product } = require('./index');
const { Sequelize } = require('sequelize');

// Get all reviews
const getAll = async () => {
  return await Review.findAll({
    include: [
      {
        model: User,
        attributes: ['username']
      },
      {
        model: Product,
        attributes: ['name']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

// Get a single review by ID
const getById = async (id) => {
  return await Review.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['username']
      },
      {
        model: Product,
        attributes: ['name']
      }
    ]
  });
};

// Get all reviews for a specific product
const getByProductId = async (productId) => {
  return await Review.findAll({
    where: { product_id: productId },
    include: [
      {
        model: User,
        attributes: ['username']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

// Get all reviews by a specific user
const getByUserId = async (userId) => {
  return await Review.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Product,
        attributes: ['name']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

// Create a new review
const create = async (review) => {
  return await Review.create({
    product_id: review.product_id,
    user_id: review.user_id,
    rating: review.rating,
    comment: review.comment
  });
};

// Update a review
const update = async (id, reviewData) => {
  const review = await Review.findByPk(id);
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  if (reviewData.rating !== undefined) {
    review.rating = reviewData.rating;
  }
  
  if (reviewData.comment !== undefined) {
    review.comment = reviewData.comment;
  }
  
  await review.save();
  
  return review;
};

// Delete a review
const remove = async (id) => {
  const rowsDeleted = await Review.destroy({
    where: { id }
  });
  
  return rowsDeleted > 0;
};

// Get product average rating
const getProductAverageRating = async (productId) => {
  const result = await Review.findOne({
    where: { product_id: productId },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'average_rating'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_reviews']
    ],
    raw: true
  });
  
  return {
    average_rating: parseFloat(result?.average_rating || 0).toFixed(1),
    total_reviews: parseInt(result?.total_reviews || 0)
  };
};

module.exports = {
  getAll,
  getById,
  getByProductId,
  getByUserId,
  create,
  update,
  remove,
  getProductAverageRating
};
