const Charity = require("../models/Charity");

const defaultCharities = [
  {
    name: "Birdies For Education",
    description: "Supports scholarships, books, and digital learning programs for underserved children.",
    image: "",
    events: ["Junior Golf + Learning Day", "Back-to-School Charity Round"],
  },
  {
    name: "Clean Water Drive",
    description: "Funds safe drinking water projects in rural communities through high-impact local partners.",
    image: "",
    events: ["Community Water Challenge", "Impact Golf Fundraiser"],
  },
  {
    name: "Mental Wellness United",
    description: "Provides counseling support, awareness campaigns, and emergency mental health assistance.",
    image: "",
    events: ["Mind & Motion Golf Day", "Resilience Awareness Workshop"],
  },
];

const listCharities = async (req, res) => {
  const query = req.query.q ? { name: new RegExp(req.query.q, "i") } : {};
  const sort = req.query.sort === "donations" ? { totalDonations: -1 } : { createdAt: -1 };
  if (!req.query.q) {
    const count = await Charity.countDocuments();
    if (count === 0) {
      await Charity.insertMany(defaultCharities);
    }
  }
  const charities = await Charity.find(query).sort(sort);
  res.json(charities);
};

const getCharity = async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) return res.status(404).json({ message: "Charity not found" });
  res.json(charity);
};

const createCharity = async (req, res) => {
  const charity = await Charity.create(req.body);
  res.status(201).json(charity);
};

const updateCharity = async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(charity);
};

const deleteCharity = async (req, res) => {
  await Charity.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

const donateToCharity = async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Donation amount must be greater than 0" });
  }

  const charity = await Charity.findById(req.params.id);
  if (!charity) return res.status(404).json({ message: "Charity not found" });

  charity.totalDonations = Number((charity.totalDonations + amount).toFixed(2));
  await charity.save();

  res.status(201).json({
    message: "Donation added successfully",
    charity,
  });
};

module.exports = { listCharities, getCharity, createCharity, updateCharity, deleteCharity, donateToCharity };
