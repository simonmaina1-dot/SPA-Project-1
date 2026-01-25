import { Link } from "react-router-dom";
import useProjects from "../hooks/useProjects";

export default function ProjectCard({ project, onClick, featured = false }) {
  const { formatCurrency } = useProjects();
  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

  const cardBody = (
    <article className={`project-card${featured ? " featured" : ""}`}>
      <div className="project-card-header">
        <div>
          <span className="project-category">{project.category}</span>
          <h3>{project.title}</h3>
        </div>
        {featured && <span className="project-tag">Featured</span>}
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span>{formatCurrency(project.currentAmount)}</span>
          <span>{progress}% funded</span>
        </div>
      </div>
      <div className="project-card-footer">
        <span className="project-goal">Goal {formatCurrency(project.goal)}</span>
        <span className="project-donors">{project.donorCount || 0} donors</span>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <button type="button" className="project-card-button" onClick={onClick}>
        {cardBody}
      </button>
    );
  }

  return (
    <Link to={`/projects/${project.id}`} className="project-card-link">
      {cardBody}
    </Link>
  );
}
