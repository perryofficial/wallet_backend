const axios = require('axios');

const fulfillOrder = async ({ clientId, orderId }) => {
  const payload = {
    userId: String(clientId),
    title: String(orderId),
  };

  const response = await axios.post('https://jsonplaceholder.typicode.com/posts', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  return response.data?.id ? String(response.data.id) : null;
};

module.exports = { fulfillOrder };
