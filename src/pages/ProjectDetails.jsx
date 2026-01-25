import { Link, useParams } from "react-router-dom";
import useProjects from "../hooks/useProjects";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { projects, formatCurrency } = useProjects();

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <div className="page project-details-page">
        <section className="empty-state">
          <h2>Project not found</h2>
          <p>The project you are looking for does not exist yet.</p>
          <Link to="/" className="btn btn-primary">
            Back to projects
          </Link>
        </section>
      </div>
    );
  }

  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

  return (
    <div className="page project-details-page">
      <section className="details-header">
        <div>
          <span className="project-category">{project.category}</span>
          <h1>{project.title}</h1>
          <p className="project-description">{project.description}</p>
        </div>
        <div className="details-meta">
          <span className="status-pill">{project.status}</span>
          <span>{project.donorCount || 0} donors</span>
        </div>
      </section>

      <section className="details-grid">
        <div className="details-card">
          <h3>Funding progress</h3>
          <div className="progress-bar large">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>{formatCurrency(project.currentAmount)}</span>
            <span>{progress}% funded</span>
          </div>
          <p className="details-goal">Goal {formatCurrency(project.goal)}</p>
          <Link to={`/donate/${project.id}`} className="btn btn-primary">
            Donate to this project
          </Link>
        </div>

        <div className="details-card">
          <h3>Project highlights</h3>
          <ul className="detail-list">
            <li>Community driven leadership</li>
            <li>Transparent donation tracking</li>
            <li>Monthly progress updates</li>
          </ul>
          <Link to="/" className="btn btn-secondary">
            Explore more projects
          </Link>
        </div>
      </section>
    </div>
  );
}
