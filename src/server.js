require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { testConnection } = require('./config/db');
const { initDatabase } = require('./config/dbInit');

const app = express();
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const port = process.env.SERVER_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const productRoutes = require('./routes/productRoutes.js');
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Hello world');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        
        if (isConnected) {
            // Initialize database schema and insert sample data if needed
            await initDatabase();
            
            app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
            });
            
        } else {
            console.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();