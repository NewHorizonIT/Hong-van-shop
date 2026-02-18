🔐 Auth
POST /api/auth/login
POST /api/auth/logout

👤 Users
GET /api/users
POST /api/users
PATCH /api/users/:id
DELETE /api/users/:id

👥 Customers
GET /api/customers
POST /api/customers
PATCH /api/customers/:id
DELETE /api/customers/:id

📦 Categories
GET /api/categories
POST /api/categories
PATCH /api/categories/:id
DELETE /api/categories/:id

🛍 Products
GET /api/products
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id

🔧 Product Variants
GET /api/products/:productId/variants
POST /api/products/:productId/variants
PATCH /api/products/:productId/variants/:id
DELETE /api/products/:productId/variants/:id

📥 Inventory Imports
GET /api/inventory-imports
POST /api/inventory-imports
PATCH /api/inventory-imports/:id
DELETE /api/inventory-imports/:id

📊 Orders
GET /api/orders
GET /api/orders/upcoming?hours=2
POST /api/orders
PATCH /api/orders/:id
DELETE /api/orders/:id

📈 Reports
GET /api/reports/revenue?from=&to=
GET /api/reports/profit?from=&to=
GET /api/reports/costs?from=&to=
GET /api/reports/orders-stats?from=&to=
GET /api/reports/top-products?from=&to=

📤 Export
GET /api/export/orders?from=&to=
GET /api/export/revenue?from=&to=
GET /api/export/customers
