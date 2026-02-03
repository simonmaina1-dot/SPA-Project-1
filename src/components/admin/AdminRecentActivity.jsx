export default function AdminRecentActivity({ projects, formatCurrency }) {
  return (
    <article className="admin-card admin-card-activity">
      <div className="admin-section-header">
        <h3>Recent Activity</h3>
      </div>
      <div className="admin-timeline">
        {projects
          .filter(
            (project) =>
              !["Community Solar Garden", "Mobile Health Clinic"].includes(
                project.title
              )
          )
          .slice(0, 5)
          .map((project, index) => (
            <div key={project.id} className="admin-activity">
              <span className="admin-activity-dot" />
              <div className="admin-activity-content">
                <p className="admin-activity-title">
                  {project.title} received a donation
                </p>
                <span className="admin-activity-meta">
                  {formatCurrency(Math.round((project.currentAmount || 0) / 4))} -{" "}
                  {project.category}
                </span>
                <span className="admin-activity-time">
                  {index === 0
                    ? "Just now"
                    : index === 1
                      ? "Today"
                      : "This week"}
                </span>
              </div>
            </div>
          ))}
      </div>
    </article>
  );
}
