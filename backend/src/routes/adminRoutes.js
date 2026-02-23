const { body } = require('express-validator');
const express = require('express');
const { adminCreditWallet, adminDebitWallet } = require('../controllers/adminController');

const router = express.Router();

const walletBodyValidation = [
  body('client_id').isString().trim().notEmpty().withMessage('client_id is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0').toFloat(),
];

router.post('/wallet/credit', walletBodyValidation, adminCreditWallet);
router.post('/wallet/debit', walletBodyValidation, adminDebitWallet);

module.exports = router;
