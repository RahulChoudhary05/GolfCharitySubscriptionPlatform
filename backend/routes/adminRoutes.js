const express = require("express");
const { getAnalytics, getUsers, seedShowcase } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/users", protect, adminOnly, getUsers);
router.post("/seed-showcase", protect, adminOnly, seedShowcase);

module.exports = router;
