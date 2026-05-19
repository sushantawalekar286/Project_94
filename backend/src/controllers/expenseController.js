const { createExpense, listExpenses, updateExpense, deleteExpense, monthlyTotals, expenseSummary } = require("../services/expenseService");
const { getIO } = require("../config/socket");

const create = async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      category: req.body.category,
      quantity: req.body.quantity,
      amount: req.body.amount,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
      notes: req.body.notes || "",
      createdBy: req.user?.id || null
    };
    const expense = await createExpense(payload);

    // Emit socket event for realtime dashboard
    try {
      const io = getIO();
      if (io) io.to("admin").emit("expense:created", expense);
    } catch (err) {
      console.warn("Socket emit failed for expense: ", err.message);
    }

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const expense = await updateExpense(req.params.id, req.body);
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteExpense(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.start || req.query.end) {
      filter.purchaseDate = {};
      if (req.query.start) filter.purchaseDate.$gte = new Date(req.query.start);
      if (req.query.end) filter.purchaseDate.$lte = new Date(req.query.end);
    }
    const items = await listExpenses(filter);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const monthly = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const results = await monthlyTotals(year, month);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

const summary = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const data = await expenseSummary(year, month);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, update, remove, monthly, summary };
