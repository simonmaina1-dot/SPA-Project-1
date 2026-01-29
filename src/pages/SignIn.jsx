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
    role: "user",
  });
  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError("");

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
    navigate(isAdminLogin ? "/dashboard" : "/account");
  };

  if (currentUser) {
    const accountDestination = currentUser.isAdmin ? "/dashboard" : "/account";
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
                Go to {currentUser.isAdmin ? "dashboard" : "account"}
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
        <p>Access your user, donor, or admin account.</p>
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
                required
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <input
                type="password"
                name="password"
                value={loginValues.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                required
              />
            </label>

            <label className="form-field">
              <span className="form-label">Account type</span>
              <select
                name="role"
                value={loginValues.role}
                onChange={handleLoginChange}
              >
                <option value="user">User/Donor</option>
                <option value="admin">Admin</option>
              </select>
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
