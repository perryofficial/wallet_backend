const clientAuth = (req, res, next) => {
  const clientId = req.header('client-id');

  if (!clientId || !String(clientId).trim()) {
    return res.status(401).json({ message: 'Missing client-id header' });
  }

  req.clientId = String(clientId).trim();
  next();
};

module.exports = clientAuth;
