// models/AttemptCounter.js
const mongoose = require("mongoose");

const attemptCounterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  count: { type: Number, default: 0 },
});

attemptCounterSchema.index({ user: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model("AttemptCounter", attemptCounterSchema);
