import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";

export default function SignUp() {
  const { showToast } = useContext(ToastContext);
  const { registerAccount, currentUser } = useAuth();
  const navigate = useNavigate();
  const [signupValues, setSignupValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signupError, setSignupError] = useState("");

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupError("");

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
      <div className="page account-page">
        <section className="page-header">
          <h1>Account already active</h1>
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
        <h1>Create account</h1>
        <p>Create your user account to get started.</p>
      </section>

      <div className="account-grid account-grid-single">
        <form className="account-card account-card--narrow" onSubmit={handleSignupSubmit}>
          <h2>Sign up</h2>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Full name</span>
              <input
                type="text"
                name="name"
                value={signupValues.name}
                onChange={handleSignupChange}
                placeholder="Jane Doe"
                required
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
                required
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <input
                type="password"
                name="password"
                value={signupValues.password}
                onChange={handleSignupChange}
                placeholder="Create a password"
                required
              />
            </label>

          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create account
            </button>
          </div>

          <p className="account-note">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
