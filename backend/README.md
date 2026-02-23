# Transaction System Backend

Express + MongoDB backend for wallet credit/debit and order creation with fulfillment integration.

## Short Interview Report
- This project is a wallet + order backend where admin can add/remove money and client can place orders.
- Money movement is safe because debit happens only if balance is enough (`balance >= amount` in one DB update).
- Every credit/debit is saved in `Ledger` so there is an audit trail.
- After order creation, system calls external fulfillment API and stores returned `fulfillmentId`.
- If order save fails after wallet debit, wallet is credited back automatically.

## What Is Wired Where (Layman Map)
- `src/server.js`: starts app + database connection.
- `src/app.js`: loads middlewares and connects routes.
- `src/routes/adminRoutes.js`: admin wallet APIs (`/admin/wallet/credit`, `/admin/wallet/debit`).
- `src/routes/orderRoutes.js`: client order APIs (`POST /orders`, `GET /orders/:order_id`).
- `src/routes/walletRoutes.js`: client wallet balance API (`GET /wallet/balance`).
- `src/controllers/*`: request handling/business flow.
- `src/services/walletService.js`: wallet debit/credit logic + ledger entry creation.
- `src/services/fulfillmentService.js`: external API call to fulfillment service.
- `src/models/*`: MongoDB collections (`Wallet`, `Ledger`, `Order`).
- `src/middlewares/clientAuth.js`: reads `client-id` header and protects client APIs.
- `src/middlewares/errorHandler.js`: centralized error response handling.

## Setup
1. Copy `.env.example` to `.env`
2. Set `MONGO_URI` (default local MongoDB URI is included)
3. Install dependencies:
   - `npm install`
4. Run:
   - `npm run dev`

## Design Notes
- Wallet debit uses atomic conditional update (`balance >= amount`) to prevent overspending in concurrent requests.
- Every wallet mutation writes to a ledger record.
- Order flow:
  - Deduct wallet amount
  - Create order
  - If order persistence fails, auto-credit rollback
  - Call fulfillment API and save returned `fulfillmentId`

## APIs
### 1) Admin Credit Wallet
`POST /admin/wallet/credit`
Body:
```json
{ "client_id": "client-101", "amount": 500 }
```

### 2) Admin Debit Wallet
`POST /admin/wallet/debit`
Body:
```json
{ "client_id": "client-101", "amount": 200 }
```

### 3) Create Order
`POST /orders`
Header: `client-id: client-101`
Body:
```json
{ "amount": 100 }
```

### 4) Get Order Details
`GET /orders/:order_id`
Header: `client-id: client-101`

### 5) Wallet Balance
`GET /wallet/balance`
Header: `client-id: client-101`

## Demo cURL Sequence
```bash
curl --location 'http://localhost:5000/admin/wallet/credit' \
--header 'Content-Type: application/json' \
--data '{"client_id":"client-101","amount":500}'

curl --location 'http://localhost:5000/orders' \
--header 'Content-Type: application/json' \
--header 'client-id: client-101' \
--data '{"amount":150}'

curl --location 'http://localhost:5000/wallet/balance' \
--header 'client-id: client-101'
```

## Testing Proof (Postman)
- Environment: `baseUrl=http://localhost:5000`
- DB: local MongoDB with `MONGO_URI=mongodb://127.0.0.1:27017/wallet_system`

### Executed Test Cases
1. Health check: `GET /health` -> `200 OK`
2. Admin credit: `POST /admin/wallet/credit` -> `200`, balance increased
3. Admin debit: `POST /admin/wallet/debit` -> `200`, balance decreased
4. Create order: `POST /orders` -> `201`, returns `order_id`, `status`, `fulfillment_id`
5. Get order details: `GET /orders/:order_id` -> `200`, returns order data
6. Wallet balance: `GET /wallet/balance` -> `200`, returns current balance
7. Insufficient balance: `POST /orders` high amount -> `400`
8. Missing `client-id`: client endpoint call -> `401`
9. Invalid `order_id`: `GET /orders/abc` -> `400`

### Sample Response Proof
```json
{
  "message": "Order created",
  "data": {
    "order_id": "65f0c6d1a4b2d7f3a1234567",
    "client_id": "client-101",
    "amount": 150,
    "status": "FULFILLED",
    "fulfillment_id": "101"
  }
}
```
