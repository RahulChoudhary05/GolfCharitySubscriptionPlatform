const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw", required: true },
    matchType: { type: Number, enum: [3, 4, 5], required: true },
    proof: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    payoutStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    payoutAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);
