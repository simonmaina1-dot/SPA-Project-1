import { Link } from "react-router-dom";

export default function AdminLoginView({
  credentials,
  showPassword,
  errorMessage,
  onChange,
  onTogglePassword,
  onSubmit,
}) {
  return (
    <div className="page admin-page">
      <nav className="admin-navbar">
        <Link to="/" className="admin-brand">
          Community Donation Hub
        </Link>
        <div className="admin-navbar-right">
          <Link to="/" className="admin-back-link">
            Back to main site
          </Link>
          <span className="admin-user-info">Admin access</span>
        </div>
      </nav>

      <div className="admin-content">
        <section className="page-header">
          <h1>Admin Access</h1>
          <p>This dashboard is password protected for approved administrators.</p>
        </section>

        <form className="form-card admin-login" onSubmit={onSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Admin email</span>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                placeholder="name@company.com"
                required
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={onTogglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.5 10.5a2.5 2.5 0 003 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.5 6.5A10.5 10.5 0 002 12c2.1 3.6 5.7 6 10 6 1.5 0 2.9-.3 4.2-.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.8 5.4A9.7 9.7 0 0112 5c4.3 0 7.9 2.4 10 7-1 1.7-2.2 3.1-3.7 4.1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M2 12c2.2-4 5.8-6.5 10-6.5S19.8 8 22 12c-2.2 4-5.8 6.5-10 6.5S4.2 16 2 12z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>
              </div>
            </label>
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
