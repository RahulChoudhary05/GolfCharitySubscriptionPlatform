const User = require("../models/User");
const Charity = require("../models/Charity");
const Draw = require("../models/Draw");
const Subscription = require("../models/Subscription");
const Winner = require("../models/Winner");
const { seedShowcaseData } = require("../utils/showcaseSeeder");

const getAnalytics = async (req, res) => {
  const [totalUsers, activeSubs, charities, draws, winners] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Charity.find(),
    Draw.find(),
    Winner.find(),
  ]);
  const totalPrizePool = draws.reduce((acc, d) => acc + d.totalPool, 0);
  const totalDonations = charities.reduce((acc, c) => acc + c.totalDonations, 0);
  res.json({
    totalUsers,
    activeSubs,
    totalPrizePool,
    totalDonations,
    drawsRun: draws.length,
    winnersCount: winners.length,
  });
};

const getUsers = async (req, res) => {
  const users = await User.find().select("-password").populate("charitySelected", "name");
  res.json(users);
};

const seedShowcase = async (req, res) => {
  const reset = req.query.reset === "true";
  const result = await seedShowcaseData({ reset });
  res.status(201).json({ message: "Showcase data generated", ...result });
};

module.exports = { getAnalytics, getUsers, seedShowcase };
