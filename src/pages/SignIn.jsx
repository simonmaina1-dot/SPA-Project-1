import { useContext, useState, useRef } from "react";
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
    role: "user",
  });
  const [loginError, setLoginError] = useState("");
  const cardRef = useRef(null);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
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

    const isAdminLogin = loginValues.role === "admin";
    const loginFn = isAdminLogin ? signInAdmin : signInUser;
    const result = loginFn(loginValues.email, loginValues.password);

    if (!result.ok) {
      setLoginError(result.message);
      showToast(result.message, "warning");
      return;
    }

    showToast(`Welcome back, ${result.user.name}.`, "success");
    setLoginValues({ email: "", password: "", role: "user" });
    navigate(isAdminLogin ? "/dashboard" : "/user-dashboard");
  };

  if (currentUser) {
    const accountDestination = currentUser.isAdmin ? "/dashboard" : "/user-dashboard";
    return (
      <div className="page signin-page">
        <div className="signin-card-container">
          <div className="signin-card" ref={cardRef} onMouseMove={handleMouseMove}>
            <div className="signin-header">
              <h1>Already signed in</h1>
              <p>You are signed in as {currentUser.name}.</p>
            </div>
            <div className="signin-actions">
              <Link to={accountDestination} className="btn btn-primary signin-btn">
                Go to dashboard
              </Link>
              <Link to="/" className="btn btn-secondary signin-btn">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page signin-page">
      <div className="signin-card-container">
        <div className="signin-card" ref={cardRef} onMouseMove={handleMouseMove}>
          <div className="signin-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="signin-form" onSubmit={handleLoginSubmit}>
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
                className="signin-select"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {loginError && <p className="form-error">{loginError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary signin-btn">
                Sign in
              </button>
            </div>

            <p className="signin-note">
              Need an account? <Link to="/signup">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
