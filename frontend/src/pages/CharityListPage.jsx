import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";

const CharityListPage = () => {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const loadCharities = async () => {
    const { data } = await api.get("/charities", {
      params: {
        q: search.trim() || undefined,
        sort,
      },
    });
    setCharities(data);
  };

  useEffect(() => {
    loadCharities().catch(() => setCharities([]));
  }, [sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    loadCharities().catch(() => setCharities([]));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Our Causes</h1>
        <p className="font-bold text-creem-dark/70 text-lg">See where your subscriptions make an impact.</p>
      </div>

      <form onSubmit={submitSearch} className="neo-card bg-creem-white grid gap-3 md:grid-cols-[1fr_auto_auto] items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-neo"
          placeholder="Search charity by name"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-neo md:w-56">
          <option value="latest">Sort: Latest</option>
          <option value="donations">Sort: Highest Donations</option>
        </select>
        <button className="btn-primary md:w-auto">Search</button>
      </form>
      
      <div className="grid gap-6 md:grid-cols-2">
        {charities.map((c, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={c._id}>
            <Link to={`/charities/${c._id}`} className={`block neo-card ${i % 2 === 0 ? 'bg-creem-secondary' : 'bg-creem-accent'} transition-transform hover:-translate-y-2`}>
              <h3 className="text-3xl font-black uppercase mb-3 drop-shadow-[1px_1px_0px_#151617]">{c.name}</h3>
              <p className="font-bold text-lg h-24 overflow-hidden">{c.description.slice(0, 100)}...</p>
              <div className="mt-4 flex justify-end">
                <span className="font-black underline underline-offset-4 decoration-2">View Cause &rarr;</span>
              </div>
            </Link>
          </motion.div>
        ))}
        {charities.length === 0 && (
          <div className="col-span-2 py-20 text-center font-bold text-xl text-creem-dark/50">
            No charities found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityListPage;
