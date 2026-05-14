const { Server } = require("socket.io");
const env = require("./env");

let io;

const initializeSocket = (server) => {
  if (!env.CLIENT_URL) {
    throw new Error('CLIENT_URL is required for Socket.IO CORS configuration');
  }

  io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.on("join:chef", () => socket.join("chef"));
    socket.on("join:admin", () => socket.join("admin"));
    socket.on("join:order", (orderId) => socket.join(`order:${orderId}`));
    socket.on("disconnect", () => {});
  });

  return io;
};

const getIO = () => io;

module.exports = { initializeSocket, getIO };
