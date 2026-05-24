const dns = require("dns");

try {
  // Use public DNS resolvers to handle SRV record lookups for MongoDB Atlas
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  console.log("[DNS INFO] Configured public DNS resolvers for Atlas connectivity.");
} catch (e) {
  console.warn("[DNS WARN] Failed to set public DNS servers, using system default:", e.message);
}
