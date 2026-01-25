import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Projects" },
  { to: "/add", label: "Add Project" },
  { to: "/about", label: "About" },
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
      </nav>
      <Link to="/add" className="btn btn-primary nav-cta">
        Start a Project
      </Link>
    </header>
  );
}
