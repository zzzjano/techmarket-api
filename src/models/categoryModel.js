const { Category } = require('./index');

// Get all categories
const getAll = async () => {
  return await Category.findAll();
};

// Get a single category by ID
const getById = async (id) => {
  return await Category.findByPk(id);
};

// Get a category by name
const getByName = async (name) => {
  return await Category.findOne({
    where: { name }
  });
};

// Create a new category
const create = async (category) => {
  return await Category.create({
    name: category.name,
    description: category.description
  });
};

// Update a category
const update = async (id, categoryData) => {
  const currentCategory = await getById(id);
  
  if (!currentCategory) {
    throw new Error('Category not found');
  }
  
  // Merge the current data with the new data
  if (categoryData.name !== undefined) {
    currentCategory.name = categoryData.name;
  }
  
  if (categoryData.description !== undefined) {
    currentCategory.description = categoryData.description;
  }
  
  // Save changes
  await currentCategory.save();
  
  return currentCategory;
};

// Delete a category
const remove = async (id) => {
  const rowsDeleted = await Category.destroy({
    where: { id }
  });
  
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByName,
  create,
  update,
  remove
};
