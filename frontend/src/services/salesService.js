import api from "./api";

export const getDailySales = () => api.get("/sales/daily");
export const getMonthlySales = () => api.get("/sales/monthly");
export const getDashboardStats = () => api.get("/sales/dashboard");
export const getTopItems = (limit = 5) => api.get(`/sales/top-items?limit=${limit}`);
export const getRevenueTimeline = (days = 7) => api.get(`/sales/timeline?days=${days}`);
