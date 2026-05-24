/**
 * Centralized order status constants and transition rules.
 * PHASE 5 — Order Lifecycle Validation
 */

const ORDER_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  COOKING: "Cooking",
  READY: "Ready",
  SERVED: "Served",
  PAID: "Paid",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

/**
 * Allowed transitions for each status.
 * Any status NOT listed here cannot be transitioned to.
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.COOKING, ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.COOKING, ORDER_STATUS.READY, ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COOKING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.SERVED]: [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.PAID], // Can transition to Paid if payment is completed after
  [ORDER_STATUS.PAID]: [ORDER_STATUS.COMPLETED], // Can transition to Completed if marked complete after
  [ORDER_STATUS.CANCELLED]: []
};

const isValidTransition = (from, to) => {
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
};

module.exports = { ORDER_STATUS, VALID_TRANSITIONS, isValidTransition };

