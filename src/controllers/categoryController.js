const categoryModel = require('../models/categoryModel');

// Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.getAll();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error.message);
    const err = new Error('Server error while retrieving categories');
    err.status = 500;
    next(err);
  }
};

// Get a single category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getById(id);
    
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting category:', error.message);
    next(error);
  }
};

// Create a new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      const error = new Error('Category name is required');
      error.status = 400;
      throw error;
    }
    
    // Check if category already exists
    const existingCategory = await categoryModel.getByName(name);
    if (existingCategory) {
      const error = new Error('Category with this name already exists');
      error.status = 400;
      throw error;
    }
    
    const category = await categoryModel.create({ name, description });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error.message);
    next(error);
  }
};

// Update a category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if category exists
    const existingCategory = await categoryModel.getById(id);
    if (!existingCategory) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    
    // If name is being changed, check if it's already taken
    if (updates.name && updates.name !== existingCategory.name) {
      const categoryWithName = await categoryModel.getByName(updates.name);
      if (categoryWithName) {
        const error = new Error('Category with this name already exists');
        error.status = 400;
        throw error;
      }
    }
    
    // Update the category with the provided fields
    const updatedCategory = await categoryModel.update(id, updates);
    
    res.json({ 
      success: true,
      message: 'Category updated successfully', 
      category: updatedCategory 
    });
  } catch (error) {
    console.error('Error updating category:', error.message);
    next(error);
  }
};

// Delete a category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await categoryModel.getById(id);
    if (!existingCategory) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    
    const result = await categoryModel.remove(id);
    if (result) {
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } else {
      const error = new Error('Failed to delete category');
      error.status = 500;
      throw error;
    }
  } catch (error) {
    console.error('Error deleting category:', error.message);
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
