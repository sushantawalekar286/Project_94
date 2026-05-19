import api from "./api";

export const getMonthlyExpenses = (opts = {}) => api.get(`/expenses/monthly`, { params: opts });
export const listExpenses = (opts = {}) => api.get(`/expenses`, { params: opts });
export const createExpense = (payload) => api.post(`/expenses`, payload);
