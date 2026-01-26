import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>
      <nav className="nav-links">
        <Link to="/projects#featured" className="nav-link">
          Featured Projects
        </Link>
        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          All Projects
        </NavLink>
        <Link to="/projects#about" className="nav-link">
          About
        </Link>
      </nav>
    </header>
  );
}
