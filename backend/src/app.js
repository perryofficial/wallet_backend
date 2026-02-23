require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);

app.use(errorHandler);

module.exports = app;
