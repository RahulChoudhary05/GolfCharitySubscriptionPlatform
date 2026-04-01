import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div className="shell-grid min-h-screen px-3 pb-10 pt-4 md:px-8">
      <header className="mx-auto max-w-6xl">
        <nav className="neo-card flex flex-col gap-4 bg-creem-white/90 px-5 py-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:px-6">
          <Link to="/" className="text-2xl tracking-tight text-creem-dark">
            <span className="rounded-xl border-2 border-creem-dark bg-creem-primary px-2 py-1 text-lg text-creem-white shadow-brutal-sm">Golf</span>{" "}
            Charity Club
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-creem-dark md:justify-end">
            <Link to="/charities" className="hover:underline underline-offset-4 decoration-2">Charities</Link>
            <Link to="/draw-results" className="hover:underline underline-offset-4 decoration-2">Draws</Link>
            {user ? (
              <>
                <Link to="/subscription" className="hover:underline underline-offset-4 decoration-2">Subscription</Link>
                <Link to="/scores" className="hover:underline underline-offset-4 decoration-2">Scores</Link>
                <Link to="/dashboard" className="hover:underline underline-offset-4 decoration-2">Dashboard</Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="rounded-xl border-2 border-creem-dark bg-creem-dark px-3 py-1 text-creem-white shadow-brutal-sm">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="btn-secondary px-4 py-2 text-sm ml-2">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary px-6 py-2 text-sm ml-2">Join Now</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto mt-8 max-w-6xl"><Outlet /></main>
    </div>
  );
};

export default MainLayout;
