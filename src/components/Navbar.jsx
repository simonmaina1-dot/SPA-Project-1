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
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0.2,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (!activeSection) {
      setIndicatorStyle({});
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
  }, [activeSection]);

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
        <span className="nav-active-indicator" style={indicatorStyle} />
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
