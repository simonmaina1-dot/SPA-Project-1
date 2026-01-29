export default function AdminRecentActivity({ projects, formatCurrency }) {
  return (
    <article className="admin-card admin-card-activity">
      <h3>Recent activity</h3>
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
              <div>
                <p className="admin-row-title">
                  {project.title} received a donation
                </p>
                <span className="admin-row-meta">
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
