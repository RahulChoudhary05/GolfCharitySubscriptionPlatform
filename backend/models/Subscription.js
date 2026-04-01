const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planType: { type: String, enum: ["monthly", "yearly"], required: true },
    status: { type: String, enum: ["active", "inactive", "cancelled", "lapsed"], default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["mock", "stripe"], default: "mock" },
    paymentReference: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
