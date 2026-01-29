import { Link } from "react-router-dom";

export default function AdminNavbar({ currentUser, onSignOut }) {
  return (
    <nav className="admin-navbar">
      <Link to="/" className="admin-brand">
        Community Donation Hub
      </Link>
      <div className="admin-navbar-right">
        <Link to="/" className="admin-back-link">
          Back to main site
        </Link>
        <span className="admin-user-info">
          Signed in as {currentUser.name} ({currentUser.role})
        </span>
        <button type="button" className="btn btn-secondary" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
