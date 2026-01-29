import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";

const roleOptions = [
  { value: "user", label: "User" },
  { value: "donor", label: "Donor" },
  { value: "admin", label: "Admin" },
];

export default function AccountAccess() {
  const { showToast } = useContext(ToastContext);
  const {
    currentUser,
    signInAdmin,
    signInUser,
    registerAccount,
    switchRole,
    signOut,
  } = useAuth();
  const location = useLocation();

  const [signupValues, setSignupValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [signupError, setSignupError] = useState("");
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [loginError, setLoginError] = useState("");
  const [roleChoice, setRoleChoice] = useState("user");

  useEffect(() => {
    if (currentUser && ["user", "donor"].includes(currentUser.role)) {
      setRoleChoice(currentUser.role);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace("#", "");
    const element = document.getElementById(targetId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, [location.hash]);

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
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
    setSignupValues({ name: "", email: "", password: "", role: "user" });
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError("");

    const loginFn = loginValues.role === "admin" ? signInAdmin : signInUser;
    const result = loginFn(loginValues.email, loginValues.password);

    if (!result.ok) {
      setLoginError(result.message);
      showToast(result.message, "warning");
      return;
    }

    showToast(`Welcome back, ${result.user.name}.`, "success");
    setLoginValues({ email: "", password: "", role: "user" });
  };

  const handleRoleSwitch = async (event) => {
    event.preventDefault();
    const result = await switchRole(roleChoice);

    if (!result.ok) {
      showToast(result.message, "warning");
      return;
    }

    showToast(`Role updated to ${result.user.role}.`, "success");
  };

  return (
    <div className="page account-page">
      <section className="page-header">
        <h1>Account Access</h1>
        <p>
          Create an account as a user, donor, or admin. Users and donors can
          switch between roles anytime.
        </p>
      </section>

      {currentUser ? (
        <div className="account-grid">
          <div className="account-card">
            <h2>Signed in</h2>
            <p className="account-meta">{currentUser.name}</p>
            <p className="account-meta">{currentUser.email}</p>
            <p className="account-meta">Role: {currentUser.role}</p>

            {currentUser.role === "admin" ? (
              <p className="account-note">
                Admin accounts stay admin-only. Create a separate user or donor
                account if needed.
              </p>
            ) : (
              <form className="account-switch" onSubmit={handleRoleSwitch}>
                <label className="form-field">
                  <span className="form-label">Switch role</span>
                  <select
                    name="role"
                    value={roleChoice}
                    onChange={(event) => setRoleChoice(event.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="donor">Donor</option>
                  </select>
                </label>
                <button type="submit" className="btn btn-primary">
                  Update role
                </button>
              </form>
            )}

            <div className="account-actions">
              <button type="button" className="btn btn-secondary" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-grid">
          <form
            id="signup"
            className="account-card"
            onSubmit={handleSignupSubmit}
          >
            <h2>Create account</h2>
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

              <label className="form-field">
                <span className="form-label">Role</span>
                <select
                  name="role"
                  value={signupValues.role}
                  onChange={handleSignupChange}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {signupError && <p className="form-error">{signupError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Sign up
              </button>
            </div>
          </form>

          <form
            id="signin"
            className="account-card"
            onSubmit={handleLoginSubmit}
          >
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
          </form>
        </div>
      )}
    </div>
  );
}
