import api from "./api";

export const getMenu = () => api.get("/menu");
export const createMenuItem = (payload) => api.post("/menu", payload);
export const updateMenuItem = (id, payload) => api.put(`/menu/${id}`, payload);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
export const getCategories = () => api.get("/categories");
export const createCategory = (payload) => api.post("/categories", payload);
