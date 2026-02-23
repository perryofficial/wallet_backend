const Wallet = require('../models/Wallet');
const Ledger = require('../models/Ledger');

const assertPositiveAmount = (amount) => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    const error = new Error('Amount must be a positive number');
    error.statusCode = 400;
    throw error;
  }
};

const creditWallet = async ({ clientId, amount, referenceType = 'ADMIN', referenceId = null, session = null }) => {
  assertPositiveAmount(amount);

  const wallet = await Wallet.findOneAndUpdate(
    { clientId },
    { $inc: { balance: amount } },
    { new: true, upsert: true, session, setDefaultsOnInsert: true }
  );

  await Ledger.create(
    [
      {
        clientId,
        type: 'CREDIT',
        amount,
        referenceType,
        referenceId,
        balanceAfter: wallet.balance,
      },
    ],
    { session }
  );

  return wallet;
};

const debitWallet = async ({
  clientId,
  amount,
  ledgerType = 'DEBIT',
  referenceType = 'ADMIN',
  referenceId = null,
  session = null,
}) => {
  assertPositiveAmount(amount);

  const wallet = await Wallet.findOneAndUpdate(
    { clientId, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true, session }
  );

  if (!wallet) {
    const error = new Error('Insufficient wallet balance');
    error.statusCode = 400;
    throw error;
  }

  await Ledger.create(
    [
      {
        clientId,
        type: ledgerType,
        amount,
        referenceType,
        referenceId,
        balanceAfter: wallet.balance,
      },
    ],
    { session }
  );

  return wallet;
};

const getBalance = async (clientId) => {
  const wallet = await Wallet.findOne({ clientId }).lean();
  return wallet ? wallet.balance : 0;
};

module.exports = {
  creditWallet,
  debitWallet,
  getBalance,
};
