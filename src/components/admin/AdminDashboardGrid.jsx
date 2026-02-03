import AdminSnapshotCard from "./AdminSnapshotCard";
import AdminRecentActivity from "./AdminRecentActivity";
import AdminProjectManagement from "./AdminProjectManagement";
import AdminInsightsGrid from "./AdminInsightsGrid";
import AdminFeedbackList from "./AdminFeedbackList";
import AdminVettingQueue from "./AdminVettingQueue";
import FundUtilizationSection from "./FundUtilizationSection";

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
