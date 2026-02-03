import useAuth from "../../hooks/useAuth";
import "./Account.css";

export default function Account() {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      signOut();
    }
  };

  if (!currentUser) {
    return (
      <div className="page account-page">
        <div className="account-header">
          <h1 className="account-title">Account</h1>
          <p className="account-subtitle">Please sign in to view your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page account-page">
      <div className="account-header">
        <h1 className="account-title">Your Dashboard</h1>
        <p className="account-subtitle">Welcome back, {currentUser.name}</p>
      </div>

      {/* Dashboard Stats */}
      <div className="user-dashboard-stats">
        <div className="user-stat-card">
          <div className="user-stat-value">0</div>
          <div className="user-stat-label">Donations Made</div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-value">Ksh 0</div>
          <div className="user-stat-label">Total Donated</div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-value">0</div>
          <div className="user-stat-label">Active Projects</div>
        </div>
      </div>

      <div className="account-form">
        {/* Profile Information */}
        <div className="account-section">
          <h3>Profile Information</h3>
          <div className="account-info">
            <div className="account-info-item">
              <span className="account-info-label">Name</span>
              <span className="account-info-value">{currentUser.name}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Email</span>
              <span className="account-info-value">{currentUser.email}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Role</span>
              <span className="account-info-value">
                {currentUser.isAdmin ? "Administrator" : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="account-section">
          <h3>Quick Actions</h3>
          <div className="account-actions">
            {currentUser.isAdmin && (
              <a href="/dashboard" className="btn btn--primary account-btn">
                🔧 Admin Dashboard
              </a>
            )}
            <a href="/user-dashboard" className="btn btn--secondary account-btn">
              📊 My Projects
            </a>
            <a href="/submit-project" className="btn btn--secondary account-btn">
              ➕ Submit New Project
            </a>
          </div>
        </div>

        {/* My Donations */}
        <div className="account-section">
          <h3>My Donations</h3>
          <div className="user-dashboard-empty">
            <p style={{ color: '#8b9bb4' }}>No donations yet. Explore projects to get started!</p>
            <a href="/projects" className="btn btn--secondary account-btn">
              View All Projects
            </a>
          </div>
        </div>

        {/* Account Settings */}
        <div className="account-section">
          <h3>Account Settings</h3>
          <div className="account-actions">
            <button onClick={handleSignOut} className="account-btn account-btn--danger">
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
