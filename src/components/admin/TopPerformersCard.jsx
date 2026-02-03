import './ExpandableCards.css';

/**
 * TrophyIcon - Trophy icon for top performers
 */
function TrophyIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.17V9.504c0-1.759-.956-3.366-2.438-4.251a6.472 6.472 0 00-2.077-.262m6.308 0A6.472 6.472 0 0015.75 9.504v3.375c0 1.759.956 3.366 2.438 4.251a6.472 6.472 0 002.077.262m-5.007 0H6.502m5.007 0a7.454 7.454 0 01.982 3.17V15.75c0 1.759-.956 3.366-2.438 4.251a6.472 6.472 0 01-2.077.262" />
    </svg>
  );
}

/**
 * TopPerformersCard Component
 * Displays the top performing campaigns with rankings
 * Compact always-visible design
 * 
 * @param {Object} props
 * @param {string} topProject - Name of the top performing project
 * @param {number} percentage - Funding percentage of the top project
 */
export function TopPerformersCard({ topProject, percentage }) {
  // Top performing projects
  const topProjects = [
    {
      id: 1,
      title: 'Neighborhood Food Pantry',
      category: 'Health',
      raised: 26150,
      goal: 18000,
      percentage: 145,
      donors: 89
    },
    {
      id: 2,
      title: 'Community Solar Garden',
      category: 'Environment',
      raised: 27267,
      goal: 30000,
      percentage: 91,
      donors: 76
    },
    {
      id: 3,
      title: 'Mobile Health Clinic',
      category: 'Health',
      raised: 26150,
      goal: 18000,
      percentage: 145,
      donors: 68
    },
    {
      id: 4,
      title: 'Neighborhood Learning Lab',
      category: 'Education',
      raised: 10307,
      goal: 12000,
      percentage: 86,
      donors: 54
    },
    {
      id: 5,
      title: 'Youth Soccer Equipment Drive',
      category: 'Community',
      raised: 6876,
      goal: 9500,
      percentage: 72,
      donors: 42
    }
  ];

  // Helper to get rank badge class
  const getRankBadgeClass = (index) => {
    switch (index) {
      case 0: return 'gold';
      case 1: return 'silver';
      case 2: return 'bronze';
      default: return 'default';
    }
  };

  return (
    <div className="expandable-card">
      {/* Card Header */}
      <div className="card-header" style={{ cursor: 'default' }}>
        <div className="card-header-content">
          <div className="header-left">
            <span className="card-label">Top Performers</span>
            <span className="card-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              {percentage}%
            </span>
            <div className="card-value" style={{ color: '#2563eb', marginTop: '0.5rem', fontSize: '1.25rem' }}>
              {topProject.length > 25 ? `${topProject.substring(0, 25)}...` : topProject}
            </div>
            <p className="card-subtitle">
              Highest funded campaign
            </p>
          </div>
        </div>
      </div>
      
      {/* Always Visible Content - Top 5 Campaigns */}
      <div className="card-expanded-content" style={{ paddingTop: 0 }}>
        <h4 className="section-title flex items-center">
          <TrophyIcon className="trophy-icon" />
          Top 5 Campaigns
        </h4>
        
        <div className="project-list">
          {topProjects.map((project, index) => (
            <div 
              key={project.id}
              className={`project-item ${index === 0 ? 'top-ranked' : ''}`}
            >
              <div className="project-item-header">
                <div className="project-rank">
                  <span className={`rank-badge ${getRankBadgeClass(index)}`}>
                    {index + 1}
                  </span>
                  <div>
                    <h5 className="project-title">{project.title}</h5>
                    <span className="project-category">{project.category}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <span>Ksh {project.raised.toLocaleString()} raised</span>
                <span>{project.donors} donors</span>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar-fill ${project.percentage >= 100 ? 'success' : 'success'}`}
                  style={{ width: `${Math.min(project.percentage, 100)}%` }}
                />
              </div>
              
              <p className={`progress-percentage success`} style={{ marginTop: '0.25rem' }}>
                {project.percentage}% of Ksh {project.goal.toLocaleString()} goal
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopPerformersCard;
