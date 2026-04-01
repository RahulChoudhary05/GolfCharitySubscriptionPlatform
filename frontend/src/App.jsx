import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import DashboardPage from "./pages/DashboardPage";
import ScoreEntryPage from "./pages/ScoreEntryPage";
import CharityListPage from "./pages/CharityListPage";
import CharityDetailPage from "./pages/CharityDetailPage";
import DrawResultsPage from "./pages/DrawResultsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/scores" element={<ProtectedRoute><ScoreEntryPage /></ProtectedRoute>} />
      <Route path="/charities" element={<CharityListPage />} />
      <Route path="/charities/:id" element={<CharityDetailPage />} />
      <Route path="/draw-results" element={<DrawResultsPage />} />
      <Route path="/admin" element={<ProtectedRoute admin><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
