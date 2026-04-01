import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../services/api";

const SubscriptionPage = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [confirmingStripe, setConfirmingStripe] = useState(false);
  const handledStripeRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get("success") === "true";
    const checkoutSessionId = params.get("session_id");

    if (!isSuccess || !checkoutSessionId || handledStripeRef.current) return;

    handledStripeRef.current = true;
    const confirmStripe = async () => {
      try {
        setConfirmingStripe(true);
        await api.post("/subscriptions/confirm-stripe", { checkoutSessionId });
        toast.success("Stripe payment confirmed. Subscription activated.");
        window.history.replaceState({}, "", "/subscription");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 900);
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not confirm Stripe payment");
      } finally {
        setConfirmingStripe(false);
      }
    };

    confirmStripe();
  }, []);

  const subscribe = async (planType) => {
    try {
      setLoadingPlan(planType);
      const checkout = await api.post("/subscriptions/checkout", { planType });

      if (checkout.data.mode === "stripe" && checkout.data.checkoutUrl) {
        window.location.href = checkout.data.checkoutUrl;
        return;
      }

      if (checkout.data.mode === "mock" && checkout.data.checkoutSessionId) {
        await api.post("/subscriptions/confirm-mock", {
          planType,
          checkoutSessionId: checkout.data.checkoutSessionId,
        });
        toast.success(`You are now subscribed to the ${planType} plan!`);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 900);
      }

      if (!checkout.data.mode) {
        throw new Error("Unsupported checkout response");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {confirmingStripe && (
        <div className="neo-card bg-creem-accent">
          <p className="font-semibold">Confirming Stripe payment and activating your subscription...</p>
        </div>
      )}

      <div className="neo-card bg-creem-dark p-8 text-center text-creem-white">
        <h1 className="text-5xl">Choose Your Plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-creem-white/80 md:text-base">
          Unlock score tracking, monthly draw participation, and automated charity contributions with an active subscription.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-xs font-medium text-creem-white/70">
          In development, you can use free test mode without entering real bank/card details.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          key: "monthly",
          price: "$49",
          period: "/month",
          note: "Best for getting started quickly",
          color: "bg-creem-white",
        },
        {
          key: "yearly",
          price: "$499",
          period: "/year",
          note: "Best value with priority long-term participation",
          color: "bg-creem-primary text-creem-white",
        },
      ].map((p, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={p.key} 
          className={`neo-card flex flex-col p-8 md:p-10 ${p.color} transition-transform hover:-translate-y-1`}
        >
          {p.key === "yearly" && (
            <span className="neo-badge mb-5 w-fit bg-creem-secondary text-creem-dark">Most Popular</span>
          )}
          <h3 className="text-3xl uppercase">{p.key} Plan</h3>
          <div className="mt-5 flex items-baseline">
            <span className="text-6xl">{p.price}</span>
            <span className="ml-1 text-sm font-semibold opacity-80">{p.period}</span>
          </div>
          <p className="mt-4 h-12 text-sm font-medium">{p.note}</p>

          <ul className="mt-6 space-y-2 text-sm font-medium">
            <li>Full member dashboard access</li>
            <li>Eligible for monthly draw pools</li>
            <li>Donation share auto-tracked by charity</li>
          </ul>
          
          <button
            onClick={() => subscribe(p.key)}
            className={`mt-8 w-full py-3 text-base ${p.key === "yearly" ? "btn-secondary bg-creem-white" : "btn-primary"}`}
            disabled={loadingPlan === p.key}
          >
            {loadingPlan === p.key ? "Processing..." : `Choose ${p.key} plan`}
          </button>
        </motion.div>
      ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
