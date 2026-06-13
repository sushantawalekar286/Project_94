const Order = require("../models/Order");
const logger = require("./logger");

const migrateExistingOrders = async () => {
  try {
    logger.info("Checking for any order item migrations...");
    const orders = await Order.find({});
    let migratedCount = 0;

    for (const order of orders) {
      let modified = false;
      for (const item of order.items) {
        if (item.kitchenStatus === undefined || item.served === undefined) {
          if (item.kitchenStatus === undefined) {
            if (["Ready", "Served", "Paid", "Completed"].includes(order.status)) {
              item.kitchenStatus = "ready";
              item.preparedAt = order.readyAt || order.createdAt;
            } else {
              item.kitchenStatus = "pending";
              item.preparedAt = null;
            }
            modified = true;
          }

          if (item.served === undefined) {
            if (["Served", "Paid", "Completed"].includes(order.status)) {
              item.served = true;
              item.servedAt = order.servedAt || order.createdAt;
            } else {
              item.served = false;
              item.servedAt = null;
            }
            modified = true;
          }
        }
      }

      if (modified) {
        await order.save();
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      logger.info(`Successfully migrated ${migratedCount} existing orders to item status tracking.`);
    } else {
      logger.info("All orders are up-to-date with item status tracking.");
    }
  } catch (error) {
    logger.error(`Migration error: ${error.message}`);
  }
};

module.exports = migrateExistingOrders;
