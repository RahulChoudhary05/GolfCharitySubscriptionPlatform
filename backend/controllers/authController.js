const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createDemoUser, findDemoUserByEmail } = require("../utils/demoStore");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const isDemoMode = process.env.DEMO_MODE === "true";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const register = async (req, res) => {
  const { name, email, password, charitySelected, charityPercentage = 10 } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = String(name || "").trim();
  const normalizedPassword = String(password || "");
  const safeCharityPercentage = Number(charityPercentage);

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  if (!Number.isFinite(safeCharityPercentage) || safeCharityPercentage < 10 || safeCharityPercentage > 100) {
    return res.status(400).json({ message: "Charity contribution must be between 10% and 100%" });
  }

  if (isDemoMode) {
    const exists = findDemoUserByEmail(normalizedEmail);
    if (exists) return res.status(400).json({ message: "Email already exists" });
    const user = createDemoUser({
      name: normalizedName,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      charitySelected: charitySelected || null,
      charityPercentage: safeCharityPercentage,
      scores: [],
    });
    return res.status(201).json({ token: signToken(user._id), user: { ...user, password: undefined } });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(400).json({ message: "Email already exists" });
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    charitySelected: charitySelected || null,
    charityPercentage: safeCharityPercentage,
  });
  res.status(201).json({ token: signToken(user._id), user: { ...user.toObject(), password: undefined } });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (isDemoMode) {
    const user = findDemoUserByEmail(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.json({ token: signToken(user._id), user: { ...user, password: undefined } });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ token: signToken(user._id), user: { ...user.toObject(), password: undefined } });
};

const me = async (req, res) => res.json(req.user);

module.exports = { register, login, me };
