import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const navSections = [
  { id: "featured", label: "Featured Projects" },
  { id: "projects", label: "All Projects" },
  { id: "about", label: "About" },
];

export default function Navbar() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (location.pathname !== "/projects") {
      setActiveSection("");
      return;
    }

    const elements = navSections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  const isSectionActive = (id) => {
    if (location.pathname !== "/projects") {
      return false;
    }
    if (activeSection) {
      return activeSection === id;
    }
    return location.hash === `#${id}`;
  };

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>
      <nav className="nav-links">
        {navSections.map((section) => (
          <Link
            key={section.id}
            to={`/projects#${section.id}`}
            className={`nav-link${isSectionActive(section.id) ? " active" : ""}`}
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
