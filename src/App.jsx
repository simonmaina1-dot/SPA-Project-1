import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Toast from "./components/Toast/Toast";
import Home from "./pages/Home";
import AddProject from "./pages/AddProject";
import ProjectDetails from "./pages/ProjectDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Donate from "./pages/Donate";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import SubmitProjectOverview from "./pages/SubmitProjectOverview";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import About from "./pages/About/About";
import Projects from "./pages/Projects/Projects";
import Account from "./pages/Account/Account";
import "./App.css";

function NotFound() {
  return (
    <div className="page not-found-page">
      <section className="empty-state">
        <h2>Page not found</h2>
        <p>The link you followed does not exist yet.</p>
        <Link to="/" className="btn btn--primary">
          Go to home
        </Link>
      </section>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const hideMainNav = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-shell">
      {!hideMainNav && <Navbar />}
      <main className={`main-content${hideMainNav ? " main-content--flush" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/add" element={<AddProject />} />
          <Route path="/submit-project" element={<SubmitProjectOverview />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/donate/:projectId" element={<Donate />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>Community Donation Hub</span>
        <span>Built for local impact</span>
        <span>© 2026 Community Donation Hub</span>
      </footer>
      <Toast />
    </div>
  );
}
