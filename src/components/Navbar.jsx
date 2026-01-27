import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add shadow when scrolled
      setScrolled(currentScrollY > 10);

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setHidden(true);
      } else {
        // Scrolling up
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}${hidden ? " hidden" : ""}`}>
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>
      <nav className="nav-links">
        <Link to="/projects#featured" className="nav-link">
          Featured Projects
        </Link>
        <Link to="/projects#projects" className="nav-link">
          All Projects
        </Link>
        <Link to="/projects#about" className="nav-link">
          About
        </Link>
      </nav>
    </header>
  );
}
