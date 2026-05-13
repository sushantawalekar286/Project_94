const QRCode = require("qrcode");

/**
 * PHASE 3 — Fixed QR Code generator utility
 * 
 * Bug fix: original had no options, generating low-quality QR images.
 * Now accepts options for quality, error correction, and size.
 */
const generateQRCode = async (value, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  };
  return QRCode.toDataURL(value, { ...defaultOptions, ...options });
};

module.exports = generateQRCode;
