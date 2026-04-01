const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Charity = require("../models/Charity");
const Stripe = require("stripe");

const PLAN_PRICE = { monthly: 49, yearly: 499 };
const PAYMENT_MODE = process.env.PAYMENT_MODE || "mock";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const isStripeKeyValid = () => {
  const key = process.env.STRIPE_SECRET_KEY || "";
  return key.startsWith("sk_test_") || key.startsWith("sk_live_");
};

const calculateDates = (planType) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
  else endDate.setMonth(endDate.getMonth() + 1);
  return { startDate, endDate };
};

const markPreviousSubscriptionsInactive = async (userId) => {
  await Subscription.updateMany(
    { userId, status: "active" },
    {
      $set: {
        status: "inactive",
      },
    }
  );
};

const addCharityContribution = async (userId, planAmount) => {
  const user = await User.findById(userId).select("charitySelected charityPercentage");
  if (!user?.charitySelected) return;

  const contribution = Number(((planAmount * user.charityPercentage) / 100).toFixed(2));
  await Charity.findByIdAndUpdate(user.charitySelected, {
    $inc: { totalDonations: contribution },
  });
};

const activateSubscription = async ({ userId, planType, amount, paymentMode = "mock", paymentReference = "" }) => {
  const existingPaid = paymentReference
    ? await Subscription.findOne({ userId, paymentReference, status: "active" })
    : null;

  if (existingPaid) return existingPaid;

  const { startDate, endDate } = calculateDates(planType);
  await markPreviousSubscriptionsInactive(userId);

  const subscription = await Subscription.create({
    userId,
    planType,
    status: "active",
    startDate,
    endDate,
    amount,
    paymentMode,
    paymentReference,
  });

  await addCharityContribution(userId, amount);

  await User.findByIdAndUpdate(userId, {
    subscriptionStatus: "active",
    subscriptionType: planType,
  });

  return subscription;
};

const subscribe = async (req, res) => {
  const { planType } = req.body;
  if (!PLAN_PRICE[planType]) return res.status(400).json({ message: "Invalid plan type" });

  const subscription = await activateSubscription({
    userId: req.user._id,
    planType,
    amount: PLAN_PRICE[planType],
    paymentMode: PAYMENT_MODE === "stripe" ? "stripe" : "mock",
    paymentReference: `manual_${Date.now()}`,
  });

  res.status(201).json(subscription);
};

const createCheckoutSession = async (req, res) => {
  const { planType } = req.body;
  if (!PLAN_PRICE[planType]) return res.status(400).json({ message: "Invalid plan type" });

  // Mock mode enables full subscription flow without bank details.
  if (PAYMENT_MODE === "mock") {
    return res.json({
      mode: "mock",
      checkoutSessionId: `mock_cs_${Date.now()}`,
      amount: PLAN_PRICE[planType],
      currency: "usd",
      message: "Mock checkout created. Confirm payment using mock endpoint.",
    });
  }

  if (!stripe || !isStripeKeyValid()) {
    return res.status(500).json({
      message:
        "Stripe test key is missing or invalid. Set PAYMENT_MODE=mock, or add a valid STRIPE_SECRET_KEY starting with sk_test_.",
    });
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Golf Charity ${planType} subscription` },
          unit_amount: PLAN_PRICE[planType] * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}&planType=${planType}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
    metadata: {
      userId: req.user._id.toString(),
      planType,
    },
  });

  return res.json({ mode: "stripe", checkoutUrl: session.url, checkoutSessionId: session.id });
};

const confirmMockPayment = async (req, res) => {
  const { planType, checkoutSessionId } = req.body;
  if (!PLAN_PRICE[planType]) return res.status(400).json({ message: "Invalid plan type" });
  if (!checkoutSessionId) return res.status(400).json({ message: "Missing checkoutSessionId" });

  const subscription = await activateSubscription({
    userId: req.user._id,
    planType,
    amount: PLAN_PRICE[planType],
    paymentMode: "mock",
    paymentReference: checkoutSessionId,
  });

  return res.status(201).json({ message: "Mock payment confirmed", subscription });
};

const confirmStripeSession = async (req, res) => {
  const { checkoutSessionId } = req.body;
  if (!checkoutSessionId) return res.status(400).json({ message: "Missing checkoutSessionId" });
  if (!stripe || !isStripeKeyValid()) {
    return res.status(500).json({
      message:
        "Stripe test key is missing or invalid. Set PAYMENT_MODE=mock, or add a valid STRIPE_SECRET_KEY starting with sk_test_.",
    });
  }

  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  if (!session) return res.status(404).json({ message: "Checkout session not found" });

  const ownerId = session.metadata?.userId;
  const planType = session.metadata?.planType;
  if (!ownerId || !planType || !PLAN_PRICE[planType]) {
    return res.status(400).json({ message: "Invalid checkout session metadata" });
  }
  if (String(ownerId) !== String(req.user._id)) {
    return res.status(403).json({ message: "This checkout session does not belong to current user" });
  }
  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed yet" });
  }

  const subscription = await activateSubscription({
    userId: req.user._id,
    planType,
    amount: PLAN_PRICE[planType],
    paymentMode: "stripe",
    paymentReference: checkoutSessionId,
  });

  return res.status(201).json({ message: "Stripe payment confirmed", subscription });
};

const mySubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(subscription);
};

module.exports = {
  subscribe,
  mySubscription,
  PLAN_PRICE,
  createCheckoutSession,
  confirmMockPayment,
  confirmStripeSession,
};
