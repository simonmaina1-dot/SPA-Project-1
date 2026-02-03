import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";
import { loginSchema } from "../validations/authSchemas";
import { validateForm } from "../utils/validationHelper";

export default function SignIn() {
  const { showToast } = useContext(ToastContext);
  const { signInAdmin, signInUser, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
    setLoginError(""); 
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");

    
    const { isValid, errors } = await validateForm(loginSchema, loginValues);
    if (!isValid) {
      const errorMessage = Object.values(errors).join(", ");
      setLoginError(errorMessage);
      showToast(errorMessage, "warning"); 
      return; 
    }

    // Try admin login first, then fall back to user login
    let result = signInAdmin(loginValues.email, loginValues.password);
    if (!result.ok) {
      result = signInUser(loginValues.email, loginValues.password);
    }

    if (!result.ok) {
      setLoginError(result.message);
      showToast(result.message, "warning");
      return;
    }

    showToast(`Welcome back, ${result.user.name}.`, "success");
    setLoginValues({ email: "", password: "" });
    navigate(result.user.isAdmin ? "/admin" : "/user-dashboard");
  };

  if (currentUser) {
    const accountDestination = currentUser.isAdmin ? "/admin" : "/user-dashboard";
    return (
      <div className="page account-page">
        <section className="page-header">
          <h1>Already signed in</h1>
          <p>You are signed in as {currentUser.name}.</p>
        </section>
        <div className="account-grid">
          <div className="account-card">
            <div className="account-actions">
              <Link to={accountDestination} className="btn btn-primary">
                Go to dashboard
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page account-page">
      <section className="page-header">
        <h1>Sign in</h1>
        <p>Access your account.</p>
      </section>

      <div className="account-grid account-grid-single">
        <form className="account-card account-card--narrow" onSubmit={handleLoginSubmit}>
          <h2>Sign in</h2>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                type="email"
                name="email"
                value={loginValues.email}
                onChange={handleLoginChange}
                placeholder="you@example.com"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginValues.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M3 3l18 18"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.6 10.6a3 3 0 0 0 4.2 4.2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.53 1.49-1.32 2.82-2.3 3.94M6.09 6.08C4.23 7.27 2.77 9.02 2 12c1.73 4.89 6 8 10 8 1.4 0 2.75-0.3 4-0.86"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </label>

          </div>

          {loginError && <p className="form-error">{loginError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </div>

          <p className="account-note">
            Need an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
