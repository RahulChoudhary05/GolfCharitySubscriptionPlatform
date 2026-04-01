const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 1, max: 45, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "lapsed", "cancelled"],
      default: "inactive",
    },
    subscriptionType: { type: String, enum: ["monthly", "yearly", null], default: null },
    charitySelected: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    charityPercentage: { type: Number, min: 10, default: 10 },
    scores: { type: [scoreSchema], default: [] },
    winnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
