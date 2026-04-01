const express = require("express");
const { addScore, getScores } = require("../controllers/scoreController");
const { protect, subscriberOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/", protect, subscriberOnly, getScores);
router.post("/", protect, subscriberOnly, addScore);

module.exports = router;
