import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/projects", label: "Projects" },
  { to: "/add", label: "Add Project" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <Link to="/projects#about" className="nav-link">
          About
        </Link>
      </nav>
      <Link to="/add" className="btn btn-primary nav-cta">
        Start a Project
      </Link>
    </header>
  );
}
