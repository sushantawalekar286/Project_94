/**
 * Centralized API response helpers.
 * PHASE 9 — Code Quality Improvements
 */

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const created = (res, data) => success(res, data, 201);

const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

const notFound = (res, message = "Resource not found") => error(res, message, 404);
const badRequest = (res, message) => error(res, message, 400);
const forbidden = (res, message = "Forbidden") => error(res, message, 403);
const unauthorized = (res, message = "Unauthorized") => error(res, message, 401);

module.exports = { success, created, error, notFound, badRequest, forbidden, unauthorized };
