const { body, param } = require('express-validator');
const express = require('express');
const { createOrder, getOrderDetails } = require('../controllers/orderController');
const clientAuth = require('../middlewares/clientAuth');

const router = express.Router();

router.use(clientAuth);

router.post(
  '/',
  [body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0').toFloat()],
  createOrder
);

router.get(
  '/:order_id',
  [param('order_id').isMongoId().withMessage('order_id must be a valid id')],
  getOrderDetails
);

module.exports = router;
