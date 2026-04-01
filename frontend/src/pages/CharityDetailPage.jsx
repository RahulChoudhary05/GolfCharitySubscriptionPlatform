import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const CharityDetailPage = () => {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [donationAmount, setDonationAmount] = useState(25);

  const loadCharity = () => {
    api.get(`/charities/${id}`).then((r) => setCharity(r.data));
  };

  useEffect(() => {
    loadCharity();
  }, [id]);

  const donate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/charities/${id}/donate`, { amount: Number(donationAmount) });
      toast.success("Donation added successfully");
      loadCharity();
    } catch (err) {
      toast.error(err.response?.data?.message || "Donation failed");
    }
  };
  
  if (!charity) return <p className="font-bold text-center mt-20 text-2xl">Loading Impact...</p>;
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <Link to="/charities" className="font-bold underline underline-offset-4 mb-4 inline-block">&larr; Back to Charities</Link>
      
      <div className="neo-card bg-creem-primary p-8 md:p-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-[2px_2px_0px_#151617] text-creem-white mb-6 leading-tight">
          {charity.name}
        </h1>
        <p className="text-xl font-bold leading-relaxed">{charity.description}</p>
        
        <div className="mt-8 inline-block bg-creem-white px-6 py-4 rounded-xl border-2 border-creem-dark shadow-brutal-sm">
          <p className="font-black uppercase text-sm opacity-70">Total Platform Donations</p>
          <p className="text-4xl font-black text-creem-secondary drop-shadow-[1px_1px_0px_#151617] mt-1">${charity.totalDonations || 0}</p>
        </div>
      </div>

      <div className="neo-card bg-creem-bg space-y-4">
        <h2 className="text-3xl font-black border-b-2 border-creem-dark pb-4 uppercase">Upcoming Events</h2>
        {charity.events?.length > 0 ? (
          <ul className="space-y-3 pt-2">
            {charity.events.map((e, i) => (
              <li key={i} className="flex items-center gap-3 font-bold text-lg">
                <span className="w-8 h-8 flex items-center justify-center bg-creem-accent rounded-full border-2 border-creem-dark">
                  ⚡
                </span>
                {e}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-bold text-creem-dark/60 italic pt-2">No upcoming events listed for this charity.</p>
        )}
      </div>

      <form onSubmit={donate} className="neo-card bg-creem-white space-y-4">
        <h2 className="text-3xl font-black border-b-2 border-creem-dark pb-4 uppercase">Independent Donation</h2>
        <p className="font-bold text-creem-dark/70">Support this charity directly, separate from your subscription gameplay.</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="w-full md:max-w-xs space-y-2">
            <label className="font-bold text-sm ml-1">Donation Amount (USD)</label>
            <input
              type="number"
              min={1}
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="input-neo"
            />
          </div>
          <button className="btn-primary">Donate Now</button>
        </div>
      </form>
    </div>
  );
};

export default CharityDetailPage;
