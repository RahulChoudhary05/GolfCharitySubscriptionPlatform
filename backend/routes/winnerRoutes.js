const express = require("express");
const { myWinnings, listAllWinners, uploadProof, reviewWinner } = require("../controllers/winnerController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/me", protect, myWinnings);
router.get("/", protect, adminOnly, listAllWinners);
router.patch("/:id/proof", protect, uploadProof);
router.patch("/:id/review", protect, adminOnly, reviewWinner);

module.exports = router;
