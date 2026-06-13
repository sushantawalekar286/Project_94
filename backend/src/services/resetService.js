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
    // 1. First record sales for completed/paid orders that aren't recorded yet
    log("Recording pending sales for completed/paid/served orders...");
    const ordersToRecord = await Order.find({
      status: { $in: ["Completed", "Paid", "Served"] }
    });
    let salesCount = 0;
    for (const order of ordersToRecord) {
      const existing = await Sale.findOne({ order: order._id });
      if (!existing) {
        await Sale.create({
          order: order._id,
          amount: order.subtotal,
          createdAt: order.createdAt
        });
        salesCount++;
      }
    }
    log(`Recorded ${salesCount} sales.`);

    // 2. Run order cleanup job
    log("Running order cleanup job...");
    const { archiveOrdersJob } = require("../jobs/archiveJob");
    const cleanupResult = await archiveOrdersJob();
    if (cleanupResult) {
      log(`Deleted ${cleanupResult.completedDeletedCount} completed orders`);
      log(`Deleted ${cleanupResult.cancelledDeletedCount} cancelled orders`);
      log("\nCleanup completed successfully");
    }

    // 3. Reset table sessions only if they do not have a remaining active order
    log("Resetting vacant or cleared table sessions...");
    const tables = await Table.find({});
    let tablesResetCount = 0;
    for (const table of tables) {
      let shouldReset = true;
      if (table.activeOrder) {
        // Check if the active order still exists in the Order collection
        const activeOrderExists = await Order.exists({ _id: table.activeOrder });
        if (activeOrderExists) {
          shouldReset = false; // Keep table session because it has a remaining active order
        }
      }

      if (shouldReset) {
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
    }
    log(`Reset ${tablesResetCount} vacant or cleared tables.`);
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
