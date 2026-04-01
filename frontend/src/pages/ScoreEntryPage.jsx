import { useEffect, useState } from "react";
import api from "../services/api";

const ScoreEntryPage = () => {
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const load = () => api.get("/scores").then((r) => setScores(r.data));
  useEffect(() => void load(), []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/scores", { score: Number(score), date });
    setScore(1);
    load();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Enter Scores</h1>
        <p className="font-bold text-creem-dark/70 text-lg">Track your latest 5 Stableford scores to enter the draw.</p>
      </div>

      <form onSubmit={submit} className="neo-card bg-creem-secondary flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="font-bold text-sm ml-2">Score (1-45)</label>
          <input type="number" min={1} max={45} value={score} onChange={(e) => setScore(e.target.value)} className="input-neo" />
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="font-bold text-sm ml-2">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-neo" />
        </div>
        <button className="btn-primary w-full md:w-auto mt-4 md:mt-0 py-3">Add Score</button>
      </form>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">Recent Scores</h2>
        <div className="neo-card bg-creem-white space-y-3">
          {scores.length === 0 ? (
            <p className="font-bold text-creem-dark/50 text-center py-4">No scores entered yet.</p>
          ) : (
            scores.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-creem-bg rounded-xl border-2 border-creem-dark shadow-brutal-sm">
                <span className="font-bold text-lg">{new Date(s.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold uppercase text-creem-dark/50">Score</span>
                  <span className="text-2xl font-black px-4 py-1 bg-creem-primary rounded-full border-2 border-creem-dark">{s.score}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreEntryPage;
