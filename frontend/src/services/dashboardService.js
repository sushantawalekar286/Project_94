import api from "./api";

export const getTodayDashboardStats = () => api.get("/dashboard/today");
