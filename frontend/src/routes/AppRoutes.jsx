import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import CustomerLayout from "../layouts/CustomerLayout";
import ChefLayout from "../layouts/ChefLayout";
import AdminLayout from "../layouts/AdminLayout";
import ScanPage from "../pages/customer/ScanPage";
import MenuPage from "../pages/customer/MenuPage";
import CartPage from "../pages/customer/CartPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import OrderTrackingPage from "../pages/customer/OrderTrackingPage";
import ChefDashboard from "../pages/chef/ChefDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import MenuManagement from "../pages/admin/MenuManagement";
import InventoryManagement from "../pages/admin/InventoryManagement";
import OrdersManagement from "../pages/admin/OrdersManagement";
import SalesReports from "../pages/admin/SalesReports";
import QRManagement from "../pages/admin/QRManagement";
import LoginPage from "../pages/auth/LoginPage";

export default function AppRoutes() {
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
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute roles={["admin"]}><AdminLayout><MenuManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute roles={["admin"]}><AdminLayout><InventoryManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminLayout><OrdersManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><AdminLayout><SalesReports /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/qr" element={<ProtectedRoute roles={["admin"]}><AdminLayout><QRManagement /></AdminLayout></ProtectedRoute>} />
    </Routes>
  );
}
