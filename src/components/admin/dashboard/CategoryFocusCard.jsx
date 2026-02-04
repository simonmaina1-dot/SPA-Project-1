
/**
 * CategoryFocusCard Component
 * Displays the top category with project count and top projects
 * Compact always-visible design
 * 
 * @param {Object} props
 * @param {string} topCategory - The top performing category name
 * @param {number} projectCount - Number of projects in the top category
 * @param {number} categories - Total number of categories
 */
export function CategoryFocusCard({ topCategory, projectCount, categories }) {
  // Top category projects
  const categoryProjects = [
    {
      id: 1,
      title: 'Neighborhood Food Pantry',
      raised: 26150,
      goal: 18000,
      percentage: 145,
      status: 'Funded'
    },
    {
      id: 2,
      title: 'Community Solar Garden',
      raised: 27267,
      goal: 30000,
      percentage: 91,
      status: 'Active'
    },
    {
      id: 3,
      title: 'Youth Soccer Equipment Drive',
      raised: 8876,
      goal: 9500,
      percentage: 93,
      status: 'Active'
    }
  ];

  // Helper to get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Funded': return 'funded';
      case 'Active': return 'active';
      default: return 'active';
    }
  };

  return (
    <div className="expandable-card">
      {/* Card Header */}
      <div className="card-header" style={{ cursor: 'default' }}>
        <div className="card-header-content">
          <div className="header-left">
            <span className="card-label">Category Focus</span>
            <span className="card-badge">{categories} categories</span>
            <div className="card-value" style={{ color: '#16a34a', marginTop: '0.5rem' }}>
              {topCategory}
            </div>
            <p className="card-subtitle">
              Top category with {projectCount} projects
            </p>
          </div>
        </div>
      </div>
      
      {/* Always Visible Content - Top Projects in Category */}
      <div className="card-expanded-content" style={{ paddingTop: 0 }}>
        <h4 className="section-title">Top {topCategory} Projects</h4>
        
        <div className="project-list">
          {categoryProjects.map((project, index) => (
            <div 
              key={project.id}
              className="project-item"
            >
              <div className="project-item-header">
                <div className="project-rank">
                  <span className="rank-badge default">#{index + 1}</span>
                  <div>
                    <h5 className="project-title">{project.title}</h5>
                    <p className="project-meta" style={{ marginBottom: 0, marginTop: '0.25rem' }}>
                      Ksh {project.raised.toLocaleString()} / Ksh {project.goal.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <span className={`project-status ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-bar-container" style={{ marginTop: '0.5rem' }}>
                <div 
                  className={`progress-bar-fill ${project.percentage >= 100 ? 'success' : 'success'}`}
                  style={{ width: `${Math.min(project.percentage, 100)}%` }}
                />
              </div>
              
              <p className={`progress-percentage success`} style={{ marginTop: '0.25rem' }}>
                {project.percentage}% funded
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryFocusCard;
