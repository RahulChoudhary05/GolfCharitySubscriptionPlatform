const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema(
  {
    drawDate: { type: Date, required: true },
    numbersGenerated: { type: [Number], required: true },
    type: { type: String, enum: ["random", "algorithmic"], default: "random" },
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Winner" }],
    isPublished: { type: Boolean, default: false },
    totalPool: { type: Number, default: 0 },
    rolloverAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Draw", drawSchema);
