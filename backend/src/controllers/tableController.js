const Table = require("../models/Table");

const listTables = async (req, res, next) => {
  try {
    res.json(await Table.find().sort({ number: 1 }));
  } catch (error) {
    next(error);
  }
};

module.exports = { listTables };
