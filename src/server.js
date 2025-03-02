const express = require('express');
const ENV = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');

ENV.config();
const port = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const productRoutes = require('./routes/productRoutes.js');

app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});