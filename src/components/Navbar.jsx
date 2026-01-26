import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const navSections = [
  { id: "featured", label: "Featured Projects" },
  { id: "projects", label: "All Projects" },
  { id: "about", label: "About" },
];

export default function Navbar() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const linkRefs = useRef({});

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
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const targetId = location.hash.replace("#", "");
    if (navSections.some((section) => section.id === targetId)) {
      setActiveSection(targetId);
    }
  }, [location.hash]);

  useEffect(() => {
    if (!activeSection) {
      setIndicatorStyle({ opacity: 0, width: 0 });
      return;
    }

    const activeLink = linkRefs.current[activeSection];
    if (!activeLink) {
      return;
    }

    const { offsetLeft, offsetWidth } = activeLink;
    setIndicatorStyle({
      transform: `translateX(${offsetLeft}px)`,
      width: `${offsetWidth}px`,
      opacity: 1,
    });
  }, [activeSection, location.pathname]);

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
        <span className="nav-active-indicator" style={indicatorStyle} aria-hidden="true" />
        {navSections.map((section) => (
          <Link
            key={section.id}
            to={`/projects#${section.id}`}
            className={`nav-link${isSectionActive(section.id) ? " active" : ""}`}
            ref={(node) => {
              if (node) {
                linkRefs.current[section.id] = node;
              }
            }}
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
