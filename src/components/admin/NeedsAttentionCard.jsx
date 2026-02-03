import './ExpandableCards.css';

/**
 * ExclamationTriangleIcon - Warning icon
 */
function ExclamationTriangleIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

/**
 * NeedsAttentionCard Component
 * Displays projects below 40% funding threshold with intervention options
 * Compact always-visible design
 * 
 * @param {Object} props
 * @param {number} projectCount - Number of projects needing attention
 */
export function NeedsAttentionCard({ projectCount }) {
  // Projects below 40% funding
  const strugglingProjects = [
    {
      id: 1,
      title: 'After-School Arts Collective',
      raised: 6876,
      goal: 9500,
      percentage: 72,
      daysLeft: 12
    },
    {
      id: 2,
      title: 'Mobile Health Clinic',
      raised: 26150,
      goal: 18000,
      percentage: 145,
      daysLeft: 8
    },
    {
      id: 3,
      title: 'Neighborhood Learning Lab',
      raised: 10307,
      goal: 12000,
      percentage: 86,
      daysLeft: 15
    }
  ];

  // Helper to get progress bar color based on percentage
  const getProgressColor = (percent) => {
    if (percent < 40) return 'danger';
    if (percent < 70) return 'warning';
    return 'success';
  };

  // Helper to get percentage text color
  const getPercentageColor = (percent) => {
    if (percent < 40) return 'danger';
    if (percent < 70) return 'warning';
    return 'success';
  };

  return (
    <div className="expandable-card">
      {/* Card Header */}
      <div className="card-header" style={{ cursor: 'default' }}>
        <div className="card-header-content">
          <div className="header-left">
            <span className="card-label">Needs Attention</span>
            <span className="card-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {projectCount} projects
            </span>
            <div className="card-value" style={{ color: '#ea580c', marginTop: '0.5rem' }}>
              {'<40%'} funded
            </div>
            <p className="card-subtitle">
              Projects below funding threshold
            </p>
          </div>
        </div>
      </div>
      
      {/* Always Visible Content - Projects Needing Attention */}
      <div className="card-expanded-content" style={{ paddingTop: 0 }}>
        <h4 className="section-title flex items-center">
          <ExclamationTriangleIcon className="warning-icon" />
          Projects Requiring Intervention
        </h4>
        
        <div className="project-list">
          {strugglingProjects.map((project) => (
            <div 
              key={project.id}
              className="project-item warning"
            >
              <div className="project-item-header">
                <div>
                  <h5 className="project-title">{project.title}</h5>
                  <p className="project-meta" style={{ marginBottom: 0, marginTop: '0.25rem' }}>
                    Ksh {project.raised.toLocaleString()} / Ksh {project.goal.toLocaleString()}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#ea580c' }}>
                    {project.daysLeft} days left
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-bar-container" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <div 
                  className={`progress-bar-fill ${getProgressColor(project.percentage)}`}
                  style={{ width: `${project.percentage}%` }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`progress-percentage ${getPercentageColor(project.percentage)}`} style={{ marginTop: 0 }}>
                  {project.percentage}% funded
                </span>
                
                <button className="boost-button">
                  Boost campaign →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NeedsAttentionCard;
