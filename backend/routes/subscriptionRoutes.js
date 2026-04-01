const express = require("express");
const {
  subscribe,
  mySubscription,
  createCheckoutSession,
  confirmMockPayment,
  confirmStripeSession,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.get("/me", protect, mySubscription);
router.post("/checkout", protect, createCheckoutSession);
router.post("/confirm-mock", protect, confirmMockPayment);
router.post("/confirm-stripe", protect, confirmStripeSession);
router.post("/", protect, subscribe);

module.exports = router;
