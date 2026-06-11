require("./utils/dnsHelper");
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const logger = require("./utils/logger");
const env = require("./config/env");

const PORT = env.PORT || 5000;

// Fail-fast if env is invalid: env module already validates and throws

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB(env.MONGODB_URI);
    
    // Create server instance
    const server = http.createServer(app);
    
    // Initialize Socket.IO
    initializeSocket(server);
    
    // Start listening
    const { scheduleNextReset } = require("./services/resetService");
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://127.0.0.1:${PORT}`);
      logger.info(`📍 API: http://127.0.0.1:${PORT}/api`);
      logger.info(`🔌 Socket.IO enabled`);
      logger.info(`🌐 Client URL: ${env.CLIENT_URL}`);
      logger.info(`✅ Environment: ${env.NODE_ENV}`);
      
      // Initialize Background Daily Reset cron/timer
      scheduleNextReset();
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error(`❌ Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

start();
