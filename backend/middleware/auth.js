const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { findDemoUserById } = require("../utils/demoStore");

const isDemoMode = process.env.DEMO_MODE === "true";

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (isDemoMode) {
      const demoUser = findDemoUserById(decoded.id);
      if (!demoUser) return res.status(401).json({ message: "Demo user not found" });
      req.user = { ...demoUser, password: undefined };
      return next();
    }

    req.user = await User.findById(decoded.id)
      .select("-password")
      .populate("charitySelected", "name");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
};

const subscriberOnly = (req, res, next) => {
  const ensureStatus = async () => {
    if (!req.user || req.user.subscriptionStatus !== "active") {
      return res.status(403).json({ message: "Active subscription required" });
    }

    if (isDemoMode) return next();

    const latestActive = await Subscription.findOne({ userId: req.user._id, status: "active" }).sort({ createdAt: -1 });
    if (!latestActive || new Date(latestActive.endDate) < new Date()) {
      await Subscription.updateMany({ userId: req.user._id, status: "active" }, { $set: { status: "lapsed" } });
      await User.findByIdAndUpdate(req.user._id, {
        subscriptionStatus: "lapsed",
      });
      return res.status(403).json({ message: "Subscription is lapsed. Please renew to continue." });
    }

    return next();
  };

  return ensureStatus().catch(() => res.status(500).json({ message: "Unable to validate subscription state" }));
};

module.exports = { protect, adminOnly, subscriberOnly };
