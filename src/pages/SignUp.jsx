import { useContext, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";
import { registerSchema } from "../validations/authSchemas";
import { validateForm } from "../utils/validationHelper";

export default function SignUp() {
  const { showToast } = useContext(ToastContext);
  const { registerAccount, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [signupValues, setSignupValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signupError, setSignupError] = useState("");
  const cardRef = useRef(null);

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupValues((prev) => ({ ...prev, [name]: value }));
    setSignupError("");
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupError("");

    const { isValid, errors } = await validateForm(registerSchema, signupValues);
    if (!isValid) {
      const errorMessage = Object.values(errors).join(", ");
      setSignupError(errorMessage);
      showToast(errorMessage, "warning");
      return;
    }

    const result = await registerAccount(signupValues);
    if (!result.ok) {
      setSignupError(result.message);
      showToast(result.message, "warning");
      return;
    }

    showToast(`Welcome, ${result.user.name}!`, "success");
    setSignupValues({ name: "", email: "", password: "" });
    navigate("/user-dashboard");
  };

  if (currentUser) {
    const accountDestination = currentUser.isAdmin ? "/dashboard" : "/user-dashboard";
    return (
      <div className="page signup-page">
        <div className="signup-card-container">
          <div className="signup-card" ref={cardRef} onMouseMove={handleMouseMove}>
            <div className="signup-header">
              <h1>Account already active</h1>
              <p>You are signed in as {currentUser.name}.</p>
            </div>
            <div className="signup-actions">
              <Link to={accountDestination} className="btn btn-primary signup-btn">
                Go to dashboard
              </Link>
              <Link to="/" className="btn btn-secondary signup-btn">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page signup-page">
      <div className="signup-card-container">
        <div className="signup-card" ref={cardRef} onMouseMove={handleMouseMove}>
          <div className="signup-header">
            <h1>Create account</h1>
            <p>Sign up to get started with Community Donation Hub</p>
          </div>

          <form className="signup-form" onSubmit={handleSignupSubmit}>
            <label className="form-field">
              <span className="form-label">Full name</span>
              <input
                type="text"
                name="name"
                value={signupValues.name}
                onChange={handleSignupChange}
                placeholder="Jane Doe"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                type="email"
                name="email"
                value={signupValues.email}
                onChange={handleSignupChange}
                placeholder="jane@example.com"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={signupValues.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle password-toggle--plain"
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

            {signupError && <p className="form-error">{signupError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary signup-btn">
                Create account
              </button>
            </div>

            <p className="signup-note">
              Already have an account? <Link to="/signin">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
