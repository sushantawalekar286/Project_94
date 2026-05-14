/**
 * Centralized order status constants and transition rules.
 * Complete order lifecycle with payment tracking.
 */

const ORDER_STATUS = {
  PENDING: "Pending",      // Customer placed order, waiting for kitchen acceptance
  ACCEPTED: "Accepted",    // Kitchen accepted the order
  COOKING: "Cooking",      // Chef is actively cooking
  READY: "Ready",          // Order ready for pickup/serving
  SERVED: "Served",        // Waiter served the order
  PAID: "Paid",            // Payment received
  COMPLETED: "Completed",  // Order fully completed
  CANCELLED: "Cancelled"   // Order cancelled
};

/**
 * Allowed transitions for each status.
 * Any status NOT listed here cannot be transitioned to.
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.COOKING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COOKING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED],
  [ORDER_STATUS.SERVED]: [ORDER_STATUS.PAID],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],   // terminal state
  [ORDER_STATUS.CANCELLED]: []    // terminal state
};

const isValidTransition = (from, to) => {
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
};

module.exports = { ORDER_STATUS, VALID_TRANSITIONS, isValidTransition };
