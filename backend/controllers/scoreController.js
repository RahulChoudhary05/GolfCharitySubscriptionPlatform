const User = require("../models/User");
const Score = require("../models/Score");

const addScore = async (req, res) => {
  const { score, date } = req.body;
  const numericScore = Number(score);
  const parsedDate = new Date(date);

  if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 45) {
    return res.status(400).json({ message: "Score must be an integer between 1 and 45" });
  }
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "A valid score date is required" });
  }

  const user = await User.findById(req.user._id);
  user.scores.push({ score: numericScore, date: parsedDate });
  user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (user.scores.length > 5) user.scores = user.scores.slice(0, 5);

  await user.save();
  await Score.create({ userId: req.user._id, score: numericScore, date: parsedDate });
  res.status(201).json(user.scores);
};

const getScores = async (req, res) => {
  const user = await User.findById(req.user._id).select("scores");
  res.json(user.scores);
};

module.exports = { addScore, getScores };
