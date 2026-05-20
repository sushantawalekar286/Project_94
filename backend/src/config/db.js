const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MONGODB_URI is required in environment variables");
  }
  
  try {
    console.log("🔄 Connecting to MongoDB...");

    mongoose.connection.on("error", (err) => {
      console.error(`[MONGO ERROR] Connection error: ${err.message}`);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("[MONGO WARN] Connection disconnected");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("[MONGO INFO] Connection reconnected");
    });

    const connection = await mongoose.connect(uri, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(`   Error: ${error.message}`);
    console.error(`   URI: ${uri.split("@")[1] || uri}`);
    throw error;
  }
};

module.exports = connectDB;
