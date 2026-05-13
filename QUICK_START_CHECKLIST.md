# Digital Waiter System - Quick Start Verification Checklist

## Pre-Flight Checklist ✓

### 1. System Requirements
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] MongoDB available (local or Docker)
- [ ] Git installed (optional but recommended)

### 2. Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] `frontend/.env.local` created from `frontend/.env.example`
- [ ] `MONGODB_URI` set correctly in `.env`
- [ ] `JWT_SECRET` set to a strong random value
- [ ] `CLIENT_URL` set to `http://localhost:5173`
- [ ] `VITE_API_URL` set to `http://localhost:5000/api`

### 3. Dependencies
- [ ] `npm install` completed at root
- [ ] `npm run install-all` completed (installs backend + frontend)
- [ ] No dependency errors in console
- [ ] `node_modules` directory present

### 4. Database
- [ ] MongoDB is running locally or via Docker
- [ ] Can connect with `mongosh` command
- [ ] Database `digital-waiter` can be accessed
- [ ] Seed data created: `npm run seed-admin`

### 5. Backend
- [ ] `backend/src/server.js` exists and is readable
- [ ] All model files in `backend/src/models/` are present
- [ ] All route files in `backend/src/routes/` are present
- [ ] Auth middleware configured
- [ ] CORS headers configured

### 6. Frontend
- [ ] `frontend/src/App.jsx` exists and is readable
- [ ] All context providers set up
- [ ] `frontend/src/styles/index.css` has all utilities
- [ ] `frontend/tailwind.config.js` is enhanced
- [ ] Routes configuration in place

### 7. Documentation
- [ ] `ADMIN_CHEF_CREDENTIALS.md` created
- [ ] `CONNECTIVITY_DATABASE_GUIDE.md` created
- [ ] `SETUP_DEPLOYMENT_GUIDE.md` created
- [ ] `IMPLEMENTATION_SUMMARY.md` created
- [ ] `.env.example` in root
- [ ] `frontend/.env.example` in frontend

---

## Quick Start Commands

### Initial Setup (First Time Only)
```bash
# 1. Navigate to project
cd 94project

# 2. Install dependencies
npm install
npm run install-all

# 3. Create environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 4. Seed database
npm run seed-admin
```

### Start Development (Every Time)
```bash
# Option A: Run both backend and frontend together
npm run dev

# Option B: Run backend and frontend separately
# Terminal 1:
npm run server

# Terminal 2:
npm run client
```

### Access Application
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
Health Check: http://localhost:5000/health
```

---

## Test Credentials

**Admin Account**
```
Email: admin@restaurant.com
Password: admin123
Access: Full system access
```

**Chef Account**
```
Email: chef@restaurant.com
Password: admin123
Access: Kitchen operations
```

---

## API Endpoints Quick Reference

```
GET    /health                    - Health check
GET    /api                       - API info

Authentication:
POST   /api/auth/login
POST   /api/auth/register (admin-only)

Menu:
GET    /api/menu
POST   /api/menu (admin)
PUT    /api/menu/:id (admin)
DELETE /api/menu/:id (admin)

Categories:
GET    /api/categories
POST   /api/categories (admin)
PUT    /api/categories/:id (admin)

Orders:
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id (chef/admin)

Inventory:
GET    /api/inventory
POST   /api/inventory (admin)
PUT    /api/inventory/:id (admin)

Tables:
GET    /api/tables
POST   /api/tables (admin)

QR Codes:
POST   /api/qr/generate

Sales:
GET    /api/sales
```

---

## File Locations Reference

**Configuration Files:**
- Root `.env` → Backend configuration
- `frontend/.env.local` → Frontend configuration
- `backend/src/config/db.js` → Database connection
- `frontend/vite.config.js` → Vite configuration
- `frontend/tailwind.config.js` → Tailwind customization

**Key Source Files:**
- `backend/src/server.js` → Server entry point
- `backend/src/app.js` → Express app setup
- `frontend/src/App.jsx` → Frontend entry
- `frontend/src/main.jsx` → React entry point

**Documentation Files:**
- `ADMIN_CHEF_CREDENTIALS.md` → Credential management
- `CONNECTIVITY_DATABASE_GUIDE.md` → Database documentation
- `SETUP_DEPLOYMENT_GUIDE.md` → Setup instructions
- `IMPLEMENTATION_SUMMARY.md` → What's been implemented

---

## Troubleshooting Quick Reference

### "Port Already in Use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### "MongoDB Connection Failed"
```bash
# Check if MongoDB is running
mongosh

# Check connection string in .env
cat .env | grep MONGODB_URI

# For Docker
docker-compose up -d
```

### "Cannot find module X"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend && npm install

# For frontend
cd frontend && npm install
```

### "Frontend can't connect to backend"
```bash
# Check backend is running
curl http://localhost:5000/health

# Check CORS configuration
# Verify CLIENT_URL in .env = http://localhost:5173
# Verify VITE_API_URL in frontend/.env.local = http://localhost:5000/api
```

---

## Feature Verification Checklist

### Backend Features
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Health endpoint responds
- [ ] API info endpoint lists all routes
- [ ] JWT authentication working
- [ ] Admin login successful
- [ ] Chef login successful
- [ ] Socket.IO connection established

### Frontend Features
- [ ] Frontend loads without errors
- [ ] Login page displays
- [ ] Login with admin credentials works
- [ ] Menu page shows items
- [ ] Shopping cart works
- [ ] Order submission successful
- [ ] Real-time order tracking works
- [ ] Responsive design works on mobile

### Database Features
- [ ] Users collection exists with admin/chef
- [ ] Menu items collection populated
- [ ] Orders can be created and stored
- [ ] Inventory tracks stock levels
- [ ] Tables created with QR codes
- [ ] Sales transactions recorded

---

## Performance Optimization Checklist

- [ ] Database indexes created
- [ ] Socket.IO compression enabled
- [ ] Frontend build optimized
- [ ] API response times < 200ms
- [ ] Database queries use projections
- [ ] Image sizes optimized
- [ ] Unused code removed

---

## Security Verification Checklist

- [ ] JWT_SECRET changed from default
- [ ] Passwords hashed with bcrypt
- [ ] CORS origin validated
- [ ] Input validation with Joi
- [ ] Role-based access control working
- [ ] Admin-only endpoints protected
- [ ] Environment variables not logged
- [ ] Database authentication enabled

---

## Deployment Preparation Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL/HTTPS configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] Database indexes optimized
- [ ] Frontend build tested
- [ ] API endpoints tested
- [ ] Security audit completed

---

## Common npm Commands

```bash
# Root level
npm install              # Install root dependencies
npm run install-all      # Install backend + frontend
npm run dev             # Run backend + frontend together
npm run server          # Run backend only
npm run client          # Run frontend only
npm run seed-admin      # Create admin and chef users
npm run seed-all        # Seed all initial data

# Backend (cd backend)
npm run dev             # Development with nodemon
npm run start           # Production mode
npm run seed            # Seed admin users

# Frontend (cd frontend)
npm run dev             # Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## Environment Variables Summary

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/digital-waiter
JWT_SECRET=<strong_random_string>
CLIENT_URL=http://localhost:5173
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_LOGGING=true
VITE_THEME_MODE=dark
```

---

## Log Output Indicators

### Success Indicators (Backend)
```
✅ Server running on http://localhost:5000
📍 API: http://localhost:5000/api
🔌 Socket.IO enabled
✅ MongoDB connected: localhost
```

### Success Indicators (Frontend)
```
 VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## When Something Goes Wrong

1. **Check Console Errors**
   - Frontend: Browser DevTools (F12)
   - Backend: Terminal where npm run dev was executed

2. **Verify Environment Variables**
   ```bash
   # Backend
   cat .env | grep -E "MONGODB|JWT|CLIENT"
   
   # Frontend
   cat frontend/.env.local | grep VITE_
   ```

3. **Test Connectivity**
   ```bash
   # MongoDB
   mongosh mongodb://localhost:27017/digital-waiter
   
   # Backend
   curl http://localhost:5000/health
   
   # Frontend
   open http://localhost:5173
   ```

4. **Review Documentation**
   - SETUP_DEPLOYMENT_GUIDE.md for installation issues
   - CONNECTIVITY_DATABASE_GUIDE.md for database issues
   - ADMIN_CHEF_CREDENTIALS.md for authentication issues

5. **Clear Cache and Reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run install-all
   ```

---

## Support Resources

- **Setup Help:** SETUP_DEPLOYMENT_GUIDE.md
- **Database Help:** CONNECTIVITY_DATABASE_GUIDE.md
- **Credentials Help:** ADMIN_CHEF_CREDENTIALS.md
- **API Help:** docs/API-Documentation.md
- **User Guide:** docs/User-Manual.md

---

## Getting Help

If something doesn't work:

1. Check the relevant documentation file
2. Review error messages in console
3. Verify environment variables
4. Ensure all dependencies installed
5. Check MongoDB is running
6. Restart the development server
7. Clear cache and reinstall if needed

---

## Project Status

✅ Backend: Ready
✅ Frontend: Ready
✅ Database: Ready
✅ Documentation: Ready
✅ Security: Configured
✅ Real-time: Enabled

**Status: Ready for Development**

---

## Next Steps

1. Complete the pre-flight checklist above
2. Run quick start commands
3. Verify all features are working
4. Start development!

```bash
cd 94project
npm install && npm run install-all
npm run seed-admin
npm run dev
```

Then visit: http://localhost:5173

---

**Last Updated:** May 12, 2026
**Version:** 1.0.0
**Status:** ✅ Production-Ready
