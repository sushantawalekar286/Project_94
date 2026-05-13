# Digital Waiter System - Setup & Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Backend Services](#backend-services)
8. [Frontend Configuration](#frontend-configuration)
9. [Testing Credentials](#testing-credentials)
10. [Troubleshooting](#troubleshooting)
11. [Deployment](#deployment)

---

## Quick Start

```bash
# Clone or extract the project
cd 94project

# Install all dependencies
npm install
npm run install-all

# Create .env files
# Copy .env.example to .env (backend)
# Copy frontend/.env.example to frontend/.env.local

# Seed initial data
npm run seed-admin

# Start development
npm run dev
```

---

## System Requirements

### Minimum Hardware
- CPU: 2 cores
- RAM: 4GB
- Storage: 2GB free space

### Software Requirements
- **Node.js**: v16.x or higher (recommended: v18.x or v20.x)
- **npm**: v8.x or higher
- **MongoDB**: v5.x or higher (local or remote)
- **Docker**: (optional, for containerized setup)

### Supported Operating Systems
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+)

---

## Installation

### Step 1: Prerequisites
Install Node.js from https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version  # v18.x or higher
npm --version   # v8.x or higher
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# OR use the convenience script
npm run install-all
```

### Step 3: MongoDB Setup

#### Option A: Local MongoDB (Windows)
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

#### Option B: Docker MongoDB (Recommended)
```bash
# Start MongoDB with Docker Compose
docker-compose up -d
```

Verify connection:
```bash
mongosh  # MongoDB Shell
# Should connect to localhost:27017
```

#### Option C: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Copy connection string (URI)
4. Update MONGODB_URI in .env

---

## Environment Configuration

### Backend Configuration (.env)

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/digital-waiter

# JWT Authentication
JWT_SECRET=your_secret_key_min_32_chars_recommended_change_in_production

# CORS
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary (for image uploads)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Configuration (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_LOGGING=true
VITE_THEME_MODE=dark
```

---

## Database Setup

### Initialize Database

```bash
# Create initial admin and chef users
npm run seed-admin

# This creates:
# - Admin account: admin@restaurant.com / admin123
# - Chef account: chef@restaurant.com / admin123
```

### Seed Sample Data

```bash
# Seed tables
cd backend
node src/seed/seedTables.js

# Seed menu items
node src/seed/seedMenu.js

# OR seed all at once from root
npm run seed-all
```

### Database Connection Troubleshooting

```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/digital-waiter

# Check if database exists
show dbs

# Use the database
use digital-waiter

# Check collections
show collections

# View users
db.users.find()
```

---

## Running the Application

### Development Mode (All at Once)

```bash
npm run dev
```

This starts:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Development Mode (Separate Terminals)

**Terminal 1 - Backend:**
```bash
npm run server
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
# or
cd frontend && npm run dev
```

### Production Build

```bash
# Backend (in backend directory)
npm run start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Backend Services

### API Endpoints

```
Health Check: GET /health
API Info:     GET /api

Authentication:
  POST   /api/auth/login
  POST   /api/auth/register (admin-only)

Menu Management:
  GET    /api/menu
  POST   /api/menu (admin)
  PUT    /api/menu/:id (admin)
  DELETE /api/menu/:id (admin)

Categories:
  GET    /api/categories
  POST   /api/categories (admin)
  PUT    /api/categories/:id (admin)
  DELETE /api/categories/:id (admin)

Orders:
  GET    /api/orders
  POST   /api/orders
  PUT    /api/orders/:id
  GET    /api/orders/:id

Inventory:
  GET    /api/inventory
  POST   /api/inventory (admin)
  PUT    /api/inventory/:id (admin)
  DELETE /api/inventory/:id (admin)

Tables:
  GET    /api/tables
  POST   /api/tables (admin)
  PUT    /api/tables/:id (admin)

Sales Reports:
  GET    /api/sales

QR Codes:
  POST   /api/qr/generate
  GET    /api/qr/scan/:token
```

### Real-Time Features (Socket.IO)

```
Connections:
  - order:new
  - order:updated
  - order:completed
  - chef:notify
  - admin:notify
```

---

## Frontend Configuration

### Key Features
- **QR Code Scanning** for table identification
- **Real-time Order Tracking** via Socket.IO
- **Shopping Cart** with localStorage persistence
- **Role-based Dashboards** (Customer, Chef, Admin)
- **Responsive Design** (Mobile, Tablet, Desktop)

### Frontend Routes

```
/login                  - User login
/scan                   - Table QR scanner
/customer/menu          - Menu browsing
/customer/cart          - Shopping cart
/customer/success       - Order confirmation
/customer/tracking      - Order status tracking
/chef                   - Chef dashboard
/admin                  - Admin overview
/admin/menu             - Menu management
/admin/inventory        - Inventory management
/admin/orders           - Orders management
/admin/reports          - Sales reports
/admin/qr               - QR code generation
```

---

## Testing Credentials

### Admin Account
- **Email:** admin@restaurant.com
- **Password:** admin123
- **Role:** Full system access

### Chef Account
- **Email:** chef@restaurant.com
- **Password:** admin123
- **Role:** Kitchen operations

### Changing Passwords

Edit `backend/src/seed/seedAdmin.js`:
```javascript
const password = await bcrypt.hash("YOUR_NEW_PASSWORD", 10);
```

Then run:
```bash
npm run seed-admin
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MONGODB_URI is required"**
```bash
# Check .env file
cat .env | grep MONGODB_URI

# Should output:
# MONGODB_URI=mongodb://localhost:27017/digital-waiter
```

**Error: "Connection timeout"**
```bash
# Check if MongoDB is running
mongosh  # Should connect successfully

# If using Docker:
docker-compose ps  # Check if mongo container is running
```

### Port Already in Use

**Port 5000 (Backend):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Port 5173 (Frontend):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Login Issues

```bash
# Reset credentials
npm run seed-admin

# Verify users exist in database
mongosh
use digital-waiter
db.users.find()
```

### Socket.IO Connection Issues

**Check CORS configuration in .env:**
```env
CLIENT_URL=http://localhost:5173
```

**Browser Console:** Check for connection errors
```javascript
// In browser dev tools
console.log(io);  // Should be the Socket.IO client
```

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t digital-waiter:latest .

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:5000
```

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<strong_random_key>
MONGODB_URI=<production_mongodb_uri>
CLIENT_URL=https://yourdomain.com
PORT=5000
```

### Security Checklist

- [ ] Change JWT_SECRET
- [ ] Change default admin password
- [ ] Use HTTPS (SSL/TLS)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables
- [ ] Database backups enabled
- [ ] Monitoring enabled
- [ ] Error logging configured
- [ ] CSRF protection enabled

### Performance Optimization

- [ ] Enable database indexing
- [ ] Implement pagination
- [ ] Cache API responses
- [ ] Compress assets
- [ ] Use CDN for static files
- [ ] Monitor logs regularly
- [ ] Set up alerts for errors

---

## Support & Documentation

- **API Documentation:** See [API-Documentation.md](docs/API-Documentation.md)
- **User Manual:** See [User-Manual.md](docs/User-Manual.md)
- **Database Schema:** See [collections.md](database/schema/collections.md)
- **Issue Tracking:** Check project repository

---

## License

Digital Waiter System © 2024. All rights reserved.

---

## Contact & Support

For issues, questions, or feature requests, please contact the development team or create an issue in the project repository.
