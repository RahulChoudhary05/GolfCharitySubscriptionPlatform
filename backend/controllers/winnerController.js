const Winner = require("../models/Winner");

const myWinnings = async (req, res) => {
  const winners = await Winner.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(winners);
};

const listAllWinners = async (req, res) => {
  const winners = await Winner.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .populate("drawId", "drawDate numbersGenerated type");
  res.json(winners);
};

const uploadProof = async (req, res) => {
  const winner = await Winner.findById(req.params.id);
  if (!winner || winner.userId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Winner record not found" });
  }
  const proof = String(req.body.proof || "").trim();
  if (!proof) return res.status(400).json({ message: "Proof is required" });

  winner.proof = proof;
  winner.status = "pending";
  await winner.save();
  res.json(winner);
};

const reviewWinner = async (req, res) => {
  const { status, payoutStatus } = req.body;
  if (status && !["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  if (payoutStatus && !["pending", "paid"].includes(payoutStatus)) {
    return res.status(400).json({ message: "Invalid payout status" });
  }

  const winner = await Winner.findById(req.params.id);
  if (!winner) return res.status(404).json({ message: "Winner not found" });

  if (status) winner.status = status;
  if (payoutStatus) {
    if (payoutStatus === "paid" && winner.status !== "approved") {
      return res.status(400).json({ message: "Winner must be approved before marking as paid" });
    }
    winner.payoutStatus = payoutStatus;
  }

  await winner.save();
  res.json(winner);
};

module.exports = { myWinnings, listAllWinners, uploadProof, reviewWinner };
