import { useState } from "react";

export default function AdminInsightsGrid({
  metrics,
  reviewList,
  formatCurrency,
}) {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardType) => {
    setSelectedCard(selectedCard === cardType ? null : cardType);
  };

  const renderPopupContent = () => {
    switch (selectedCard) {
      case "funding":
        return (
          <div className="insight-popup-content">
            <h5>Funding Breakdown</h5>
            <div className="insight-popup-stats">
              <div className="insight-popup-stat">
                <span className="stat-label">Total Raised</span>
                <span className="stat-value">{formatCurrency(metrics.totalRaised)}</span>
              </div>
              <div className="insight-popup-stat">
                <span className="stat-label">Total Goal</span>
                <span className="stat-value">{formatCurrency(metrics.totalGoal)}</span>
              </div>
              <div className="insight-popup-stat">
                <span className="stat-label">Completion</span>
                <span className="stat-value">{Math.round(metrics.completion * 100)}%</span>
              </div>
            </div>
          </div>
        );
      case "category":
        return (
          <div className="insight-popup-content">
            <h5>All Categories</h5>
            <div className="insight-popup-list">
              {metrics.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="insight-popup-row">
                  <span className="row-title">
                    {cat.category?.charAt(0).toUpperCase() + cat.category?.slice(1)}
                  </span>
                  <span className="row-count">{cat.count} projects</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "review":
        return (
          <div className="insight-popup-content">
            <h5>Projects Pending Review</h5>
            {reviewList.length > 0 ? (
              <div className="insight-popup-list">
                {reviewList.slice(0, 5).map((project) => (
                  <div key={project.id} className="insight-popup-row">
                    <span className="row-title">{project.title}</span>
                    <span className="row-status">Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="insight-popup-empty">No projects pending review.</p>
            )}
          </div>
        );
      case "attention":
        return (
          <div className="insight-popup-content">
            <h5>Projects Below 40% Funding</h5>
            {metrics.needsAttention.length > 0 ? (
              <div className="insight-popup-list">
                {metrics.needsAttention.slice(0, 5).map((project) => (
                  <div key={project.id} className="insight-popup-row">
                    <span className="row-title">{project.title}</span>
                    <span className="row-progress">{project.progress}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="insight-popup-empty">All projects above threshold.</p>
            )}
          </div>
        );
      case "top":
        return (
          <div className="insight-popup-content">
            <h5>Top Performing Projects</h5>
            {metrics.topProjects.length > 0 ? (
              <div className="insight-popup-list">
                {metrics.topProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="insight-popup-row">
                    <span className="row-title">{project.title}</span>
                    <span className="row-progress top">{project.progress}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="insight-popup-empty">No projects found.</p>
            )}
          </div>
        );
      case "active":
        return (
          <div className="insight-popup-content">
            <h5>Campaign Statistics</h5>
            <div className="insight-popup-stats">
              <div className="insight-popup-stat">
                <span className="stat-label">Active Campaigns</span>
                <span className="stat-value">{metrics.activeCount}</span>
              </div>
              <div className="insight-popup-stat">
                <span className="stat-label">Average Donation</span>
                <span className="stat-value">{formatCurrency(metrics.averageDonation)}</span>
              </div>
              <div className="insight-popup-stat">
                <span className="stat-label">Total Donations</span>
                <span className="stat-value">{metrics.donationCount || 0}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-insights-grid admin-card-wide">
      <article
        className={`admin-insight-card clickable ${selectedCard === "funding" ? "active" : ""}`}
        onClick={() => handleCardClick("funding")}
      >
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
        {selectedCard === "funding" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>

      <article
        className={`admin-insight-card clickable ${selectedCard === "category" ? "active" : ""}`}
        onClick={() => handleCardClick("category")}
      >
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
        {selectedCard === "category" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>

      <article
        className={`admin-insight-card clickable ${selectedCard === "review" ? "active" : ""}`}
        onClick={() => handleCardClick("review")}
      >
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
        {selectedCard === "review" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>

      <article
        className={`admin-insight-card clickable ${selectedCard === "attention" ? "active" : ""}`}
        onClick={() => handleCardClick("attention")}
      >
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
        {selectedCard === "attention" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>

      <article
        className={`admin-insight-card clickable ${selectedCard === "top" ? "active" : ""}`}
        onClick={() => handleCardClick("top")}
      >
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
        {selectedCard === "top" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>

      <article
        className={`admin-insight-card clickable ${selectedCard === "active" ? "active" : ""}`}
        onClick={() => handleCardClick("active")}
      >
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
        {selectedCard === "active" && (
          <div className="insight-popup">{renderPopupContent()}</div>
        )}
      </article>
    </div>
  );
}
