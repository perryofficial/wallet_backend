const { validationResult } = require('express-validator');
const { creditWallet, debitWallet } = require('../services/walletService');

const handleValidation = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error(result.array()[0].msg);
    error.statusCode = 400;
    throw error;
  }
};

const adminCreditWallet = async (req, res, next) => {
  try {
    handleValidation(req);
    const { client_id: clientId, amount } = req.body;

    const wallet = await creditWallet({ clientId, amount, referenceType: 'ADMIN_CREDIT' });

    res.status(200).json({
      message: 'Wallet credited successfully',
      data: {
        clientId,
        balance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminDebitWallet = async (req, res, next) => {
  try {
    handleValidation(req);
    const { client_id: clientId, amount } = req.body;

    const wallet = await debitWallet({
      clientId,
      amount,
      ledgerType: 'DEBIT',
      referenceType: 'ADMIN_DEBIT',
    });

    res.status(200).json({
      message: 'Wallet debited successfully',
      data: {
        clientId,
        balance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminCreditWallet,
  adminDebitWallet,
};
