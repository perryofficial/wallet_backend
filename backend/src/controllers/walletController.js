const { getBalance } = require('../services/walletService');

const getWalletBalance = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const balance = await getBalance(clientId);

    res.status(200).json({
      data: {
        client_id: clientId,
        balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWalletBalance };
