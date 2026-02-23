const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const { debitWallet, creditWallet } = require('../services/walletService');
const { fulfillOrder } = require('../services/fulfillmentService');

const handleValidation = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error(result.array()[0].msg);
    error.statusCode = 400;
    throw error;
  }
};

const createOrder = async (req, res, next) => {
  try {
    handleValidation(req);

    const clientId = req.clientId;
    const { amount } = req.body;

    const order = new Order({
      clientId,
      amount,
      status: 'PENDING',
    });

    await debitWallet({
      clientId,
      amount,
      ledgerType: 'ORDER_DEBIT',
      referenceType: 'ORDER',
      referenceId: order._id.toString(),
    });

    try {
      await order.save();
    } catch (createError) {
      await creditWallet({
        clientId,
        amount,
        referenceType: 'ORDER_ROLLBACK',
        referenceId: order._id.toString(),
      });
      throw createError;
    }

    try {
      const fulfillmentId = await fulfillOrder({ clientId, orderId: order._id.toString() });

      order.fulfillmentId = fulfillmentId;
      order.status = 'FULFILLED';
      await order.save();
    } catch (_externalError) {
      order.status = 'FAILED';
      await order.save();
    }

    res.status(201).json({
      message: 'Order created',
      data: {
        order_id: order._id,
        client_id: order.clientId,
        amount: order.amount,
        status: order.status,
        fulfillment_id: order.fulfillmentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetails = async (req, res, next) => {
  try {
    handleValidation(req);
    const clientId = req.clientId;
    const { order_id: orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, clientId }).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      data: {
        order_id: order._id,
        client_id: order.clientId,
        amount: order.amount,
        status: order.status,
        fulfillment_id: order.fulfillmentId,
        created_at: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderDetails,
};
