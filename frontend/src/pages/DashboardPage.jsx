import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [draws, setDraws] = useState([]);

  useEffect(() => {
    api.get("/subscriptions/me").then((r) => setSubscription(r.data)).catch(() => null);
    api.get("/winners/me").then((r) => setWinnings(r.data)).catch(() => null);
    api.get("/draws").then((r) => setDraws(r.data)).catch(() => null);
  }, []);

  const totalWon = winnings.reduce((sum, w) => sum + (Number(w.payoutAmount) || 0), 0);
  const pendingPayments = winnings.filter((w) => w.payoutStatus === "pending").length;
  const approvedWinnings = winnings.filter((w) => w.status === "approved").length;
  const statusColor = user?.subscriptionStatus === "active" ? "bg-creem-primary text-creem-white" : "bg-red-400 text-white";

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="neo-card grid gap-6 bg-creem-dark text-creem-white md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-creem-white/70">Member Overview</p>
          <h1 className="mt-3 text-5xl leading-tight">Welcome, {user?.name || "Player"}</h1>
          <p className="mt-3 max-w-xl text-sm font-medium text-creem-white/80">
            Track your subscription, score activity, draw participation, and winnings in one place.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickStat label="Total Won" value={`$${totalWon.toFixed(2)}`} />
          <QuickStat label="Draw Entries" value={draws.length} />
          <QuickStat label="Approved Wins" value={approvedWinnings} />
          <QuickStat label="Pending Payouts" value={pendingPayments} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="neo-card space-y-4 bg-creem-white lg:col-span-1">
          <div className="flex items-center justify-between border-b-2 border-creem-dark/30 pb-3">
            <h2 className="text-2xl uppercase">Subscription</h2>
            <span className={`rounded-full border-2 border-creem-dark px-3 py-1 text-xs font-semibold uppercase ${statusColor}`}>
              {user?.subscriptionStatus || "inactive"}
            </span>
          </div>
          <div className="space-y-3 text-sm font-medium text-creem-ink">
            <p className="flex justify-between gap-4">
              <span className="text-creem-ink/70">Plan</span>
              <span className="uppercase text-creem-dark">{user?.subscriptionType || "none"}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-creem-ink/70">Renewal Date</span>
              <span className="text-creem-dark">{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "-"}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-creem-ink/70">Charity</span>
              <span className="text-creem-dark">{user?.charitySelected?.name || "Not selected"}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-creem-ink/70">Contribution</span>
              <span className="font-semibold text-creem-dark">{user?.charityPercentage || 10}%</span>
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="neo-card space-y-4 bg-creem-accent lg:col-span-1">
          <div className="border-b-2 border-creem-dark/30 pb-3">
            <h2 className="text-2xl uppercase">Participation Summary</h2>
          </div>
          <div className="space-y-3 pt-2 text-sm font-medium text-creem-ink">
            <SummaryRow label="Draws Entered" value={draws.length} />
            <SummaryRow label="Upcoming Draw Window" value="Monthly" />
            <SummaryRow label="Winner Records" value={winnings.length} />
            <SummaryRow label="Current Payment Status" value={pendingPayments > 0 ? "Pending" : "Up to date"} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="neo-card space-y-4 bg-creem-white lg:col-span-1">
          <div className="border-b-2 border-creem-dark/30 pb-3">
            <h2 className="text-2xl uppercase">Winnings Overview</h2>
          </div>
          <div className="space-y-3">
            {winnings.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-creem-dark/25 bg-creem-bg/70 text-center text-sm font-medium text-creem-ink/70">
                No winnings yet. Keep submitting scores to stay draw-ready.
              </div>
            ) : (
              winnings.slice(0, 5).map((w) => (
                <div key={w._id} className="rounded-2xl border-2 border-creem-dark bg-creem-bg p-4 shadow-brutal-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-creem-dark">{w.matchType}-Number Match</p>
                    <span className={`rounded-full border-2 border-creem-dark px-2 py-1 text-[11px] font-semibold uppercase ${w.payoutStatus === "paid" ? "bg-creem-primary text-creem-white" : "bg-yellow-300"}`}>
                      {w.payoutStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-creem-ink">Payout: ${Number(w.payoutAmount || 0).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border-2 border-creem-white/30 bg-creem-white/10 p-3 backdrop-blur-sm">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-creem-white/75">{label}</p>
    <p className="mt-1 text-2xl text-creem-white">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-xl border-2 border-creem-dark/30 bg-creem-white px-3 py-2">
    <span>{label}</span>
    <span className="font-semibold text-creem-dark">{value}</span>
  </div>
);

export default DashboardPage;
