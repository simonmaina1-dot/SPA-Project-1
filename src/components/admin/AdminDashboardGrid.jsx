import AdminSnapshotCard from "./AdminSnapshotCard";
import AdminRecentActivity from "./AdminRecentActivity";
import AdminProjectManagement from "./AdminProjectManagement";
import AdminInsightsGrid from "./AdminInsightsGrid";
import AdminTopDonorsTable from "./AdminTopDonorsTable";
import AdminFeedbackList from "./AdminFeedbackList";
import AdminVettingQueue from "./AdminVettingQueue";
import AdminFundTracking from "./AdminFundTracking";

export default function AdminDashboardGrid({
  projects,
  formatCurrency,
  metrics,
  reviewList,
  donorMetrics,
  onApprove,
  onFlag,
  projectManagementProps,
  feedbackProps,
  vettingProps,
  fundTrackingProps,
}) {
  return (
    <section className="admin-grid">
      <AdminSnapshotCard
        projectCount={projects.length}
        metrics={metrics}
        formatCurrency={formatCurrency}
      />

      <AdminRecentActivity projects={projects} formatCurrency={formatCurrency} />

      <AdminProjectManagement {...projectManagementProps} />

      <AdminInsightsGrid
        metrics={metrics}
        reviewList={reviewList}
        formatCurrency={formatCurrency}
        onApprove={onApprove}
        onFlag={onFlag}
      />

      <AdminVettingQueue {...vettingProps} />

      <AdminFundTracking {...fundTrackingProps} />

      <AdminTopDonorsTable
        donorMetrics={donorMetrics}
        formatCurrency={formatCurrency}
      />

      <AdminFeedbackList {...feedbackProps} />
    </section>
  );
}
