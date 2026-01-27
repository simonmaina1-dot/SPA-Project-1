import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

const navItems = [
  { to: "/#featured", label: "Featured Projects", hash: "featured" },
  { to: "/#all-projects", label: "Projects", hash: "all-projects" },
  { to: "/#about", label: "About", hash: "about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToElement = useCallback((hash) => {
    const element = document.getElementById(hash);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setActiveSection(item.hash);
    setMenuOpen(false);
    if (location.pathname === "/") {
      scrollToElement(item.hash);
    } else {
      navigate("/");
      setTimeout(() => scrollToElement(item.hash), 100);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace("#", "");
      setActiveSection(hash);
      setTimeout(() => scrollToElement(hash), 100);
    }
  }, [location, scrollToElement]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = navItems.map((item) => document.getElementById(item.hash)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <div className={`nav-menu${menuOpen ? " open" : ""}`}>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={`nav-link${activeSection === item.hash ? " active" : ""}`}
              onClick={(e) => handleNavClick(e, item)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/add" className="btn btn-primary nav-cta" onClick={() => setMenuOpen(false)}>
            Start a Project
          </Link>
          <Link to="/dashboard" className="btn btn-secondary nav-cta" onClick={() => setMenuOpen(false)}>
            Admin Page
          </Link>
        </div>
      </div>
    </header>
  );
}
