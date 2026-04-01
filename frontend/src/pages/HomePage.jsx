import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const highlights = [
  { title: "Monthly Draw Rewards", desc: "Draw participation every month with 3, 4, and 5 number match tiers." },
  { title: "Latest 5 Scores Engine", desc: "Stableford-only input with automatic oldest-score replacement logic." },
  { title: "Charity-First Subscription", desc: "Minimum 10% donation with user-controlled charity contribution percentages." },
];

const flow = [
  "Choose monthly or yearly membership",
  "Select your charity and contribution percentage",
  "Enter your latest 5 Stableford scores",
  "Participate in monthly draw and claim rewards",
];

const HomePage = () => (
  <div className="space-y-12 pb-10">
    <section className="relative overflow-hidden neo-card bg-creem-dark px-6 py-10 text-creem-white md:px-12 md:py-14">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-creem-primary/50 blur-2xl" />
      <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-creem-secondary/50 blur-2xl" />
      <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full border-2 border-creem-white/80 bg-creem-primary/30 px-4 py-1 text-xs font-semibold uppercase tracking-widest"
          >
            Premium Charity Subscription Platform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl text-5xl leading-[1.05] md:text-7xl"
          >
            Play Better.
            <br />
            Win Monthly.
            <br />
            Give Meaningfully.
          </motion.h1>
          <p className="max-w-xl text-base font-medium text-creem-white/90 md:text-lg">
            A modern SaaS-style experience where every subscription fuels prize pools and real-world charity outcomes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="btn-secondary text-base">Start Membership</Link>
            <Link to="/charities" className="btn-accent text-base">Explore Charities</Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="neo-card space-y-4 bg-creem-white text-creem-dark"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-creem-ink">Platform Snapshot</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="neo-card bg-creem-accent p-4">
              <p className="text-xs font-semibold uppercase text-creem-ink">Prize Split</p>
              <p className="text-2xl">40 / 35 / 25</p>
            </div>
            <div className="neo-card bg-creem-secondary/40 p-4">
              <p className="text-xs font-semibold uppercase text-creem-ink">Score Range</p>
              <p className="text-2xl">1 - 45</p>
            </div>
            <div className="neo-card bg-creem-primary p-4 text-creem-white">
              <p className="text-xs font-semibold uppercase text-creem-white/80">Rolling Scores</p>
              <p className="text-2xl">Latest 5</p>
            </div>
            <div className="neo-card bg-creem-dark p-4 text-creem-white">
              <p className="text-xs font-semibold uppercase text-creem-white/80">Min Donation</p>
              <p className="text-2xl">10%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="grid gap-5 md:grid-cols-3">
      {highlights.map((item, i) => (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 * i }}
          key={item.title}
          className="neo-card bg-creem-white"
        >
          <h3 className="text-2xl">{item.title}</h3>
          <p className="mt-3 text-sm font-medium leading-relaxed text-creem-ink">{item.desc}</p>
        </motion.article>
      ))}
    </section>

    <section className="grid gap-8 md:grid-cols-[1fr_1fr]">
      <div className="neo-card bg-creem-white">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-creem-ink">How It Works</p>
        <ol className="mt-5 space-y-3">
          {flow.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-creem-dark bg-creem-accent text-sm font-semibold">
                {index + 1}
              </span>
              <span className="font-medium text-creem-ink">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="neo-card bg-creem-secondary/30">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-creem-ink">Call To Action</p>
        <h3 className="mt-4 text-4xl leading-tight">Ready to build your monthly winning streak?</h3>
        <p className="mt-3 text-sm font-medium text-creem-ink">
          Create your account, choose your cause, and activate your subscription to unlock scores, draws, and rewards.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/login" className="btn-primary">Create Account</Link>
          <Link to="/draw-results" className="btn-secondary">View Draw Results</Link>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
