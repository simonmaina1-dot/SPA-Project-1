import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ToastContext } from "../context/ToastContext";

export default function AccountAccess() {
  const { showToast } = useContext(ToastContext);
  const {
    currentUser,
    switchRole,
    signOut,
  } = useAuth();
  const [roleChoice, setRoleChoice] = useState("user");

  useEffect(() => {
    if (currentUser && ["user", "donor"].includes(currentUser.role)) {
      setRoleChoice(currentUser.role);
    }
  }, [currentUser]);

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
          <div className="account-card">
            <h2>Get started</h2>
            <p className="account-note">
              Choose what you need. New here? Create an account first.
            </p>
            <div className="account-actions">
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
              <Link to="/signin" className="btn btn-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
