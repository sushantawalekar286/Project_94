import api from "./api";

export const getMonthlyExpenses = (opts = {}) => api.get(`/expenses/monthly`, { params: opts });
export const getExpenseSummary = (opts = {}) => api.get(`/expenses/summary`, { params: opts });
export const listExpenses = (opts = {}) => api.get(`/expenses`, { params: opts });
export const createExpense = (payload) => api.post(`/expenses`, payload);
export const updateExpense = (id, payload) => api.put(`/expenses/${id}`, payload);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
