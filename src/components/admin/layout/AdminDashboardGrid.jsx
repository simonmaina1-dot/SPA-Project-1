import AdminSnapshotCard from "../dashboard/AdminSnapshotCard";
import AdminRecentActivity from "../dashboard/AdminRecentActivity";
import AdminProjectManagement from "../projects/AdminProjectManagement";
import AdminInsightsGrid from "../dashboard/AdminInsightsGrid";
import AdminFeedbackList from "../projects/AdminFeedbackList";
import AdminVettingQueue from "../projects/AdminVettingQueue";
import FundUtilizationSection from "../finance/FundUtilizationSection";

export default function AdminDashboardGrid({
  projects,
  donations,
  formatCurrency,
  metrics,
  reviewList,
  projectManagementProps,
  feedbackProps,
  vettingProps,
}) {
  return (
    <section className="admin-grid">
      <AdminSnapshotCard
        projectCount={projects.length}
        metrics={metrics}
        formatCurrency={formatCurrency}
      />

      <AdminRecentActivity projects={projects} formatCurrency={formatCurrency} />

      <AdminInsightsGrid
        metrics={metrics}
        reviewList={reviewList}
        formatCurrency={formatCurrency}
      />

      <AdminProjectManagement {...projectManagementProps} />

      <AdminVettingQueue {...vettingProps} />

      <div className="admin-grid-full-width">
        <FundUtilizationSection
          projects={projects}
          donations={donations}
          formatCurrency={formatCurrency}
        />
      </div>

      <AdminFeedbackList {...feedbackProps} />
    </section>
  );
}
