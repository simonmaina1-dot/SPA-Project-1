export default function AdminDashboardHeader({ role, onAddProject }) {
  return (
    <div className="admin-dashboard-header-box">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      <button className="add-project-btn" onClick={onAddProject}>
        + Add Project
      </button>
    </div>
  );
}
