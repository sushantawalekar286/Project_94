const Expense = require("../models/Expense");

const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

const listExpenses = async (filter = {}) => {
  return Expense.find(filter).sort({ purchaseDate: -1 }).lean();
};

const monthlyTotals = async (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const results = await Expense.aggregate([
    { $match: { purchaseDate: { $gte: start, $lt: end } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return results;
};

module.exports = { createExpense, listExpenses, monthlyTotals };
