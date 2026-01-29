export default function AdminDashboardHeader({ role }) {
  return (
    <section className="page-header">
      <div className="admin-header-row">
        <h1>Admin Dashboard</h1>
        <span className="admin-role-pill">{role}</span>
      </div>
      <p>
        Monitor campaigns, manage approvals, and keep community fundraising on
        track.
      </p>
    </section>
  );
}
