const { Sequelize, DataTypes } = require('sequelize');

// Create an in-memory SQLite database for testing
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false // disable logging
});

// We need to recreate the models here instead of importing them
// because they're already connected to the main database
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  updatedAt: false
});

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    unique: true 
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'carts',
  timestamps: true
});

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: true,
  updatedAt: false
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Category,
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stockCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  timestamps: true,
  updatedAt: false
});

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cart,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'cart_items',
  timestamps: true
});

// Define associations
Cart.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(CartItem, { foreignKey: 'product_id' });

describe('Cart Model', () => {
  let testUser;
  
  beforeAll(async () => {
    // Create all tables in the in-memory database
    await sequelize.sync({ force: true });
    
    // Create a test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
  });

  afterAll(async () => {
    // Clean up
    await sequelize.close();
  });

  test('should create a cart with valid user data', async () => {
    // Create a cart with the test user
    const cart = await Cart.create({
      user_id: testUser.id
    });

    expect(cart).toBeDefined();
    expect(cart.id).toBeDefined();
    expect(cart.user_id).toBe(testUser.id);
    expect(cart.createdAt).toBeDefined();
    expect(cart.updatedAt).toBeDefined();
  });

  test('should not allow creating a cart without a user_id', async () => {
    // Try to create a cart without a user_id
    await expect(Cart.create({})).rejects.toThrow();
  });

  test('should not allow duplicate carts for the same user', async () => {
    // Try to create a second cart for the same user (should fail due to unique constraint)
    await expect(Cart.create({ user_id: testUser.id })).rejects.toThrow();
  });

  test('should establish correct association with User', async () => {
    // Get the cart with its associated user
    const cart = await Cart.findOne({
      where: { user_id: testUser.id },
      include: User
    });

    expect(cart).toBeDefined();
    expect(cart.User).toBeDefined();
    expect(cart.User.id).toBe(testUser.id);
    expect(cart.User.email).toBe('test@example.com');
  });

  test('should establish correct association with CartItems', async () => {
    // First create a product
    const product = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category_id: null,
      brand: 'Test Brand',
      imageUrl: 'http://example.com/image.jpg',
      stockCount: 10,
      isAvailable: true
    });

    // Get the cart
    const cart = await Cart.findOne({ where: { user_id: testUser.id }});
    
    // Create a cart item
    const cartItem = await CartItem.create({
      cart_id: cart.id,
      product_id: product.id,
      quantity: 2
    });

    // Get the cart with its items
    const cartWithItems = await Cart.findOne({
      where: { user_id: testUser.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });

    expect(cartWithItems).toBeDefined();
    expect(cartWithItems.CartItems).toBeDefined();
    expect(cartWithItems.CartItems.length).toBe(1);
    expect(cartWithItems.CartItems[0].quantity).toBe(2);
    expect(cartWithItems.CartItems[0].Product).toBeDefined();
    expect(cartWithItems.CartItems[0].Product.name).toBe('Test Product');
  });
});