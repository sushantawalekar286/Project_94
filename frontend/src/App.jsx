import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: "#111827", color: "#fff", border: "1px solid rgba(251,191,36,.25)" },
              success: { iconTheme: { primary: "#f59e0b", secondary: "#111827" } }
            }}
          />
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
