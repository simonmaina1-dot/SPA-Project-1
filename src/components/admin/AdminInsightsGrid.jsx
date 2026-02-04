import FundingHealthCard from "./FundingHealthCard";
import CategoryFocusCard from "./CategoryFocusCard";
import NeedsAttentionCard from "./NeedsAttentionCard";
import TopPerformersCard from "./TopPerformersCard";
import "./ExpandableCards.css";

export default function AdminInsightsGrid({
  metrics,
  reviewList,
  formatCurrency,
}) {
  return (
    <div className="admin-insights-grid admin-card-wide">
      <FundingHealthCard 
        totalRaised={metrics.totalRaised}
        totalGoal={metrics.totalGoal}
        percentage={Math.min(100, Math.round(metrics.completion * 100))}
      />
      
      <CategoryFocusCard 
        topCategory={metrics.categoryBreakdown[0]?.category?.charAt(0).toUpperCase() +
          metrics.categoryBreakdown[0]?.category?.slice(1) || 'N/A'}
        projectCount={metrics.categoryBreakdown[0]?.count || 0}
        categories={metrics.categoryBreakdown.length}
      />
      
      <div className="admin-insight-card">
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
      </div>
      
      <NeedsAttentionCard 
        projectCount={metrics.needsAttention.length}
      />
      
      <TopPerformersCard 
        topProject={metrics.topProjects[0]?.title || 'N/A'}
        percentage={metrics.topProjects[0]?.progress || 0}
      />
      
      <div className="admin-insight-card">
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
      </div>
    </div>
  );
}
