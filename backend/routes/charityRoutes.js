const express = require("express");
const {
  listCharities,
  getCharity,
  createCharity,
  updateCharity,
  deleteCharity,
  donateToCharity,
} = require("../controllers/charityController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/", listCharities);
router.get("/:id", getCharity);
router.post("/:id/donate", donateToCharity);
router.post("/", protect, adminOnly, createCharity);
router.put("/:id", protect, adminOnly, updateCharity);
router.delete("/:id", protect, adminOnly, deleteCharity);

module.exports = router;
