import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import CustomerLayout from "../layouts/CustomerLayout";
import ChefLayout from "../layouts/ChefLayout";
import AdminLayout from "../layouts/AdminLayout";
import ScanPage from "../pages/customer/ScanPage";
import MenuPage from "../pages/customer/MenuPage";
import CartPage from "../pages/customer/CartPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import OrderTrackingPage from "../pages/customer/OrderTrackingPage";
import ChefDashboard from "../pages/chef/ChefDashboard";
import WaiterDashboard from "../pages/waiter/WaiterDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import MenuManagement from "../pages/admin/MenuManagement";
import ExpensesDashboard from "../pages/admin/ExpensesDashboard";
import OrdersManagement from "../pages/admin/OrdersManagement";
import SalesReports from "../pages/admin/SalesReports";
import QRManagement from "../pages/admin/QRManagement";
import LoginPage from "../pages/auth/LoginPage";

export default function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const staffRoles = ["admin", "chef", "waiter"];
      if (staffRoles.includes(user.role)) {
        const customerPaths = ["/scan", "/table", "/customer"];
        const isCustomerPath = customerPaths.some(p => location.pathname.startsWith(p)) || location.pathname === "/" || location.pathname === "/login";
        if (isCustomerPath) {
          const destination = user.role === "admin"
            ? "/admin"
            : user.role === "chef"
              ? "/chef"
              : "/waiter";
          navigate(destination, { replace: true });
        }
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/scan" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/scan" element={<CustomerLayout><ScanPage /></CustomerLayout>} />
      <Route path="/table/:tableId" element={<CustomerLayout><MenuPage /></CustomerLayout>} />
      <Route path="/customer/menu" element={<CustomerLayout><MenuPage /></CustomerLayout>} />
      <Route path="/customer/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
      <Route path="/customer/success" element={<CustomerLayout><OrderSuccessPage /></CustomerLayout>} />
      <Route path="/customer/tracking" element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />
      <Route path="/chef" element={<ProtectedRoute roles={["chef", "admin"]}><ChefLayout><ChefDashboard /></ChefLayout></ProtectedRoute>} />
      <Route path="/waiter" element={<ProtectedRoute roles={["waiter", "admin"]}><WaiterDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute roles={["admin"]}><AdminLayout><MenuManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/expenses" element={<ProtectedRoute roles={["admin"]}><AdminLayout><ExpensesDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminLayout><OrdersManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><AdminLayout><SalesReports /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/qr" element={<ProtectedRoute roles={["admin"]}><AdminLayout><QRManagement /></AdminLayout></ProtectedRoute>} />
    </Routes>
  );
}
