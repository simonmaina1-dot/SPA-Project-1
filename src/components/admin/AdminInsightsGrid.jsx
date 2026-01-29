export default function AdminInsightsGrid({
  metrics,
  reviewList,
  formatCurrency,
  onApprove,
  onFlag,
}) {
  return (
    <div className="admin-insights-grid admin-card-wide">
      <article className="admin-card">
        <h3>Funding health</h3>
        <p className="admin-card-subtitle">
          Track platform-wide progress toward the full fundraising goal.
        </p>
        <div className="admin-health">
          <div className="admin-health-header">
            <span className="admin-health-value">
              {Math.min(100, Math.round(metrics.completion * 100))}%
            </span>
            <span className="admin-health-label">of total goal funded</span>
          </div>
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, Math.round(metrics.completion * 100))}%`,
              }}
            />
          </div>
          <div className="admin-health-meta">
            <span>{formatCurrency(metrics.totalRaised)} raised</span>
            <span>{formatCurrency(metrics.totalGoal)} goal</span>
          </div>
        </div>
        <div className="admin-health-grid">
          <div className="admin-health-card">
            <span className="admin-health-title">Average donation</span>
            <span className="admin-health-stat">
              {formatCurrency(metrics.averageDonation)}
            </span>
          </div>
          <div className="admin-health-card">
            <span className="admin-health-title">Active campaigns</span>
            <span className="admin-health-stat">{metrics.activeCount}</span>
          </div>
        </div>
      </article>

      <article className="admin-card">
        <h3>Category focus</h3>
        <p className="admin-card-subtitle">
          Where new projects are concentrated this cycle.
        </p>
        <div className="admin-breakdown">
          {metrics.categoryBreakdown.length === 0 && (
            <p className="admin-empty">No project categories yet.</p>
          )}
          {metrics.categoryBreakdown.map((item) => (
            <div key={item.category} className="admin-breakdown-row">
              <div className="admin-breakdown-label">
                <span className="admin-row-title">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
                <span className="admin-row-meta">{"  " + item.count} projects</span>
              </div>
              <div className="admin-breakdown-bar">
                <div
                  className="admin-breakdown-fill"
                  style={{
                    width: `${(item.count / metrics.maxCategoryCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <h3>Review queue</h3>
        <p className="admin-card-subtitle">
          {metrics.reviewQueue.length > 0
            ? `${metrics.reviewQueue.length} project(s) flagged for review.`
            : "No projects flagged. Quick check-in list below."}
        </p>
        <div className="admin-list">
          {reviewList.map((project) => (
            <div key={project.id} className="admin-row">
              <div>
                <p className="admin-row-title">{project.title}</p>
                <span className="admin-row-meta">
                  {project.category.charAt(0).toUpperCase() +
                    project.category.slice(1)} - {project.donorCount || 0} donors
                </span>
              </div>
              <div className="admin-row-actions">
                {project.status === "review" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onApprove(project.id)}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onFlag(project.id)}
                  >
                    Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card admin-card-stretch">
        <h3>Needs attention</h3>
        <p className="admin-card-subtitle">
          Projects below 40% funded that may need outreach.
        </p>
        <div className="admin-list">
          {metrics.needsAttention.length === 0 && (
            <p className="admin-empty">All projects are tracking well.</p>
          )}
          {metrics.needsAttention.map((project) => (
            <div key={project.id} className="admin-row">
              <div>
                <p className="admin-row-title">{project.title}</p>
                <span className="admin-row-meta">
                  {project.progress}% funded - {formatCurrency(project.currentAmount)} of{" "}
                  {formatCurrency(project.goal)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card admin-card-stretch">
        <h3>Top performers</h3>
        <p className="admin-card-subtitle">
          Highest funded campaigns right now.
        </p>
        <div className="admin-list">
          {metrics.topProjects.map((project) => (
            <div key={project.id} className="admin-row">
              <div>
                <p className="admin-row-title">{project.title}</p>
                <span className="admin-row-meta">
                  {formatCurrency(project.currentAmount)} raised
                </span>
              </div>
              <span className="admin-pill">{project.progress}% funded</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
