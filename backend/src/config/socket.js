const { Server } = require("socket.io");

let io;

const initializeSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: { origin: clientUrl || "*", credentials: true }
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
