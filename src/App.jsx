import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import AddProject from "./pages/AddProject";
import ProjectDetails from "./pages/ProjectDetails";
import About from "./pages/About";
import "./App.css";

function NotFound() {
  return (
    <div className="page not-found-page">
      <section className="empty-state">
        <h2>Page not found</h2>
        <p>The link you followed does not exist yet.</p>
        <Link to="/" className="btn btn-primary">
          Go to home
        </Link>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddProject />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>Community Donation Hub</span>
        <span>Built for local impact</span>
      </footer>
      <Toast />
    </div>
  );
}
