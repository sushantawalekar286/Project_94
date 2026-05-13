const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Table = require("../models/Table");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const tables = Array.from({ length: 10 }, (_, idx) => ({
    number: idx + 1,
    token: crypto.randomBytes(8).toString("hex")
  }));
  for (const table of tables) {
    await Table.findOneAndUpdate({ number: table.number }, table, { upsert: true, new: true });
  }
  await mongoose.disconnect();
};

run();
