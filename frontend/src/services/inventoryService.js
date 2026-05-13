import api from "./api";

export const getInventory = () => api.get("/inventory");
export const updateInventory = (id, payload) => api.patch(`/inventory/${id}`, payload);
