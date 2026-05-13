# Digital Waiter System - Admin & Chef Credentials

## Default Credentials Created by Seed Script

The system comes with pre-configured admin and chef accounts. These are created when you run the seed script.

### Admin Account
- **Email:** admin@restaurant.com
- **Password:** admin123
- **Role:** Admin (Full system access)
- **Permissions:** 
  - View/Edit Menu Items
  - Manage Categories
  - Manage Inventory
  - View Sales Reports
  - Generate QR Codes
  - Manage Tables
  - View All Orders

### Chef Account
- **Email:** chef@restaurant.com
- **Password:** admin123
- **Role:** Chef (Kitchen management only)
- **Permissions:**
  - View Orders (assigned to chef)
  - Update Order Status
  - View Current Kitchen Queue
  - Mark Orders as Ready/Completed

---

## How to Change Passwords

### Option 1: Modify Seed Script (Recommended)
Edit `backend/src/seed/seedAdmin.js`:

```javascript
const password = await bcrypt.hash("YOUR_NEW_PASSWORD", 10);
```

Then run:
```bash
cd backend
node src/seed/seedAdmin.js
```

### Option 2: Via Database (MongoDB)
Connect to MongoDB and update the User collection:
```javascript
use digital-waiter
db.users.updateOne(
  { email: "admin@restaurant.com" },
  { $set: { password: bcryptHashedPassword } }
)
```

### Option 3: Through Application (Future)
Once user management UI is implemented, admins can change passwords through the admin dashboard.

---

## Security Recommendations

1. **Change Default Passwords** in production
2. **Update JWT_SECRET** in .env file to a strong random string
3. **Use HTTPS** in production
4. **Enable rate limiting** on login endpoint
5. **Implement password reset** functionality
6. **Add 2FA** for admin accounts

---

## How to Run Seed Script

```bash
# From project root
npm run seed-admin

# Or manually:
cd backend
npm install (if needed)
node src/seed/seedAdmin.js
```

---

## Troubleshooting

**Issue:** Seeds don't work
- Verify MongoDB is running (docker-compose up -d)
- Check .env has MONGODB_URI set
- Run: `node backend/src/seed/seedAdmin.js`

**Issue:** Can't login with credentials
- Verify user exists: `db.users.find({ email: "admin@restaurant.com" })`
- Recreate user with seed script
- Check password hasn't been changed

**Issue:** Forgot password
- Connect to MongoDB and delete the user
- Run seed script again to recreate

---

## File Locations

- **Seed Script:** `backend/src/seed/seedAdmin.js`
- **User Model:** `backend/src/models/User.js`
- **Auth Controller:** `backend/src/controllers/authController.js`
- **Auth Service:** `backend/src/services/authService.js`

---

## Security Implementation Details

- Passwords are hashed using bcryptjs with 10 salt rounds
- Never stored as plain text
- Only selected from database when needed for verification
- JWT tokens used for API authentication
- Role-based access control (RBAC) enforced on all endpoints
