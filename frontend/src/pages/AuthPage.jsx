import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { motion } from "framer-motion";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [charities, setCharities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    charitySelected: "",
    charityPercentage: 10,
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/charities")
      .then((res) => {
        const list = res.data || [];
        setCharities(list);
        if (list[0]) {
          setForm((prev) => ({ ...prev, charitySelected: prev.charitySelected || list[0]._id }));
        }
      })
      .catch(() => setCharities([]));
  }, []);

  const isValid = useMemo(() => {
    if (!form.email.trim() || !form.password.trim()) return false;
    if (!isSignup) return true;
    return !!form.name.trim() && form.password.trim().length >= 6 && Number(form.charityPercentage) >= 10;
  }, [form, isSignup]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      setSubmitting(true);
      if (isSignup) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          charitySelected: form.charitySelected || null,
          charityPercentage: Number(form.charityPercentage),
        });
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
      toast.success(isSignup ? "Account created successfully" : "Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Auth failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 py-6 md:grid-cols-[1.15fr_1fr] md:items-stretch">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="neo-card hidden bg-creem-primary p-8 text-creem-white md:block"
      >
        <p className="inline-block rounded-full border-2 border-creem-white bg-creem-dark px-4 py-1 text-xs font-semibold uppercase tracking-wider">
          Digital Heroes Challenge
        </p>
        <h1 className="mt-6 text-5xl leading-tight">A Membership That Turns Scores Into Impact</h1>
        <p className="mt-4 max-w-xl text-base font-medium text-creem-white/90">
          Join monthly draws, track your latest five scores, and donate every billing cycle to causes that matter.
        </p>
        <div className="mt-8 grid gap-3 text-sm font-semibold">
          <div className="neo-card bg-creem-white/15 p-4">Monthly or yearly subscription plans</div>
          <div className="neo-card bg-creem-white/15 p-4">Minimum 10% charity contribution at signup</div>
          <div className="neo-card bg-creem-white/15 p-4">Draw eligibility and winner verification flow</div>
        </div>
      </motion.section>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="neo-card w-full space-y-5 bg-creem-white p-6 md:p-8"
      >
        <div className="mb-2 text-center md:text-left">
          <h2 className="text-4xl uppercase">{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="mt-2 text-sm font-medium text-creem-ink/80">
            {isSignup ? "Start your subscription and choose your charity impact." : "Login to continue to your member dashboard."}
          </p>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <input
              className="input-neo"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />
          )}
          <input
            className="input-neo"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
          />
          <input
            type="password"
            className="input-neo"
            placeholder={isSignup ? "Password (min 6 chars)" : "Password"}
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
          />

          {isSignup && (
            <>
              <div className="space-y-2">
                <label className="ml-1 text-xs font-semibold uppercase tracking-wide text-creem-ink">Select Charity</label>
                <select
                  className="input-neo"
                  value={form.charitySelected}
                  onChange={(e) => updateForm("charitySelected", e.target.value)}
                >
                  {charities.length === 0 && <option value="">No charity available</option>}
                  {charities.map((charity) => (
                    <option key={charity._id} value={charity._id}>
                      {charity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="ml-1 text-xs font-semibold uppercase tracking-wide text-creem-ink">Charity Contribution</label>
                  <span className="rounded-full border-2 border-creem-dark bg-creem-accent px-3 py-1 text-xs font-semibold">
                    {Number(form.charityPercentage)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={form.charityPercentage}
                  onChange={(e) => updateForm("charityPercentage", Number(e.target.value))}
                  className="w-full accent-creem-primary"
                />
                <p className="text-xs font-medium text-creem-ink/70">Minimum 10% required. Increase this to maximize your impact.</p>
              </div>
            </>
          )}
        </div>

        <button disabled={!isValid || submitting} className="btn-primary w-full text-lg disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Please wait..." : isSignup ? "Create Account" : "Login"}
        </button>

        <div className="text-center md:text-left">
          <button
            type="button"
            className="text-sm font-semibold text-creem-ink underline decoration-2 underline-offset-4"
            onClick={() => setIsSignup((prev) => !prev)}
          >
            {isSignup ? "Already have an account? Login" : "New here? Create your account"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default AuthPage;
