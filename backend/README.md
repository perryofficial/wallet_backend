# Transaction System Backend

Express + MongoDB backend for wallet credit/debit and order creation with fulfillment integration.

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
