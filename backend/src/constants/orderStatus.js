/**
 * Centralized order status constants and transition rules.
 * PHASE 5 — Order Lifecycle Validation
 */

const ORDER_STATUS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

/**
 * Allowed transitions for each status.
 * Any status NOT listed here cannot be transitioned to.
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED],
  [ORDER_STATUS.SERVED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],   // terminal state
  [ORDER_STATUS.CANCELLED]: []    // terminal state
};

const isValidTransition = (from, to) => {
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
};

module.exports = { ORDER_STATUS, VALID_TRANSITIONS, isValidTransition };
