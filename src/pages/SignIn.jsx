import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";

export default function SignIn() {
  const { showToast } = useContext(ToastContext);
  const { signInAdmin, signInUser, currentUser } = useAuth();
  const navigate = useNavigate();
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

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError("");

    
    const { isValid, errors } = await validateForm(loginSchema, loginValues);
    if (!isValid) {
      const errorMessage = Object.values(errors).join(", ");
      setLoginError(errorMessage);
      showToast(errorMessage, "warning"); 
      return; 
    }

    
    const isAdminLogin = loginValues.role === "admin";
    const loginFn = isAdminLogin ? signInAdmin : signInUser;
    const result = loginFn(loginValues.email, loginValues.password);

    if (!result.ok) {
      const userResult = signInUser(loginValues.email, loginValues.password);
      if (!userResult.ok) {
        setLoginError(userResult.message);
        showToast(userResult.message, "warning");
        return;
      }
      showToast(`Welcome back, ${userResult.user.name}.`, "success");
      setLoginValues({ email: "", password: "" });
      navigate("/user-dashboard");
      return;
    }

    showToast(`Welcome back, ${result.user.name}.`, "success");
    setLoginValues({ email: "", password: "" });
<<<<<<< HEAD
    navigate(result.user.isAdmin ? "/admin" : "/user-dashboard");
=======
    navigate("/admin");
>>>>>>> parent of 5aed94d (ui(auth): add visible show/hide password button)
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
                  <span className="password-toggle-label">
                    {showPassword ? "Hide" : "Show"}
                  </span>
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

            <label className="form-field">
              <span className="form-label">Account type</span>
              <select
                name="role"
                value={loginValues.role}
                onChange={handleLoginChange}
                placeholder="Enter your password"
              />
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
