const Expense = require("../models/Expense");

const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

const listExpenses = async (filter = {}) => {
  return Expense.find(filter).sort({ purchaseDate: -1 }).lean();
};

const updateExpense = async (id, data) => {
  const updated = await Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) throw Object.assign(new Error("Expense not found"), { statusCode: 404 });
  return updated;
};

const deleteExpense = async (id) => {
  const removed = await Expense.findByIdAndDelete(id);
  if (!removed) throw Object.assign(new Error("Expense not found"), { statusCode: 404 });
  return removed;
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

const expenseSummary = async (year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [monthlyAgg, weeklyAgg, todayAgg, byDay, recent] = await Promise.all([
    Expense.aggregate([{ $match: { purchaseDate: { $gte: startOfMonth, $lt: startOfNextMonth } } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Expense.aggregate([{ $match: { purchaseDate: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Expense.aggregate([{ $match: { purchaseDate: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Expense.aggregate([
      { $match: { purchaseDate: { $gte: startOfMonth, $lt: startOfNextMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Expense.find({ purchaseDate: { $gte: startOfMonth, $lt: startOfNextMonth } }).sort({ purchaseDate: -1 }).limit(5).lean()
  ]);

  return {
    monthTotal: monthlyAgg[0]?.total || 0,
    weekTotal: weeklyAgg[0]?.total || 0,
    todayTotal: todayAgg[0]?.total || 0,
    monthlySeries: byDay,
    recent
  };
};

module.exports = { createExpense, listExpenses, updateExpense, deleteExpense, monthlyTotals, expenseSummary };
