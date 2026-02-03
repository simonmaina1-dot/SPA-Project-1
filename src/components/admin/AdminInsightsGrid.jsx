export default function AdminInsightsGrid({
  metrics,
  reviewList,
  formatCurrency,
}) {
  return (
    <div className="admin-insights-grid admin-card-wide">
      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Funding Health</h4>
          <span className="admin-insight-badge">
            {Math.min(100, Math.round(metrics.completion * 100))}%
          </span>
        </div>
        <div className="admin-insight-value">
          {formatCurrency(metrics.totalRaised)}
        </div>
        <div className="admin-insight-label">
          of {formatCurrency(metrics.totalGoal)} goal
        </div>
        <div className="progress-bar" style={{ marginTop: '16px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, Math.round(metrics.completion * 100))}%`,
            }}
          />
        </div>
      </article>

      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Category Focus</h4>
          <span className="admin-insight-badge">
            {metrics.categoryBreakdown.length} categories
          </span>
        </div>
        <div className="admin-insight-value">
          {metrics.categoryBreakdown[0]?.category?.charAt(0).toUpperCase() +
            metrics.categoryBreakdown[0]?.category?.slice(1) || 'N/A'}
        </div>
        <div className="admin-insight-label">
          Top category with {metrics.categoryBreakdown[0]?.count || 0} projects
        </div>
      </article>

      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Review Queue</h4>
          <span className="admin-insight-badge">
            {metrics.reviewQueue.length} pending
          </span>
        </div>
        <div className="admin-insight-value">
          {reviewList.length > 0 ? reviewList[0]?.title?.slice(0, 20) + '...' : 'All clear'}
        </div>
        <div className="admin-insight-label">
          {metrics.reviewQueue.length > 0
            ? 'Project(s) flagged for review'
            : 'No projects flagged'}
        </div>
      </article>

      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Needs Attention</h4>
          <span className="admin-insight-badge">
            {metrics.needsAttention.length} projects
          </span>
        </div>
        <div className="admin-insight-value">
          &lt;40% funded
        </div>
        <div className="admin-insight-label">
          Projects below funding threshold
        </div>
      </article>

      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Top Performers</h4>
          <span className="admin-insight-badge">
            {metrics.topProjects[0]?.progress || 0}%
          </span>
        </div>
        <div className="admin-insight-value">
          {metrics.topProjects[0]?.title?.slice(0, 20) || 'N/A'}...
        </div>
        <div className="admin-insight-label">
          Highest funded campaign
        </div>
      </article>

      <article className="admin-insight-card">
        <div className="admin-insight-header">
          <h4 className="admin-insight-title">Active Campaigns</h4>
          <span className="admin-insight-badge">
            {metrics.activeCount}
          </span>
        </div>
        <div className="admin-insight-value">
          {formatCurrency(metrics.averageDonation)}
        </div>
        <div className="admin-insight-label">
          Average donation amount
        </div>
      </article>
    </div>
  );
}
