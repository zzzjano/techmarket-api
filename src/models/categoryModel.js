const db = require('../config/db');

// Get all categories
const getAll = async () => {
  return await db.query('SELECT * FROM categories');
};

// Get a single category by ID
const getById = async (id) => {
  const categories = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  return categories[0];
};

// Get a category by name
const getByName = async (name) => {
  const categories = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
  return categories[0];
};

// Create a new category
const create = async (category) => {
  const result = await db.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [category.name, category.description]
  );
  
  return { 
    id: result.insertId, 
    ...category, 
    createdAt: new Date().toISOString() 
  };
};

// Update a category
const update = async (id, categoryData) => {
  // First, get the current category data
  const currentCategory = await getById(id);
  
  if (!currentCategory) {
    throw new Error('Category not found');
  }
  
  // Merge the current data with the new data, preserving existing values where not specified
  const updatedCategory = {
    name: categoryData.name !== undefined ? categoryData.name : currentCategory.name,
    description: categoryData.description !== undefined ? categoryData.description : currentCategory.description
  };
  
  await db.query(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [updatedCategory.name, updatedCategory.description, id]
  );
  
  return { 
    id: parseInt(id), 
    name: updatedCategory.name, 
    description: updatedCategory.description,
    createdAt: currentCategory.createdAt 
  };
};

// Delete a category
const remove = async (id) => {
  const result = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByName,
  create,
  update,
  remove
};
