import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import "./Navbar.css";

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
  const { currentUser, signOut } = useAuth();

  const isHomePage = location.pathname === "/";

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
    <header className={`navbar${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}${!isHomePage ? " navbar-full" : ""}`}>
      <Link to="/" className="nav-brand">
        Community Donation Hub
      </Link>

      {isHomePage && (
        <>
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

          <nav className={`nav-menu${menuOpen ? " open" : ""}`}>
            {!currentUser && (
              <div className="nav-links">
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
              </div>
            )}
            <div className="nav-actions-mobile">
              {!currentUser && (
                <Link
                  to="/submit-project"
                  className="btn btn--primary nav-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  Submit a Project
                </Link>
              )}
              {currentUser ? (
                <>
                  <Link
                    to={currentUser.isAdmin ? "/dashboard" : "/user-dashboard"}
                    className={`btn btn-secondary nav-cta${isHomePage ? " btn-user-home" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {currentUser.name} ({currentUser.role})
                  </Link>
                  <button
                    className="btn btn-signout nav-cta"
                    onClick={() => {
                      signOut();
                      navigate("/");
                      setMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/signup" className="btn btn-secondary nav-cta" onClick={() => setMenuOpen(false)}>
                  Sign up / Sign in
                </Link>
              )}
            </div>
          </nav>
        </>
      )}

      {!isHomePage && (
        <nav className="nav-menu nav-menu-full">
          {!currentUser && (
            <div className="nav-links">
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
            </div>
          )}
          <div className="nav-actions-inline">
            {!currentUser && (
              <Link
                to="/submit-project"
                className="btn btn--primary nav-cta"
                onClick={() => setMenuOpen(false)}
              >
                Submit a Project
              </Link>
            )}
            {currentUser ? (
              <>
                <Link
                  to="/"
                  className="btn btn-home nav-cta"
                  title="Return to Home"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  to={currentUser.isAdmin ? "/dashboard" : "/user-dashboard"}
                  className="btn btn-secondary nav-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {currentUser.name} ({currentUser.role})
                </Link>
                <button
                  className="btn btn-signout nav-cta"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/signup" className="btn btn-secondary nav-cta" onClick={() => setMenuOpen(false)}>
                Sign up / Sign in
              </Link>
            )}
          </div>
        </nav>
      )}

      {isHomePage && (
        <div className="nav-actions-desktop">
          {!currentUser && (
            <Link
              to="/submit-project"
              className="btn btn--primary nav-cta"
              onClick={() => setMenuOpen(false)}
            >
              Submit a Project
            </Link>
          )}
          {currentUser ? (
            <>
              <Link
                to={currentUser.isAdmin ? "/dashboard" : "/user-dashboard"}
                className={`btn btn-secondary nav-cta${isHomePage ? " btn-user-home" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {currentUser.name} ({currentUser.role})
              </Link>
              <button
                className="btn btn-signout nav-cta"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/signup" className="btn btn-secondary nav-cta" onClick={() => setMenuOpen(false)}>
              Sign up / Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}