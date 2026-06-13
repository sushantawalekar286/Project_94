const Order = require("../models/Order");

const archiveOrdersJob = async () => {
  console.log("[CRON JOB] Starting daily order cleanup...");
  try {
    // Count the types of orders before deleting
    const completedCount = await Order.countDocuments({ status: { $in: ["Completed", "Paid"] } });
    const servedCount = await Order.countDocuments({ status: "Served" });
    const cancelledCount = await Order.countDocuments({ status: "Cancelled" });

    // Perform hard delete from Orders collection
    const deleteResult = await Order.deleteMany({
      status: { $in: ["Served", "Completed", "Paid", "Cancelled"] }
    });

    console.log(`Deleted ${completedCount + servedCount} completed orders`);
    console.log(`Deleted ${cancelledCount} cancelled orders`);
    console.log("\nCleanup completed successfully");
    
    return {
      completedDeletedCount: completedCount + servedCount,
      cancelledDeletedCount: cancelledCount
    };
  } catch (error) {
    console.error("[CRON JOB] Error during order daily cleanup:", error);
    throw error;
  }
};

const initArchiveCron = () => {
  // Keeping as a no-op since resetService manages scheduling sequentially
  console.log("⏰ Daily Order Cleanup cron job managed via resetService");
};

module.exports = {
  archiveOrdersJob,
  initArchiveCron
};
