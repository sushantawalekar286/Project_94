const Order = require("../models/Order");
const Sale = require("../models/Sale");
const Table = require("../models/Table");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let isRunning = false;

async function runDailyReset() {
  if (isRunning) {
    console.log("[Daily Reset System] Reset is already running, skipping duplicate execution.");
    return;
  }
  isRunning = true;

  const logDir = path.resolve(__dirname, "../../logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logPath = path.join(logDir, "daily-reset.log");
  const timestamp = new Date().toISOString();

  const log = (msg) => {
    const entry = `[${timestamp}] ${msg}\n`;
    console.log(`[Daily Reset System] ${msg}`);
    try {
      fs.appendFileSync(logPath, entry, "utf8");
    } catch (err) {
      console.error("[Daily Reset System] Failed to write log entry:", err);
    }
  };

  log("=== Starting Daily Reset Job ===");

  try {
    // 1. Archive completed/paid orders using existing reporting logic
    log("Archiving completed/paid orders...");
    const ordersCursor = Order.find({
      status: { $in: ["Completed", "Paid"] }
    }).cursor();

    let archivedCount = 0;
    for (let order = await ordersCursor.next(); order != null; order = await ordersCursor.next()) {
      const existing = await Sale.findOne({ order: order._id });
      if (!existing) {
        await Sale.create({
          order: order._id,
          amount: order.subtotal,
          createdAt: order.createdAt
        });
        archivedCount++;
      }
    }
    log(`Archived ${archivedCount} completed/paid orders to Sales history.`);

    // 2. Clear active operational orders (Pending, Accepted, Cooking, Ready, Served)
    log("Clearing active operational orders...");
    const activeOrdersResult = await Order.deleteMany({
      status: { $in: ["Pending", "Accepted", "Cooking", "Ready", "Served"] }
    });
    log(`Cleared ${activeOrdersResult.deletedCount} active operational orders.`);

    // 3. Clear active table sessions, customer sessions, cart data
    log("Resetting table sessions and QR tokens...");
    const tables = await Table.find({});
    let tablesResetCount = 0;
    for (const table of tables) {
      table.status = "available";
      table.activeOrder = null;
      table.sessionToken = null;
      table.sessionStartedAt = null;
      table.sessionExpiredAt = null;
      table.scannerId = "";
      table.qrId = "";
      table.occupancy = 0;
      table.token = crypto.randomBytes(16).toString("hex");
      await table.save();
      tablesResetCount++;
    }
    log(`Reset ${tablesResetCount} tables and regenerated session tokens.`);
    log("=== Daily Reset Job Completed Successfully ===");
  } catch (error) {
    log(`ERROR: Reset job failed with message: ${error.message}`);
    console.error("[Daily Reset System] Error in daily reset:", error);
    throw error;
  } finally {
    isRunning = false;
  }
}

function getMsUntil9AM() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(9, 0, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

let resetTimeout = null;

function scheduleNextReset() {
  const ms = getMsUntil9AM();
  console.log(`[Daily Reset System] Scheduled next reset in ${(ms / 1000 / 60 / 60).toFixed(2)} hours (at 09:00 AM)`);
  resetTimeout = setTimeout(async () => {
    try {
      await runDailyReset();
    } catch (err) {
      console.error("[Daily Reset System] Scheduled reset failed:", err);
    }
    scheduleNextReset();
  }, ms);
}

module.exports = {
  runDailyReset,
  scheduleNextReset
};
