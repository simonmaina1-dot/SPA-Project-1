import { useState, useMemo } from 'react';
import './AdminOverviewSection.css';

// Type definitions
/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {number} fundedPercentage - 0-100
 * @property {number} amountRaised
 * @property {number} goalAmount
 */

/**
 * @typedef {Object} AdminOverviewSectionProps
 * @property {Project[]} projects
 */

// Format currency for display
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for display
const formatPercentage = (percentage) => {
  return `${Math.round(percentage)}%`;
};

// Chevron Icon Component
function ChevronIcon({ className, expanded }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`chevron-icon ${expanded ? 'expanded' : ''} ${className || ''}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

/**
 * Collapsible Card Component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.summary - Summary content shown when collapsed
 * @param {React.ReactNode} props.children - Full content shown when expanded
 * @param {boolean} props.isExpanded - Current expanded state
 * @param {Function} props.onToggle - Toggle function
 * @param {string} props.headerClass - Additional header class
 */
function CollapsibleCard({ title, summary, children, isExpanded, onToggle, headerClass = '' }) {
  return (
    <div className={`collapsible-card ${isExpanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className={`card-header-toggle ${headerClass}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="header-left">
          <h3 className="card-title">{title}</h3>
          {summary && <div className="card-summary">{summary}</div>}
        </div>
        <ChevronIcon expanded={isExpanded} className="chevron" />
      </button>
      <div className={`card-content-wrapper ${isExpanded ? 'open' : ''}`}>
        <div className="card-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Needs Attention Card - Shows projects with fundedPercentage < 40%
 */
function NeedsAttentionCard({ projects }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const needsAttentionProjects = useMemo(() => {
    return projects
      .filter((project) => (project.fundedPercentage || 0) < 40)
      .sort((a, b) => a.fundedPercentage - b.fundedPercentage);
  }, [projects]);

  const projectCount = needsAttentionProjects.length;

  const summary = (
    <span className="summary-text">
      {projectCount > 0
        ? `<40% funded • ${projectCount} project${projectCount !== 1 ? 's' : ''}`
        : 'All projects above 40%'}
    </span>
  );

  if (projectCount === 0) {
    return (
      <CollapsibleCard
        title="Needs Attention"
        summary={summary}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        headerClass="attention-header"
      >
        <p className="empty-message">✓ All projects are above 40% funded</p>
      </CollapsibleCard>
    );
  }

  return (
    <CollapsibleCard
      title="Needs Attention"
      summary={summary}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      headerClass="attention-header"
    >
      <ul className="project-list">
        {needsAttentionProjects.map((project) => (
          <li key={project.id} className="project-item">
            <div className="project-header">
              <span className="project-name">{project.name}</span>
              <span className="project-percentage warning">
                {formatPercentage(project.fundedPercentage)}
              </span>
            </div>
            <div className="project-amounts">
              <span className="amount-raised">{formatCurrency(project.amountRaised)}</span>
              <span className="amount-divider">/</span>
              <span className="amount-goal">{formatCurrency(project.goalAmount)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill warning"
                style={{ width: `${Math.min(project.fundedPercentage, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </CollapsibleCard>
  );
}

/**
 * Top Performers Card - Shows top 4 projects by fundedPercentage
 */
function TopPerformersCard({ projects }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const topPerformers = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.fundedPercentage - a.fundedPercentage)
      .slice(0, 4);
  }, [projects]);

  const topProject = topPerformers[0];

  const summary = topProject ? (
    <span className="summary-text">
      {topProject.name.length > 25
        ? `${topProject.name.substring(0, 25)}...`
        : topProject.name}{' '}
      <span className="summary-badge">{formatPercentage(topProject.fundedPercentage)}</span>
    </span>
  ) : (
    <span className="summary-text">No projects yet</span>
  );

  return (
    <CollapsibleCard
      title="Top Performers"
      summary={summary}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      headerClass="performers-header"
    >
      <ul className="top-performers-list">
        {topPerformers.map((project, index) => (
          <li key={project.id} className="top-performer-item">
            <div className="performer-rank">
              <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
            </div>
            <div className="performer-info">
              <span className="performer-name">{project.name}</span>
              <span className="performer-percentage">
                {formatPercentage(project.fundedPercentage)}
              </span>
            </div>
            <div className="performer-amounts">
              <span className="performer-raised">{formatCurrency(project.amountRaised)}</span>
              <span className="performer-bar-container">
                <div
                  className="performer-bar-fill"
                  style={{ width: `${Math.min(project.fundedPercentage, 100)}%` }}
                />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </CollapsibleCard>
  );
}

/**
 * AdminOverviewSection Component
 * Displays two collapsible summary cards: Needs Attention and Top Performers
 */
export default function AdminOverviewSection({ projects = [] }) {
  return (
    <section className="admin-overview-section">
      <div className="overview-grid">
        <NeedsAttentionCard projects={projects} />
        <TopPerformersCard projects={projects} />
      </div>
    </section>
  );
}
