import api from "./api";

export const getQRCodes = () => api.get("/qr");
export const generateQRCodes = () => api.post("/qr/generate");
