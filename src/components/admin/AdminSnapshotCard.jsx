export default function AdminSnapshotCard({ projectCount, metrics, formatCurrency }) {
  return (
    <article className="admin-card admin-card-snapshot">
      <h3>Platform snapshot</h3>
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{projectCount}</span>
          <span className="admin-stat-label">Active projects</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{metrics.totalDonors}</span>
          <span className="admin-stat-label">Total donors</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(metrics.totalRaised)}
          </span>
          <span className="admin-stat-label">Total raised</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(metrics.averageDonation)}
          </span>
          <span className="admin-stat-label">Average donation</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{metrics.fundedCount}</span>
          <span className="admin-stat-label">Fully funded</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(Math.max(0, metrics.totalGoal - metrics.totalRaised))}
          </span>
          <span className="admin-stat-label">Remaining need</span>
        </div>
      </div>
    </article>
  );
}
