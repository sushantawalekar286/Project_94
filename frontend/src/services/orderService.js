import api from "./api";

export const placeOrder = (payload) => api.post("/orders", payload);
export const getOrders = () => api.get("/orders");
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const getActiveOrderByTable = (tableNumber) => api.get(`/orders/active/table/${tableNumber}`);
export const getCompletedOrdersCount = () => api.get("/orders/completed-count");
