const express = require("express");
const { runDraw, getDrawResults } = require("../controllers/drawController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/", getDrawResults);
router.post("/run", protect, adminOnly, runDraw);

module.exports = router;
