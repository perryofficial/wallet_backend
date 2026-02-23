const express = require('express');
const clientAuth = require('../middlewares/clientAuth');
const { getWalletBalance } = require('../controllers/walletController');

const router = express.Router();

router.use(clientAuth);
router.get('/balance', getWalletBalance);

module.exports = router;
