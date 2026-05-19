import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

const socketBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");

if (!socketBaseUrl) {
  throw new Error("VITE_API_URL is required for Socket.IO connections.");
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect once, even in strict mode
    const client = io(socketBaseUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
    
    setSocket(client);

    // Forward expense events to window so admin UI can listen globally
    client.on("expense:created", (data) => {
      try { window.dispatchEvent(new CustomEvent("expense:created", { detail: data })); } catch (e) { console.debug("expense event", data); }
    });

    return () => {
      client.off("expense:created");
      client.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
