# 🍽️ Digital Waiter System — Complete Project Workflow Report

> **Project Path:** `d:\94project`
> **Generated:** 2026-05-12
> **System Name:** Digital Waiter System (Smart Café Ordering System)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Data Architecture (MongoDB Models)](#4-data-architecture-mongodb-models)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [User Roles & Access Control](#7-user-roles--access-control)
8. [Core Workflows](#8-core-workflows)
9. [Real-Time Communication (Socket.IO)](#9-real-time-communication-socketio)
10. [API Endpoint Reference](#10-api-endpoint-reference)
11. [Key Features Summary](#11-key-features-summary)
12. [System Diagram](#12-system-diagram)

---

## 1. Project Overview

The **Digital Waiter System** is a full-stack, real-time smart café ordering platform. It replaces physical menus and paper-based ordering with a QR-code-driven digital flow. Customers scan a QR code at their table, browse the menu, and place orders. The kitchen chef sees new orders in real time and updates their status. The admin manages the entire restaurant — menu, inventory, QR codes, tables, and sales reports.

### Core User Journeys

| Actor | Journey |
|---|---|
| **Customer** | Scan QR → Browse Menu → Add to Cart → Place Order → Track Order |
| **Chef** | Login → View Live Orders → Update Status (Preparing → Ready → Served) |
| **Admin** | Login → Full Dashboard → Manage Menu, Inventory, Tables, QR Codes, View Sales |

---

## 2. Technology Stack

### Backend
| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v4 |
| Database | MongoDB (via Mongoose v8) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Real-Time | Socket.IO v4 |
| Validation | Joi |
| File Upload | Multer |
| QR Generation | `qrcode` npm package |
| Dev Server | Nodemon |
| Logging | Morgan + custom logger |

### Frontend
| Component | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router DOM v6 |
| State (Global) | React Context API (Auth, Cart, Socket) |
| UI | TailwindCSS v3 |
| Animations | Framer Motion |
| Icons | React Icons |
| HTTP Client | Axios |
| Real-Time | socket.io-client v4 |
| QR Scanner | html5-qrcode |
| Notifications | react-hot-toast |

### Tooling
| Tool | Purpose |
|---|---|
| `concurrently` | Run frontend + backend dev servers together |
| Docker Compose | Optional containerized deployment |
| `.env` files | Separate environment configs per layer |

---

## 3. Project Structure

```
d:\94project/
├── package.json               ← Root workspace (scripts: dev, seed-all)
├── docker-compose.yml
├── .env / .env.example
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js          ← Entry: HTTP + MongoDB + Socket.IO init
│       ├── app.js             ← Express app, routes, CORS, middleware
│       ├── config/
│       │   ├── db.js          ← MongoDB connection
│       │   ├── socket.js      ← Socket.IO setup & room management
│       │   └── cloudinary.js  ← (stub)
│       ├── models/            ← Mongoose schemas
│       ├── controllers/       ← Route handlers (thin layer)
│       ├── services/          ← Business logic
│       ├── routes/            ← API route definitions
│       ├── middleware/        ← Auth, roles, validation, error, upload
│       ├── validators/        ← Joi validation schemas
│       ├── sockets/           ← Socket event handlers
│       ├── utils/             ← logger, generateToken, generateQRCode
│       └── seed/              ← DB seed scripts
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx           ← React root mount
│       ├── App.jsx            ← Context providers + Toaster
│       ├── routes/            ← AppRoutes, ProtectedRoute
│       ├── context/           ← AuthContext, CartContext, SocketContext
│       ├── pages/
│       │   ├── customer/      ← Scan, Menu, Cart, Success, Tracking
│       │   ├── chef/          ← ChefDashboard
│       │   ├── admin/         ← AdminDashboard, Menu/Inventory/Orders/QR/Sales
│       │   └── auth/          ← LoginPage
│       ├── components/        ← admin/, chef/, cart/, menu/, common/
│       ├── layouts/           ← CustomerLayout, ChefLayout, AdminLayout
│       ├── hooks/             ← Custom hooks
│       ├── services/          ← Axios API call wrappers
│       └── utils/
└── database/
    ├── schema/                ← collections.md, er-diagram.png
    └── seed-data/
```

---

## 4. Data Architecture (MongoDB Models)

### Entity Relationship Overview

```
User ─────────────────────────── (admin / chef login)

Table ──────────── QRCode        (1:1, each table has one QR)
  │
  └──── Order ────── OrderItem[] ─── MenuItem ─── Category
                         │
                    (name, price,      │
                     quantity)    Inventory[] ←── Recipe (ingredients)

Order ──── Sale                  (1:1, created when Completed)
```

### Model Details

| Model | Key Fields | Notes |
|---|---|---|
| **User** | name, email, password, role (`admin`/`chef`) | Password hidden by default (`select: false`) |
| **Table** | number, token, qrCodeUrl, isActive | Unique token per table for QR security |
| **QRCode** | table (ref), token, qrDataUrl | Stores generated QR image as data URL |
| **Category** | name, description, sortOrder | Groups menu items |
| **MenuItem** | name, description, price, category (ref), imageUrl, isAvailable, ingredients[] | Each ingredient → Inventory ref + quantity |
| **Inventory** | name, unit, stock, lowStockThreshold | Auto-deducted on order completion |
| **Order** | table (ref), tableNumber, items[], subtotal, tax (8%), total, status, inventoryProcessed | Status: Pending→Preparing→Ready→Served→Completed/Cancelled |
| **OrderItem** | menuItem (ref), name, price, quantity | Denormalized snapshot |
| **Sale** | order (ref), amount, createdAt | Created automatically on order Completion |
| **Recipe** | (ingredient mapping model) | Links MenuItems to Inventory for auto-deduction |

---

## 5. Backend Architecture

### Server Bootstrap (`server.js`)
```
1. Load .env
2. Connect to MongoDB (connectDB)
3. Create HTTP server from Express app
4. Initialize Socket.IO on same HTTP server
5. Listen on PORT (default 5000)
6. Graceful SIGTERM shutdown
```

### Middleware Stack (in order)
```
CORS → JSON parser → URL encoder → Morgan logger
→ Route handlers
  → authMiddleware (JWT verify)
  → roleMiddleware (role check)
  → validateMiddleware (Joi)
  → controller → service
→ 404 handler
→ errorMiddleware (global error catch)
```

### Service Layer Pattern
Controllers are kept thin; all business logic lives in services:

| Service | Responsibility |
|---|---|
| `authService.js` | Register & login with bcrypt + JWT |
| `orderService.js` | Create order, calculate tax (8%), complete order |
| `inventoryService.js` | Deduct stock when order is completed |
| `salesService.js` | Aggregate sales data |
| `qrService.js` | Generate QR codes for tables, store data URLs |

---

## 6. Frontend Architecture

### Context Providers (App.jsx)
```
<AuthProvider>          ← JWT token, user info, login/logout
  <SocketProvider>      ← socket.io-client connection
    <CartProvider>      ← Cart items + tableSession (localStorage-backed)
      <AppRoutes />
      <Toaster />       ← Global toast notifications
    </CartProvider>
  </SocketProvider>
</AuthProvider>
```

### Routing Map

| Path | Component | Auth Required | Role |
|---|---|---|---|
| `/` | → redirect to `/scan` | ❌ | — |
| `/scan` | `ScanPage` | ❌ | Customer |
| `/customer/menu` | `MenuPage` | ❌ | Customer |
| `/customer/cart` | `CartPage` | ❌ | Customer |
| `/customer/success` | `OrderSuccessPage` | ❌ | Customer |
| `/customer/tracking` | `OrderTrackingPage` | ❌ | Customer |
| `/login` | `LoginPage` | ❌ | Staff |
| `/chef` | `ChefDashboard` | ✅ | chef, admin |
| `/admin` | `AdminDashboard` | ✅ | admin |
| `/admin/menu` | `MenuManagement` | ✅ | admin |
| `/admin/inventory` | `InventoryManagement` | ✅ | admin |
| `/admin/orders` | `OrdersManagement` | ✅ | admin |
| `/admin/reports` | `SalesReports` | ✅ | admin |
| `/admin/qr` | `QRManagement` | ✅ | admin |

### CartContext — localStorage Persistence
The cart is persisted in `localStorage` under two keys:
- `cartItems` — array of `{ menuItem, name, price, quantity }`
- `tableSession` — `{ tableNumber, token, qrId, scannerId }` (populated from QR scan)

---

## 7. User Roles & Access Control

```
┌─────────────────────────────────────────────────────┐
│                     ROLES                           │
├──────────┬──────────────────────────────────────────┤
│  admin   │ Full access: CRUD menu, inventory, QR,   │
│          │ tables, orders, sales reports            │
├──────────┼──────────────────────────────────────────┤
│  chef    │ View & update order statuses only        │
├──────────┼──────────────────────────────────────────┤
│ customer │ No login — QR-token-authenticated access  │
│ (public) │ to menu, cart, order placement & tracking│
└──────────┴──────────────────────────────────────────┘
```

**Auth Flow:**
1. Admin/Chef → POST `/api/auth/login` → receives JWT
2. JWT stored in `AuthContext` (in-memory / localStorage)
3. Every protected API call sends `Authorization: Bearer <token>`
4. `authMiddleware` verifies JWT, attaches `req.user`
5. `roleMiddleware` checks `req.user.role` against allowed roles

---

## 8. Core Workflows

### Workflow 1: Customer Order Flow

```
📱 Customer arrives at table
        │
        ▼
[QR Code on Table]
  Contains: /scan?scannerId=SCANNER-T3&qrId=QR-xxx&table=3&token=abc123
        │
        ▼
[ScanPage] — html5-qrcode scans QR
  Saves tableSession to CartContext (localStorage)
        │
        ▼
[MenuPage] — GET /api/menu (public)
  Displays items by category
  Customer adds items → CartContext.addItem()
        │
        ▼
[CartPage] — Reviews cart
  Sees subtotal, 8% tax, total
        │
        ▼
  POST /api/orders
  Body: { tableNumber, token, items: [{menuItem, quantity}] }
        │
        ▼
[Backend: orderService.createOrder()]
  1. Validates table by token + tableNumber
  2. Looks up each MenuItem for current price (denormalized)
  3. Calculates subtotal + tax(8%) + total
  4. Creates Order document (status: "Pending")
  5. Emits socket: order:new → "chef" room, "admin" room
        │
        ▼
[OrderSuccessPage] — Shows confirmation
        │
        ▼
[OrderTrackingPage] — Joins socket room order:{id}
  Receives real-time status updates
```

### Workflow 2: Chef Order Management Flow

```
👨‍🍳 Chef logs in → /login
        │
        ▼
[ChefDashboard] — socket joins "chef" room
  Receives: order:new events in real time
  Sees all Pending + active orders
        │
        ▼
  Updates order status:
  Pending → Preparing → Ready → Served
        │
        ▼
  PATCH /api/orders/:id/status
  Backend emits: order:updated → chef, admin, order:{id} rooms
        │
        ▼
  Admin marks → Completed
  [Backend: completeOrder()]
    1. Deducts inventory stock (deductInventoryForOrder)
    2. Sets inventoryProcessed = true
    3. Creates Sale record { order._id, amount: total }
```

### Workflow 3: Admin Management Flow

```
👨‍💼 Admin logs in → /login (role: admin)
        │
        ├──[AdminDashboard] → Overview stats
        │
        ├──[MenuManagement] /admin/menu
        │    CRUD: GET/POST/PUT/DELETE /api/menu
        │    Assign category, price, image, ingredients
        │
        ├──[InventoryManagement] /admin/inventory
        │    Track stock levels, low-stock alerts
        │    GET/POST/PUT/DELETE /api/inventory
        │
        ├──[OrdersManagement] /admin/orders
        │    Real-time order list (joins "admin" socket room)
        │    Can update any order status
        │
        ├──[QRManagement] /admin/qr
        │    POST /api/qr/generate-all → generates QR for all tables
        │    Downloads printable QR codes
        │
        └──[SalesReports] /admin/reports
             GET /api/sales → aggregated revenue data
```

### Workflow 4: QR Code Generation Flow

```
Admin → POST /api/qr/generate-all
        │
        ▼
[qrService.generateForAllTables()]
  For each Table:
    scannerId = "SCANNER-T{number}"
    qrId = "QR-{table._id}"
    qrValue = "{CLIENT_URL}/scan?scannerId=...&qrId=...&table=...&token=..."
    qrDataUrl = generateQRCodeImage(qrValue)  ← PNG as base64
    Save to QRCode collection (upsert)
    Save qrCodeUrl to Table document
        │
        ▼
Admin downloads / prints QR codes → Placed on tables
```

---

## 9. Real-Time Communication (Socket.IO)

### Room Architecture

| Room Name | Who Joins | Events Received |
|---|---|---|
| `chef` | ChefDashboard on login | `order:new`, `order:updated` |
| `admin` | Admin pages | `order:new`, `order:updated` |
| `order:{id}` | Customer OrderTrackingPage | `order:updated` |

### Event Flow

```
Customer places order
    → server emits order:new → [chef room] + [admin room]

Chef/Admin updates status
    → server emits order:updated → [chef room] + [admin room] + [order:{id} room]

Customer tracking page
    → receives order:updated → refreshes status display in real-time
```

### Frontend Socket Join Events Sent

| Client Event | When Sent | Joins Room |
|---|---|---|
| `join:chef` | ChefDashboard mount | `chef` |
| `join:admin` | Admin pages mount | `admin` |
| `join:order` (orderId) | OrderTrackingPage mount | `order:{id}` |

---

## 10. API Endpoint Reference

### Auth Routes — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login (admin/chef) → JWT |
| POST | `/api/auth/register` | ✅ Admin | Create new user |

### Menu Routes — `/api/menu`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | ❌ | List all available menu items |
| POST | `/api/menu` | ✅ Admin | Create menu item |
| PUT | `/api/menu/:id` | ✅ Admin | Update menu item |
| DELETE | `/api/menu/:id` | ✅ Admin | Delete menu item |

### Category Routes — `/api/categories`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | ❌ | List categories |
| POST | `/api/categories` | ✅ Admin | Create category |
| PUT | `/api/categories/:id` | ✅ Admin | Update category |
| DELETE | `/api/categories/:id` | ✅ Admin | Delete category |

### Order Routes — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | ✅ Chef/Admin | List all orders |
| POST | `/api/orders` | ❌ | Place new order (customer) |
| PATCH | `/api/orders/:id/status` | ✅ Chef/Admin | Update order status |

### Inventory Routes — `/api/inventory`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/inventory` | ✅ Admin | List inventory items |
| POST | `/api/inventory` | ✅ Admin | Add inventory item |
| PUT | `/api/inventory/:id` | ✅ Admin | Update stock/details |
| DELETE | `/api/inventory/:id` | ✅ Admin | Remove item |

### Table Routes — `/api/tables`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tables` | ✅ Admin | List tables |
| POST | `/api/tables` | ✅ Admin | Create table |

### QR Routes — `/api/qr`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/qr` | ✅ Admin | List QR records |
| POST | `/api/qr/generate/:tableId` | ✅ Admin | Generate QR for one table |
| POST | `/api/qr/generate-all` | ✅ Admin | Generate QR for all tables |

### Sales Routes — `/api/sales`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/sales` | ✅ Admin | Sales report data |

---

## 11. Key Features Summary

| Feature | Implementation |
|---|---|
| **QR-Driven Ordering** | QR encodes table token; no app install needed |
| **Real-Time Kitchen Updates** | Socket.IO rooms: chef, admin, order tracking |
| **Auto Inventory Deduction** | On `Completed` status: deducts ingredient stock from menu recipe |
| **Tax Calculation** | 8% tax applied server-side on every order |
| **Price Denormalization** | Order items snapshot price at time of order (not volatile reference) |
| **Role-Based Access** | JWT + middleware: admin > chef > customer (public) |
| **LocalStorage Cart** | Cart survives page refresh; tied to table session |
| **Sale Recording** | Automatic `Sale` document created per completed order |
| **Low Stock Alerts** | `lowStockThreshold` on Inventory for admin visibility |
| **QR Data URL Storage** | QR stored as base64 PNG in DB — directly printable |
| **Graceful Shutdown** | SIGTERM handler closes server cleanly |
| **Seed Scripts** | `seed-admin`, `seed-tables`, `seed-menu` for quick dev setup |

---

## 12. System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DIGITAL WAITER SYSTEM                        │
│                                                                     │
│  ┌──────────────┐     HTTP/REST      ┌──────────────────────────┐  │
│  │   CUSTOMER   │ ◄────────────────► │                          │  │
│  │  (Browser)   │                    │   BACKEND (Node/Express) │  │
│  │  React SPA   │ ◄── Socket.IO ───► │                          │  │
│  └──────────────┘                    │  ┌────────┐ ┌─────────┐  │  │
│                                      │  │Routes  │ │Services │  │  │
│  ┌──────────────┐     HTTP/REST      │  └────────┘ └─────────┘  │  │
│  │    CHEF      │ ◄────────────────► │  ┌────────┐ ┌─────────┐  │  │
│  │  (Browser)   │                    │  │Models  │ │Socket.IO│  │  │
│  │  React SPA   │ ◄── Socket.IO ───► │  └────────┘ └─────────┘  │  │
│  └──────────────┘                    │           │               │  │
│                                      └───────────┼───────────────┘  │
│  ┌──────────────┐     HTTP/REST                  │                  │
│  │    ADMIN     │ ◄────────────────►             │                  │
│  │  (Browser)   │                             ┌──▼──────────────┐   │
│  │  React SPA   │ ◄── Socket.IO ─────────────► │    MongoDB      │  │
│  └──────────────┘                             │  Collections:   │   │
│                                               │  users, tables, │   │
│  ┌──────────────┐                             │  menuItems,     │   │
│  │   QR CODE    │                             │  orders, sales, │   │
│  │  (Physical)  │ ─── Scan ──► /scan?...      │  inventory,     │   │
│  └──────────────┘                             │  categories,    │   │
│                                               │  qrcodes        │   │
│                                               └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Dev Setup Quick Reference

```powershell
# Install all dependencies
npm run install-all

# Seed database (admin + tables + menu)
npm run seed-all

# Run dev servers (frontend + backend together)
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# API:      http://localhost:5000/api
# Health:   http://localhost:5000/health
```

> Default credentials are seeded via `seed/seedAdmin.js` — see `ADMIN_CHEF_CREDENTIALS.md` for login details.
