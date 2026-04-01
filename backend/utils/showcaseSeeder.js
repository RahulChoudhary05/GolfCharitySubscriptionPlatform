const bcrypt = require("bcryptjs");
const Charity = require("../models/Charity");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Score = require("../models/Score");
const Draw = require("../models/Draw");
const Winner = require("../models/Winner");

const charitySeed = [
  {
    name: "Birdies For Education",
    description: "Scholarships and digital learning support for underserved students.",
    events: ["Scholarship Golf Day", "Laptop Donation Match"],
  },
  {
    name: "Clean Water Drive",
    description: "Builds safe drinking water systems through local community partnerships.",
    events: ["Water Impact Open", "Rural Well Build Week"],
  },
  {
    name: "Mental Wellness United",
    description: "Provides counseling, crisis support, and awareness campaigns for youth.",
    events: ["Mind Matters Invitational", "Mental Health Awareness Walk"],
  },
];

const userSeed = [
  {
    name: "Platform Admin",
    email: "admin@golfcharity.com",
    password: "Admin@123",
    role: "admin",
    charityPercentage: 10,
    subscriptionStatus: "active",
    subscriptionType: "yearly",
    planAmount: 499,
    planType: "yearly",
    scoreSet: [41, 39, 37, 35, 34],
  },
  {
    name: "Aarav Mehta",
    email: "aarav@example.com",
    password: "User@123",
    role: "user",
    charityPercentage: 15,
    subscriptionStatus: "active",
    subscriptionType: "monthly",
    planAmount: 49,
    planType: "monthly",
    scoreSet: [36, 34, 33, 32, 29],
  },
  {
    name: "Sara Khan",
    email: "sara@example.com",
    password: "User@123",
    role: "user",
    charityPercentage: 20,
    subscriptionStatus: "active",
    subscriptionType: "yearly",
    planAmount: 499,
    planType: "yearly",
    scoreSet: [39, 38, 36, 33, 31],
  },
  {
    name: "Rohan Verma",
    email: "rohan@example.com",
    password: "User@123",
    role: "user",
    charityPercentage: 12,
    subscriptionStatus: "lapsed",
    subscriptionType: "monthly",
    planAmount: 49,
    planType: "monthly",
    scoreSet: [30, 27, 26, 25, 22],
  },
];

const getRollingScoreDates = () => {
  const now = new Date();
  return [0, 7, 14, 21, 28].map((daysBack) => {
    const date = new Date(now);
    date.setDate(now.getDate() - daysBack);
    return date;
  });
};

const createOrUpdateUser = async (payload, charityId) => {
  const email = payload.email.toLowerCase();
  const existing = await User.findOne({ email });
  const hash = await bcrypt.hash(payload.password, 10);

  if (existing) {
    existing.name = payload.name;
    existing.password = hash;
    existing.role = payload.role;
    existing.charitySelected = charityId;
    existing.charityPercentage = payload.charityPercentage;
    existing.subscriptionStatus = payload.subscriptionStatus;
    existing.subscriptionType = payload.subscriptionType;
    await existing.save();
    return existing;
  }

  return User.create({
    name: payload.name,
    email,
    password: hash,
    role: payload.role,
    charitySelected: charityId,
    charityPercentage: payload.charityPercentage,
    subscriptionStatus: payload.subscriptionStatus,
    subscriptionType: payload.subscriptionType,
  });
};

const upsertSubscription = async (user, payload) => {
  const existing = await Subscription.findOne({ userId: user._id }).sort({ createdAt: -1 });
  const startDate = new Date();
  const endDate = new Date(startDate);

  if (payload.planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
  else endDate.setMonth(endDate.getMonth() + 1);

  if (payload.subscriptionStatus === "lapsed") {
    endDate.setMonth(endDate.getMonth() - 2);
  }

  if (existing) {
    existing.planType = payload.planType;
    existing.status = payload.subscriptionStatus;
    existing.amount = payload.planAmount;
    existing.startDate = startDate;
    existing.endDate = endDate;
    await existing.save();
    return existing;
  }

  return Subscription.create({
    userId: user._id,
    planType: payload.planType,
    status: payload.subscriptionStatus,
    startDate,
    endDate,
    amount: payload.planAmount,
  });
};

const upsertScores = async (user, payload) => {
  const dates = getRollingScoreDates();
  const scores = payload.scoreSet.map((score, index) => ({ score, date: dates[index] }));
  user.scores = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  await user.save();

  await Score.deleteMany({ userId: user._id });
  await Score.insertMany(
    scores.map((entry) => ({
      userId: user._id,
      score: entry.score,
      date: entry.date,
    }))
  );
};

const buildDraws = async (activeUsers) => {
  const existingCount = await Draw.countDocuments();
  if (existingCount >= 2 || activeUsers.length < 2) return { drawsCreated: 0, winnersCreated: 0 };

  const drawData = [
    {
      drawDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 5),
      numbersGenerated: [39, 36, 34, 33, 29],
      type: "algorithmic",
      totalPool: 1200,
      rolloverAmount: 0,
    },
    {
      drawDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 5),
      numbersGenerated: [41, 38, 35, 32, 27],
      type: "random",
      totalPool: 1400,
      rolloverAmount: 0,
    },
  ];

  let winnersCreated = 0;

  for (const payload of drawData) {
    const draw = await Draw.create({
      ...payload,
      isPublished: true,
      winners: [],
    });

    const primaryWinner = activeUsers[0];
    const secondaryWinner = activeUsers[1];

    const winnerOne = await Winner.create({
      userId: primaryWinner._id,
      drawId: draw._id,
      matchType: 4,
      payoutAmount: payload.totalPool * 0.35,
      status: "approved",
      payoutStatus: "paid",
      proof: "https://example.com/mock-proof/scorecard-1.png",
    });

    const winnerTwo = await Winner.create({
      userId: secondaryWinner._id,
      drawId: draw._id,
      matchType: 3,
      payoutAmount: payload.totalPool * 0.25,
      status: "pending",
      payoutStatus: "pending",
      proof: "https://example.com/mock-proof/scorecard-2.png",
    });

    draw.winners = [winnerOne._id, winnerTwo._id];
    await draw.save();

    primaryWinner.winnings = Number((primaryWinner.winnings + winnerOne.payoutAmount).toFixed(2));
    secondaryWinner.winnings = Number((secondaryWinner.winnings + winnerTwo.payoutAmount).toFixed(2));
    await primaryWinner.save();
    await secondaryWinner.save();

    winnersCreated += 2;
  }

  return { drawsCreated: drawData.length, winnersCreated };
};

const seedShowcaseData = async ({ reset = false } = {}) => {
  if (reset) {
    await Promise.all([
      Winner.deleteMany({}),
      Draw.deleteMany({}),
      Score.deleteMany({}),
      Subscription.deleteMany({}),
      User.deleteMany({}),
      Charity.deleteMany({}),
    ]);
  }

  const charities = [];
  for (const seed of charitySeed) {
    const charity = await Charity.findOneAndUpdate(
      { name: seed.name },
      {
        $set: {
          description: seed.description,
          events: seed.events,
        },
        $setOnInsert: {
          image: "",
          totalDonations: 0,
        },
      },
      { upsert: true, new: true }
    );
    charities.push(charity);
  }

  const users = [];
  for (let index = 0; index < userSeed.length; index += 1) {
    const seed = userSeed[index];
    const charityId = charities[index % charities.length]._id;

    const user = await createOrUpdateUser(seed, charityId);
    await upsertSubscription(user, seed);
    await upsertScores(user, seed);
    users.push(user);
  }

  for (const user of users) {
    const contributionBase = user.subscriptionType === "yearly" ? 499 : 49;
    const contribution = Number(((contributionBase * user.charityPercentage) / 100).toFixed(2));
    await Charity.findByIdAndUpdate(user.charitySelected, { $inc: { totalDonations: contribution } });
  }

  const activeUsers = users.filter((u) => u.subscriptionStatus === "active");
  const drawOutcome = await buildDraws(activeUsers);

  return {
    users: users.length,
    charities: charities.length,
    activeUsers: activeUsers.length,
    drawsCreated: drawOutcome.drawsCreated,
    winnersCreated: drawOutcome.winnersCreated,
    credentials: {
      admin: { email: "admin@golfcharity.com", password: "Admin@123" },
      users: ["aarav@example.com", "sara@example.com", "rohan@example.com"],
      sharedUserPassword: "User@123",
    },
  };
};

module.exports = { seedShowcaseData };
