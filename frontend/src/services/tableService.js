import api from "./api";

export const getTables = () => api.get("/tables");
export const updateTableStatus = (id, status, activeOrder = undefined) => 
  api.patch(`/tables/${id}/status`, { status, activeOrder });
