const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesRoutes = require("./routes/salesRoutes");
const qrRoutes = require("./routes/qrRoutes");
const tableRoutes = require("./routes/tableRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// PHASE 6 — Security Middleware

// 1. Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"],
    }
  }
}));

// 2. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 3. Data sanitization against XSS
app.use(xss());

// 3. CORS configuration
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
}));

// 4. Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: { success: false, message: "Too many requests from this IP, please try again in 15 minutes." }
});
app.use("/api", limiter);

// Standard Middleware
app.use(express.json({ limit: "10mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/tables", tableRoutes);

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Digital Waiter System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      menu: "/api/menu",
      categories: "/api/categories",
      orders: "/api/orders",
      inventory: "/api/inventory",
      sales: "/api/sales",
      qr: "/api/qr",
      tables: "/api/tables"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
