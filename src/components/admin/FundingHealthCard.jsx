
/**
 * FundingHealthCard Component
 * Displays overall funding health with progress bars by category
 * Compact always-visible design
 * 
 * @param {Object} props
 * @param {number} totalRaised - Total amount raised
 * @param {number} totalGoal - Total funding goal
 * @param {number} percentage - Overall funding percentage
 */
export function FundingHealthCard({ totalRaised, totalGoal, percentage }) {
  // Funding categories breakdown
  const fundingBreakdown = [
    { category: 'Education', raised: 1200000, goal: 3500000, percentage: 34 },
    { category: 'Health', raised: 950000, goal: 2800000, percentage: 34 },
    { category: 'Environment', raised: 720000, goal: 2500000, percentage: 29 },
    { category: 'Community', raised: 580000, goal: 2000000, percentage: 29 },
    { category: 'Arts', raised: 320000, goal: 1500000, percentage: 21 },
    { category: 'Technology', raised: 183589, goal: 878632, percentage: 21 }
  ];

  // Helper to get progress bar color based on percentage
  const getProgressColor = (percent) => {
    if (percent >= 50) return 'success';
    if (percent >= 30) return 'warning';
    return 'danger';
  };

  // Helper to get percentage text color
  const getPercentageColor = (percent) => {
    if (percent >= 50) return 'success';
    if (percent >= 30) return 'warning';
    return 'danger';
  };

  return (
    <div className="expandable-card">
      {/* Card Header */}
      <div className="card-header" style={{ cursor: 'default' }}>
        <div className="card-header-content">
          <div className="header-left">
            <span className="card-label">Funding Health</span>
            <span className="card-badge">{percentage}%</span>
            <div className="card-value" style={{ color: '#16a34a', marginTop: '0.5rem' }}>
              Ksh {totalRaised.toLocaleString()}
            </div>
            <p className="card-subtitle">
              of Ksh {totalGoal.toLocaleString()} goal
            </p>
          </div>
        </div>
      </div>
      
      {/* Always Visible Content - Funding Breakdown */}
      <div className="card-expanded-content" style={{ paddingTop: 0 }}>
        <h4 className="section-title">Funding by Category</h4>
        
        <div className="progress-list">
          {fundingBreakdown.map((item, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span className="progress-label">{item.category}</span>
                <div className="progress-amounts">
                  <span className="progress-raised">Ksh {(item.raised / 1000).toFixed(0)}K</span>
                  <span className="progress-goal">/ Ksh {(item.goal / 1000000).toFixed(1)}M</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar-fill ${getProgressColor(item.percentage)}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              
              <div className={`progress-percentage ${getPercentageColor(item.percentage)}`}>
                {item.percentage}% funded
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FundingHealthCard;
