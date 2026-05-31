import api from "./api";

export const getQRCodes = () => api.get("/qr");
export const generateQRCodes = (count) => api.post("/qr/generate", { count });
