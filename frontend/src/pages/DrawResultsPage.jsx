import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

const DrawResultsPage = () => {
  const [draws, setDraws] = useState([]);
  useEffect(() => {
    api.get("/draws").then((r) => setDraws(r.data));
  }, []);
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Draw Results</h1>
        <p className="font-bold text-creem-dark/70 text-lg">Check the past monthly draw numbers.</p>
      </div>
      
      <div className="space-y-6">
        {draws.map((d, i) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={d._id} className="neo-card bg-creem-white space-y-4">
            <div className="flex justify-between items-center border-b-2 border-creem-dark pb-4">
              <h2 className="text-xl font-bold">{new Date(d.drawDate).toLocaleDateString()}</h2>
              <span className="neo-badge bg-creem-accent uppercase">{d.type} Draw</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-black uppercase text-sm mb-2 opacity-70">Winning Numbers</p>
                <div className="flex flex-wrap gap-2">
                  {d.numbersGenerated?.map((num, idx) => (
                    <span key={idx} className="w-12 h-12 flex items-center justify-center bg-creem-primary text-2xl font-black rounded-full border-2 border-creem-dark shadow-brutal-sm">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-bold pt-2">Total Winners: <span className="bg-creem-secondary px-2 border border-creem-dark rounded">{d.winners?.length || 0}</span></p>
            </div>
          </motion.div>
        ))}
        {draws.length === 0 && (
          <div className="py-20 text-center font-bold text-xl text-creem-dark/50 neo-card bg-creem-white border-dashed">
            No draws have been generated yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawResultsPage;
