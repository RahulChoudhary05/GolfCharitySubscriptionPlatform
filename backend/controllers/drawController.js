const Draw = require("../models/Draw");
const User = require("../models/User");
const Winner = require("../models/Winner");
const Subscription = require("../models/Subscription");
const { getRandomNumbers, getAlgorithmicNumbers, matchCount } = require("../utils/drawEngine");

const PRIZE_POOL_RATE = 0.35;

const getPublishedDrawThisMonth = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return Draw.findOne({
    isPublished: true,
    drawDate: { $gte: monthStart, $lt: monthEnd },
  });
};

const getLatestRollover = async () => {
  const previousDraw = await Draw.findOne({ isPublished: true }).sort({ drawDate: -1 }).select("rolloverAmount");
  return previousDraw?.rolloverAmount || 0;
};

const getCurrentPrizePool = async () => {
  const activeSubscriptions = await Subscription.find({ status: "active" }).select("amount");
  const gross = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
  return Number((gross * PRIZE_POOL_RATE).toFixed(2));
};

const runDraw = async (req, res) => {
  const { type = "random", simulate = true } = req.body;
  if (!["random", "algorithmic", "auto"].includes(type)) {
    return res.status(400).json({ message: "Draw type must be random, algorithmic, or auto" });
  }

  if (!simulate) {
    const alreadyPublished = await getPublishedDrawThisMonth();
    if (alreadyPublished) {
      return res.status(200).json({
        message: "A draw is already published for this month",
        alreadyPublished: true,
        draw: alreadyPublished,
      });
    }
  }

  const users = await User.find({ subscriptionStatus: "active" });
  const resolvedType =
    type === "auto" ? (users.some((u) => (u.scores || []).length >= 5) ? "algorithmic" : "random") : type;
  const numbersGenerated = resolvedType === "algorithmic" ? getAlgorithmicNumbers(users) : getRandomNumbers();
  const totalPool = await getCurrentPrizePool();
  const previousRollover = await getLatestRollover();

  const pools = {
    5: Number((totalPool * 0.4 + previousRollover).toFixed(2)),
    4: Number((totalPool * 0.35).toFixed(2)),
    3: Number((totalPool * 0.25).toFixed(2)),
  };

  const bucket = { 3: [], 4: [], 5: [] };
  users.forEach((u) => {
    const matches = matchCount(numbersGenerated, u.scores);
    if (matches >= 3) bucket[matches].push(u);
  });

  const nextRollover = bucket[5].length ? 0 : pools[5];

  if (simulate) {
    return res.json({
      numbersGenerated,
      winners: bucket,
      pools,
      type: resolvedType,
      previousRollover,
      nextRollover,
      simulated: true,
    });
  }

  const draw = await Draw.create({
    drawDate: new Date(),
    numbersGenerated,
    type: resolvedType,
    totalPool,
    rolloverAmount: nextRollover,
    isPublished: true,
  });

  const winnerDocs = [];
  for (const matchType of [3, 4, 5]) {
    const winners = bucket[matchType];
    const split = winners.length ? pools[matchType] / winners.length : 0;
    for (const user of winners) {
      const winner = await Winner.create({ userId: user._id, drawId: draw._id, matchType, payoutAmount: split });
      winnerDocs.push(winner._id);
      user.winnings += split;
      await user.save();
    }
  }

  draw.winners = winnerDocs;
  await draw.save();
  res.status(201).json({ ...draw.toObject(), previousRollover, nextRollover });
};

const getDrawResults = async (req, res) => {
  const draws = await Draw.find({ isPublished: true }).sort({ drawDate: -1 }).populate({
    path: "winners",
    populate: { path: "userId", select: "name email" },
  });
  res.json(draws);
};

module.exports = { runDraw, getDrawResults };
