# Digital Waiter System - Connectivity & Database Guide

## Backend-Frontend Connectivity

### API Connection Flow

```
Frontend (Vite: 5173)
    ↓
[Axios Client]
    ↓
Proxy to Backend (5000)
    ↓
Backend Express Server
    ↓
[Authentication] → JWT Token Verification
    ↓
[Routes] → Controllers → Services → Models
    ↓
MongoDB
```

### Environment Setup for Connectivity

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-waiter
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Real-Time Communication (Socket.IO)

### Socket Connection Architecture

```
Client Connection
    ↓
Socket.IO Client (frontend)
    ↓
WebSocket / HTTP Long-Polling
    ↓
Socket.IO Server (backend)
    ↓
Event Handlers (Order Updates, Chef Notifications)
```

### Socket Events

**Kitchen Operations (Chef View)**
- `order:new` - New order received
- `order:updated` - Order status changed
- `order:ready` - Order prepared and ready
- `join:chef` - Chef joins socket

**Admin Operations**
- `order:completed` - Order finished
- `order:cancelled` - Order cancelled
- `sales:updated` - Sales data updated
- `join:admin` - Admin joins socket

**Real-time Table Orders**
- `join:order:{orderId}` - Join order room
- `order:status` - Order status update
- `kitchen:status` - Kitchen status update

---

## Database Connection & Schema

### MongoDB Connection

**URL Format:**
```
mongodb://[username:password@]host[:port]/database
```

**Local Development:**
```
mongodb://localhost:27017/digital-waiter
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

### Connection Verification

```bash
# Test with mongosh
mongosh mongodb://localhost:27017/digital-waiter

# In MongoDB shell
show databases
show collections
db.users.count()
db.orders.count()
```

---

## Database Collections Schema

### 1. Users Collection

```json
{
  "_id": ObjectId,
  "name": "Admin",
  "email": "admin@restaurant.com",
  "password": "hashed_password_bcrypt",
  "role": "admin|chef",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
- `email` (unique)
- `role`

---

### 2. Categories Collection

```json
{
  "_id": ObjectId,
  "name": "Appetizers",
  "description": "Starters and appetizers",
  "icon": "string",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

---

### 3. MenuItems Collection

```json
{
  "_id": ObjectId,
  "name": "Chicken Biryani",
  "category": ObjectId(categoryId),
  "price": 350,
  "description": "Fragrant rice with spiced chicken",
  "imageUrl": "http://...",
  "ingredients": [
    { "name": "Chicken", "quantity": 300, "unit": "g" },
    { "name": "Rice", "quantity": 250, "unit": "g" }
  ],
  "isAvailable": true,
  "preparationTime": 30,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
- `category`
- `isAvailable`

---

### 4. Orders Collection

```json
{
  "_id": ObjectId,
  "tableNumber": 5,
  "items": [
    {
      "menuItemId": ObjectId,
      "quantity": 2,
      "price": 350,
      "specialInstructions": "No salt"
    }
  ],
  "subtotal": 700,
  "tax": 105,
  "total": 805,
  "status": "pending|preparing|ready|completed|cancelled",
  "paymentStatus": "pending|paid",
  "createdAt": ISODate,
  "completedAt": ISODate,
  "updatedAt": ISODate,
  "inventoryProcessed": true,
  "notes": "VIP customer",
  "qrToken": "unique_token"
}
```

**Indexes:**
- `tableNumber`
- `status`
- `createdAt`
- `qrToken`

---

### 5. OrderItems Collection (Optional - if normalized)

```json
{
  "_id": ObjectId,
  "orderId": ObjectId,
  "menuItemId": ObjectId,
  "quantity": 2,
  "price": 350,
  "specialInstructions": "No salt",
  "status": "pending|cooking|ready|served",
  "createdAt": ISODate
}
```

---

### 6. Inventory Collection

```json
{
  "_id": ObjectId,
  "name": "Chicken Breast",
  "currentStock": 50,
  "unit": "kg",
  "lowStockThreshold": 10,
  "reorderQuantity": 20,
  "unitPrice": 200,
  "supplier": "Local Poultry",
  "expiryDate": ISODate,
  "lastRestocked": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
- `name` (unique)
- `currentStock`

---

### 7. Tables Collection

```json
{
  "_id": ObjectId,
  "number": 1,
  "capacity": 4,
  "isActive": true,
  "qrCodeUrl": "data:image/png;base64,...",
  "qrToken": "unique_token_for_table",
  "location": "Main Hall",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
- `number` (unique)
- `qrToken` (unique)

---

### 8. QRCodes Collection

```json
{
  "_id": ObjectId,
  "tableId": ObjectId,
  "tableNumber": 5,
  "token": "unique_token",
  "qrDataUrl": "data:image/png;base64,...",
  "scanned": false,
  "lastScanned": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
- `tableId` (unique)
- `token` (unique)

---

### 9. Sales Collection

```json
{
  "_id": ObjectId,
  "orderId": ObjectId,
  "amount": 805,
  "tax": 105,
  "paymentMethod": "cash|card|upi",
  "status": "completed|refunded",
  "discount": 0,
  "soldAt": ISODate,
  "createdAt": ISODate
}
```

**Indexes:**
- `orderId` (unique)
- `soldAt`

---

### 10. Recipes Collection (Optional)

```json
{
  "_id": ObjectId,
  "name": "Biryani Recipe",
  "menuItemId": ObjectId,
  "ingredients": [
    {
      "inventoryId": ObjectId,
      "quantityRequired": 300,
      "unit": "g"
    }
  ],
  "steps": [
    { "step": 1, "instruction": "Soak rice for 30 minutes" }
  ],
  "estimatedTime": 30,
  "difficulty": "medium",
  "createdAt": ISODate
}
```

---

## Data Relationships

```
Users (1) ─── (Many) Orders
         └─── (Many) Recipes

Categories (1) ─── (Many) MenuItems

MenuItems (1) ─── (Many) Orders (through OrderItems)
          ├─── (1) Category
          └─── (Many) Ingredients (Inventory)

Orders (1) ─── (1) Table
       ├─── (Many) MenuItems (through OrderItems)
       └─── (1) Sales

Tables (1) ─── (1) QRCodes
       └─── (Many) Orders

Inventory (1) ─── (Many) Recipes (through Ingredients)

Sales (1) ─── (1) Orders
```

---

## Connection Health Check

### Backend Health Endpoint

```bash
# Check if backend is running
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-05-12T10:30:00.000Z",
  "environment": "development"
}
```

### Database Health Check

```bash
# From backend terminal
mongosh mongodb://localhost:27017/digital-waiter

# Commands:
db.adminCommand('ping')  # Should return { ok: 1 }
db.users.countDocuments()
db.orders.countDocuments()
```

### Socket.IO Connection Check

```javascript
// In browser console
io  // Should show Socket.IO client object
io.connected  // Should be true when connected
```

---

## Troubleshooting Connectivity

### Issue: API Connection Refused

```bash
# 1. Check backend is running
curl http://localhost:5000/health

# 2. Check port availability
# Windows:
netstat -ano | findstr :5000

# 3. Verify CORS configuration
# Check .env: CLIENT_URL=http://localhost:5173
```

### Issue: Database Connection Failed

```bash
# 1. Check MongoDB is running
mongosh  # Should connect

# 2. Check URI in .env
echo $MONGODB_URI  # Should show valid connection string

# 3. Test connection
mongosh $MONGODB_URI
```

### Issue: Socket.IO Connection Timeout

```javascript
// Check in browser console
io.engine.transport.name  // Should show 'websocket'
io.listeners  // Should have events
```

---

## Performance Optimization

### Database Indexing

```bash
# Create indexes for faster queries
use digital-waiter

# User indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

# Order indexes
db.orders.createIndex({ "tableNumber": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })

# Inventory indexes
db.inventory.createIndex({ "name": 1 }, { unique: true })
db.inventory.createIndex({ "currentStock": 1 })

# Table indexes
db.tables.createIndex({ "number": 1 }, { unique: true })
db.tables.createIndex({ "qrToken": 1 }, { unique: true })

# QR Code indexes
db.qrcodes.createIndex({ "tableId": 1 }, { unique: true })
db.qrcodes.createIndex({ "token": 1 }, { unique: true })

# Sales indexes
db.sales.createIndex({ "orderId": 1 }, { unique: true })
db.sales.createIndex({ "soldAt": -1 })

# View all indexes
db.collection.getIndexes()
```

### Query Optimization

```javascript
// Use projection to reduce data transfer
db.orders.find({ status: 'pending' }, { _id: 1, total: 1, createdAt: 1 })

// Use aggregation pipeline for complex queries
db.orders.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: null, totalSales: { $sum: '$total' } } }
])
```

---

## Backup & Recovery

### MongoDB Backup

```bash
# Backup database
mongodump --uri="mongodb://localhost:27017/digital-waiter" \
  --out=/path/to/backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/digital-waiter" \
  /path/to/backup/digital-waiter
```

---

## Connection Pooling

The application automatically manages connection pooling:

```javascript
// Backend uses Mongoose connection pooling
// Default: 10 connections per pool
// Adjustable in connection options:
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  waitQueueTimeoutMS: 10000
})
```

---

## Security Considerations

### Connection Security

- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS in production
- [ ] Use MongoDB authentication
- [ ] Validate all inputs
- [ ] Rate limit API endpoints
- [ ] Enable CORS only for trusted origins
- [ ] Use environment variables for secrets
- [ ] Log all database operations

---

## Monitoring & Logging

### Backend Logging

```
✅ Server running on http://localhost:5000
📍 API: http://localhost:5000/api
🔌 Socket.IO enabled
🌐 Client URL: http://localhost:5173
✅ Environment: development
🔄 Connecting to MongoDB...
✅ MongoDB connected: localhost
```

### Database Connection Logs

Monitor the backend console for:
- Database connection success/failure
- Query performance
- Error logs
- Socket.IO events

---

## References

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js API](https://expressjs.com/api.html)
