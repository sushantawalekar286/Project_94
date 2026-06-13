import api from "./api";

export const placeOrder = (payload) => api.post("/orders", payload);
export const getOrders = () => api.get("/orders");
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const updateOrderItemStatus = (id, itemIndex, payload) => api.patch(`/orders/${id}/items/${itemIndex}/status`, payload);
export const getActiveOrderByTable = (tableNumber) => api.get(`/orders/active/table/${tableNumber}`);
export const getCompletedOrdersCount = () => api.get("/orders/completed-count");
export const cancelOrder = (id, reason) => api.post(`/orders/${id}/cancel`, { reason });
export const cancelOrderItem = (id, itemId, reason) => api.post(`/orders/${id}/items/${itemId}/cancel`, { reason });
