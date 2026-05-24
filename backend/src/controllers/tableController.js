const Table = require("../models/Table");

const listTables = async (req, res, next) => {
  try {
    res.json(await Table.find().sort({ number: 1 }).populate("activeOrder"));
  } catch (error) {
    next(error);
  }
};

const updateTableStatus = async (req, res, next) => {
  try {
    const { status, activeOrder } = req.body;
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (activeOrder !== undefined) updateFields.activeOrder = activeOrder;

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate("activeOrder");

    const { getIO } = require("../config/socket");
    const io = getIO();
    if (io) {
      io.emit("table:updated", table);
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
};

module.exports = { listTables, updateTableStatus };
