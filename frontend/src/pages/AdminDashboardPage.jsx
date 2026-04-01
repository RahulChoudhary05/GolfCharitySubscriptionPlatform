import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [winners, setWinners] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const loadAdminData = async () => {
    try {
      const [analyticsRes, usersRes, winnersRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users"),
        api.get("/winners"),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setWinners(winnersRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admin data");
    }
  };

  useEffect(() => {
    loadAdminData().catch(() => null);
  }, []);

  const runDraw = async (type) => {
    try {
      const { data } = await api.post("/draws/run", { type, simulate: false });
      if (data?.alreadyPublished) {
        toast("Monthly draw already published. Open Draw Results to review it.");
      } else {
        toast.success(`${data?.type || type} draw published successfully`);
      }
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run draw");
    }
  };

  const simulateDraw = async (type) => {
    try {
      const { data } = await api.post("/draws/run", { type, simulate: true });
      setSimResult(data);
      toast.success(`${type} draw simulation completed`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to simulate draw");
    }
  };

  const seedShowcaseData = async (reset = false) => {
    try {
      setSeeding(true);
      const { data } = await api.post(`/admin/seed-showcase${reset ? "?reset=true" : ""}`);
      toast.success(`${data.message}. Users: ${data.users}, Draws added: ${data.drawsCreated}`);
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to seed showcase data");
    } finally {
      setSeeding(false);
    }
  };

  const updateWinner = async (winnerId, payload) => {
    try {
      await api.patch(`/winners/${winnerId}/review`, payload);
      toast.success("Winner updated");
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update winner");
    }
  };

  if (!analytics) return <p className="font-bold p-8 text-center text-xl">Loading Admin Data...</p>;
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <h1 className="text-5xl uppercase tracking-tighter">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Stat label="Total Users" value={analytics.totalUsers} color="bg-creem-secondary" />
        <Stat label="Total Prize Pool" value={`$${analytics.totalPrizePool}`} color="bg-creem-accent" />
        <Stat label="Total Donations" value={`$${analytics.totalDonations}`} color="bg-creem-primary" />
      </div>
      
      <div className="neo-card bg-creem-white space-y-4">
        <div className="border-b-2 border-creem-dark pb-4">
          <h2 className="text-2xl font-black uppercase">Run Monthly Draw</h2>
          <p className="font-bold text-creem-dark/60">Generate winning numbers and distribute prizes automatically.</p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={() => runDraw("random")} className="btn-primary">Run Random Draw</button>
          <button onClick={() => runDraw("algorithmic")} className="btn-secondary">Run Algorithmic Draw</button>
          <button onClick={() => runDraw("auto")} className="btn-accent">Run Auto Draw</button>
          <button onClick={() => simulateDraw("random")} className="btn-accent">Simulate Random</button>
          <button onClick={() => simulateDraw("algorithmic")} className="btn-accent">Simulate Algorithmic</button>
        </div>
        {simResult && (
          <div className="rounded-2xl border-2 border-creem-dark bg-creem-bg p-4">
            <p className="font-bold uppercase text-sm">Simulation Result</p>
            <p className="mt-2 text-sm font-medium">Numbers: {simResult.numbersGenerated?.join(", ") || "-"}</p>
            <p className="text-sm font-medium">Projected Rollover: ${simResult.nextRollover || 0}</p>
          </div>
        )}
      </div>

      <div className="neo-card bg-creem-white space-y-4">
        <div className="border-b-2 border-creem-dark pb-4">
          <h2 className="text-2xl font-black uppercase">Showcase Data</h2>
          <p className="font-bold text-creem-dark/60">Populate connected real records so every section has meaningful data.</p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={() => seedShowcaseData(false)} disabled={seeding} className="btn-primary disabled:opacity-60">
            {seeding ? "Generating..." : "Generate Showcase Data"}
          </button>
          <button onClick={() => seedShowcaseData(true)} disabled={seeding} className="btn-secondary disabled:opacity-60">
            {seeding ? "Generating..." : "Reset + Regenerate Data"}
          </button>
        </div>
      </div>
      
      <div className="neo-card bg-creem-white space-y-4">
        <h2 className="text-2xl font-black uppercase border-b-2 border-creem-dark pb-4">User Directory</h2>
        <div className="space-y-3 pt-2">
          {users.map((u) => (
            <div key={u._id} className="flex justify-between items-center p-4 bg-creem-bg rounded-xl border-2 border-creem-dark shadow-brutal-sm">
              <div>
                <p className="font-black text-lg">{u.name}</p>
                <p className="text-sm font-bold opacity-70">{u.email}</p>
              </div>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border-2 border-creem-dark ${u.subscriptionStatus === 'active' ? 'bg-creem-accent' : 'bg-red-400'}`}>
                {u.subscriptionStatus || "INACTIVE"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="neo-card bg-creem-white space-y-4">
        <h2 className="text-2xl font-black uppercase border-b-2 border-creem-dark pb-4">Winner Verification & Payouts</h2>
        <div className="space-y-3 pt-2">
          {winners.slice(0, 12).map((winner) => (
            <div key={winner._id} className="p-4 bg-creem-bg rounded-xl border-2 border-creem-dark shadow-brutal-sm space-y-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-black text-lg">{winner.userId?.name || "Unknown User"}</p>
                  <p className="text-sm font-bold opacity-70">{winner.userId?.email || "-"}</p>
                </div>
                <div className="text-sm font-bold">
                  {winner.matchType}-Match | ${Number(winner.payoutAmount || 0).toFixed(2)}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div className="text-xs font-bold break-all">
                  Proof: {winner.proof ? winner.proof : "No proof uploaded"}
                </div>
                <button onClick={() => updateWinner(winner._id, { status: "approved" })} className="btn-accent px-4 py-2 text-xs">
                  Approve
                </button>
                <button onClick={() => updateWinner(winner._id, { status: "rejected", payoutStatus: "pending" })} className="btn-secondary px-4 py-2 text-xs bg-red-200">
                  Reject
                </button>
                <button onClick={() => updateWinner(winner._id, { payoutStatus: "paid" })} className="btn-primary px-4 py-2 text-xs">
                  Mark Paid
                </button>
              </div>
            </div>
          ))}

          {winners.length === 0 && <p className="font-bold text-creem-dark/60">No winner records yet.</p>}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`neo-card ${color} p-6 flex flex-col justify-between`}>
    <p className="font-black uppercase text-sm opacity-80">{label}</p>
    <p className="text-5xl font-black tracking-tighter mt-2 drop-shadow-[2px_2px_0px_#151617] text-creem-white">{value}</p>
  </div>
);

export default AdminDashboardPage;
