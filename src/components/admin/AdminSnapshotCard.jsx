export default function AdminSnapshotCard({ projectCount, metrics, formatCurrency }) {
  return (
    <article className="admin-card admin-card-snapshot">
      <div className="admin-snapshot-header">
        <h3>Platform Snapshot</h3>
        <div className="admin-snapshot-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{projectCount}</span>
          <span className="admin-stat-label">Active Projects</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{metrics.totalDonors}</span>
          <span className="admin-stat-label">Total Donors</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(metrics.totalRaised)}
          </span>
          <span className="admin-stat-label">Total Raised</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(metrics.averageDonation)}
          </span>
          <span className="admin-stat-label">Avg Donation</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{metrics.fundedCount}</span>
          <span className="admin-stat-label">Fully Funded</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(Math.max(0, metrics.totalGoal - metrics.totalRaised))}
          </span>
          <span className="admin-stat-label">Remaining Need</span>
        </div>
      </div>
    </article>
  );
}
