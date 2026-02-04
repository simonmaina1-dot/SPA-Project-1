import { useState, useMemo, useEffect } from "react";
import Modal from "../modals/Modal";

const sourceLabels = {
  card: "Card",
  mpesa: "M-Pesa",
  bank: "Bank Transfer",
  cash: "Cash",
};

const sourceIcons = {
  card: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
    </svg>
  ),
  mpesa: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
      <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" />
      <line x1="10" y1="18" x2="14" y2="18" strokeWidth="3" />
    </svg>
  ),
  bank: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M3 21h18M5 21V7l8-4v4M13 21V7l8-4v4M8 12h8M8 9h.01M16 9h.01" strokeWidth="2" />
    </svg>
  ),
  cash: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2" />
    </svg>
  ),
};

const hoverColors = {
  card: "yellow",
  mpesa: "green",
  bank: "purple",
  cash: "amber",
};

const headerColors = {
  card: "yellow",
  mpesa: "green",
  bank: "purple",
  cash: "amber",
};

const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });
};

// XMark icon component
const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// CreditCard icon component
const CreditCardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
    <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
  </svg>
);

// Users icon component
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function FundUtilizationSection({
  projects,
  donations,
  formatCurrency,
}) {
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedSource, setSelectedSource] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDonorsModalOpen, setIsDonorsModalOpen] = useState(false);
  const [donorFilter, setDonorFilter] = useState("all");

  // Get selected project data (or null for ALL)
  const selectedProjectData = useMemo(
    () => (selectedProject === "all" ? null : projects.find((p) => p.id === selectedProject)),
    [projects, selectedProject]
  );

  // Calculate project-specific metrics (or ALL projects)
  const projectMetrics = useMemo(() => {
    if (selectedProject === "all") {
      // Aggregate data from ALL projects
      const allRaised = projects.reduce((sum, p) => sum + (p.currentAmount || 0), 0);
      const allUsed = projects.reduce(
        (sum, p) => sum + (p.fundUsage || []).reduce((s, e) => s + (e.amount || 0), 0),
        0
      );
      const allDonors = projects.reduce((sum, p) => sum + (p.donorCount || 0), 0);
      return {
        raised: allRaised,
        used: allUsed,
        remaining: Math.max(0, allRaised - allUsed),
        donorCount: allDonors,
      };
    }

    const raised = selectedProjectData?.currentAmount || 0;
    const used = (selectedProjectData?.fundUsage || []).reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0
    );
    const remaining = Math.max(0, raised - used);
    const donorCount = selectedProjectData?.donorCount || 0;

    return { raised, used, remaining, donorCount };
  }, [projects, selectedProject, selectedProjectData]);

  // Calculate donation sources for selected project or ALL
  const projectDonations = useMemo(() => {
    if (selectedProject === "all") return donations;
    return donations.filter((d) => d.projectId === selectedProjectData?.id);
  }, [donations, selectedProject, selectedProjectData]);

  const sourceSummary = useMemo(() => {
    const sourceMap = projectDonations.reduce((acc, donation) => {
      const key = donation.source || "other";
      if (!acc[key]) {
        acc[key] = { source: key, count: 0, total: 0, transactions: [] };
      }
      acc[key].count += 1;
      acc[key].total += donation.amount || 0;
      acc[key].transactions.push(donation);
      return acc;
    }, {});

    return Object.values(sourceMap).sort((a, b) => b.total - a.total);
  }, [projectDonations]);

  // Calculate usage entries for selected project or ALL
  const usageEntries = useMemo(() => {
    if (selectedProject === "all") {
      // Aggregate all usage entries from all projects
      const allEntries = [];
      projects.forEach((project) => {
        (project.fundUsage || []).forEach((entry) => {
          allEntries.push({
            ...entry,
            projectTitle: project.title,
          });
        });
      });
      return allEntries
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 8);
    }

    return (selectedProjectData?.fundUsage || [])
      .map((entry) => ({
        ...entry,
        projectTitle: selectedProjectData.title,
      }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 8);
  }, [projects, selectedProject, selectedProjectData]);

  // Current timestamp for donor analytics (fixed during render)
  const now = Date.now();

  // Calculate donor analytics
  const donorAnalytics = useMemo(() => {
    const projectDonorEmails = new Set(
      projectDonations
        .filter((d) => d.donorEmail)
        .map((d) => d.donorEmail.toLowerCase())
    );

    const firstDonationDates = {};
    const donationCounts = {};
    const donorDetails = {};

    projectDonations.forEach((d) => {
      if (d.donorEmail && d.createdAt) {
        const email = d.donorEmail.toLowerCase();
        
        // Track first donation date
        if (!firstDonationDates[email] || d.createdAt < firstDonationDates[email]) {
          firstDonationDates[email] = d.createdAt;
        }
        
        // Track donation count
        donationCounts[email] = (donationCounts[email] || 0) + 1;
        
        // Track donor details
        if (!donorDetails[email]) {
          donorDetails[email] = {
            name: d.donorName || "Anonymous",
            email: d.donorEmail,
            totalAmount: 0,
            transactions: [],
            firstDonation: d.createdAt,
            lastDonation: d.createdAt,
          };
        }
        donorDetails[email].totalAmount += d.amount || 0;
        donorDetails[email].transactions.push(d);
        if (d.createdAt > donorDetails[email].lastDonation) {
          donorDetails[email].lastDonation = d.createdAt;
        }
      }
    });

    // Count new donors (first donation within last 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const newDonors = Object.entries(firstDonationDates).filter(
      ([, date]) => new Date(date).getTime() > thirtyDaysAgo
    ).length;

    // Count recurring donors (more than 1 donation)
    const recurringDonors = Object.values(donationCounts).filter(
      (count) => count > 1
    ).length;

    // Build all donors list with details
    const allDonorsList = Object.entries(donorDetails).map(([email, details]) => {
      const firstDate = firstDonationDates[email];
      const isNew = new Date(firstDate).getTime() > thirtyDaysAgo;
      const isRecurring = donationCounts[email] > 1;
      
      return {
        id: email,
        name: details.name,
        email: details.email,
        totalAmount: details.totalAmount,
        donationCount: donationCounts[email] || 1,
        isRecurring,
        isNew,
        firstDonation: formatShortDate(firstDate),
        lastDonation: formatShortDate(details.lastDonation),
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    return { 
      newDonors, 
      recurringDonors, 
      totalDonors: projectDonorEmails.size,
      allDonorsList,
    };
  }, [projectDonations]);

  // Filtered donors based on current filter
  const filteredDonors = useMemo(() => {
    if (donorFilter === "all") {
      return donorAnalytics.allDonorsList;
    } else if (donorFilter === "recurring") {
      return donorAnalytics.allDonorsList.filter(d => d.isRecurring);
    } else if (donorFilter === "new") {
      return donorAnalytics.allDonorsList.filter(d => d.isNew);
    }
    return donorAnalytics.allDonorsList;
  }, [donorAnalytics, donorFilter]);

  // Top donors for selected project or ALL
  const topProjectDonors = useMemo(() => {
    const donorMap = {};

    projectDonations.forEach((donation) => {
      const email = donation.donorEmail?.toLowerCase() || "";
      const name = donation.donorName || "Anonymous";

      if (!email || name === "Anonymous") return;

      if (!donorMap[email]) {
        donorMap[email] = {
          name,
          email,
          totalAmount: 0,
        };
      }

      donorMap[email].totalAmount += donation.amount || 0;
    });

    return Object.values(donorMap)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [projectDonations]);

  const handleSourceClick = (source) => {
    const sourceData = sourceSummary.find((s) => s.source === source);
    if (sourceData && sourceData.count > 0) {
      setSelectedSource(sourceData);
      setIsPaymentModalOpen(true);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSource(null);
  };

  const handleDonorsClick = () => {
    setDonorFilter("all");
    setIsDonorsModalOpen(true);
  };

  const handleCloseDonorsModal = () => {
    setIsDonorsModalOpen(false);
    setDonorFilter("all");
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  // Keyboard support for closing modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (isPaymentModalOpen) handleClosePaymentModal();
        if (isDonorsModalOpen) handleCloseDonorsModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPaymentModalOpen, isDonorsModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isPaymentModalOpen || isDonorsModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPaymentModalOpen, isDonorsModalOpen]);

  return (
    <article className="fund-utilization-section">
      <div className="fund-utilization-header">
        <h3>Fund Utilisation</h3>
        <p className="fund-utilization-subtitle">
          Track donation sources and project spending updates from owners
        </p>
      </div>

      <div className="fund-utilization-grid">
        {/* Column 1: Project Section */}
        <div className="fund-column project-section">
          <div className="section-title">
            <h4>project</h4>
          </div>

          {/* Project Dropdown */}
          <div className="project-selector">
            <select
              value={selectedProject}
              onChange={handleProjectChange}
              className="project-dropdown"
            >
              <option value="all">ALL</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Summary Cards */}
          <div className="financial-summary">
            <div className="summary-card raised">
              <div className="summary-label">raised amount</div>
              <div className="summary-value">
                {formatCurrency(projectMetrics.raised)}
              </div>
            </div>
            <div className="summary-card used">
              <div className="summary-label">used amount</div>
              <div className="summary-value">
                {formatCurrency(projectMetrics.used)}
              </div>
            </div>
            <div className="summary-card remaining">
              <div className="summary-label">remaining balances</div>
              <div className="summary-value">
                {formatCurrency(projectMetrics.remaining)}
              </div>
            </div>
          </div>

          {/* Donor Count - Clickable */}
          <div className="donor-count donor-count-clickable" onClick={handleDonorsClick}>
            <div>
              <span className="donor-count-value">{projectMetrics.donorCount}</span>
              <span className="donor-count-label">Donors</span>
            </div>
            <div className="donor-count-hint">Click to view all</div>
          </div>

          {/* Donor Analytics */}
          <div className="donor-analytics">
            <div 
              className="analytics-item analytics-item-clickable"
              onClick={() => {
                setDonorFilter("recurring");
                setIsDonorsModalOpen(true);
              }}
            >
              <div className="analytics-value">{donorAnalytics.recurringDonors}</div>
              <div className="analytics-label">Recurring donors</div>
            </div>
            <div 
              className="analytics-item analytics-item-clickable"
              onClick={() => {
                setDonorFilter("new");
                setIsDonorsModalOpen(true);
              }}
            >
              <div className="analytics-value">{donorAnalytics.newDonors}</div>
              <div className="analytics-label">New donors</div>
            </div>
          </div>

          {/* Top Donors List */}
          <div className="top-donors">
            <h5>top donors</h5>
            <div className="top-donors-list">
              {topProjectDonors.length > 0 ? (
                topProjectDonors.map((donor, index) => (
                  <div key={donor.email || index} className="top-donor-item">
                    <div className="donor-rank">{index + 1}</div>
                    <div className="donor-info">
                      <div className="donor-name">{donor.name}</div>
                      <div className="donor-amount">
                        {formatCurrency(donor.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No donors yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Donation Sources */}
        <div className="fund-column donation-sources">
          <div className="section-title">
            <h4>Donation Sources</h4>
          </div>

          <div className="payment-methods-grid">
            {["card", "mpesa", "bank", "cash"].map((source) => {
              const sourceData = sourceSummary.find((s) => s.source === source);
              const count = sourceData?.count || 0;
              const total = sourceData?.total || 0;
              const color = hoverColors[source];

              return (
                <div
                  key={source}
                  className={`payment-card payment-card-${color} ${count === 0 ? "empty" : ""}`}
                  onClick={() => count > 0 && handleSourceClick(source)}
                >
                  {/* Spotlight gradient overlay */}
                  <div className={`spotlight-overlay spotlight-${color}`}></div>
                  
                  <div className="payment-card-content">
                    <div className={`payment-icon payment-icon-${color}`}>
                      {sourceIcons[source]}
                    </div>
                    <div className="payment-method-name">
                      {sourceLabels[source]}
                    </div>
                    <div className="payment-count">{count} transactions</div>
                    <div className={`payment-total payment-total-${color}`}>
                      {formatCurrency(total)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Recent Usage Report */}
        <div className="fund-column usage-report">
          <div className="section-title">
            <h4>recent usage report</h4>
          </div>

          <div className="usage-list">
            {usageEntries.length > 0 ? (
              usageEntries.map((entry) => (
                <div key={entry.id} className="usage-item">
                  <div className="usage-header">
                    <span className="usage-project">{entry.projectTitle}</span>
                    <span className="usage-date">{formatDate(entry.date)}</span>
                  </div>
                  <div className="usage-description">
                    {entry.description || entry.category || "General expense"}
                  </div>
                  <div className="usage-amount">
                    -{formatCurrency(entry.amount || 0)}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No usage records yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {selectedSource && (
        <div className="modal-overlay" onClick={handleClosePaymentModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`modal-header modal-header-${headerColors[selectedSource.source]}`}>
              <div className="modal-header-content">
                <CreditCardIcon className="modal-header-icon" />
                <h2 className="modal-header-title">{sourceLabels[selectedSource.source]} Donations</h2>
              </div>
              <button className="modal-close-button" onClick={handleClosePaymentModal}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content - Donor List Table */}
            <div className="modal-content">
              <div className="donor-table-container">
                {/* Table Header */}
                <div className="donor-table-header">
                  <div className="donor-table-col donor-col-number">#</div>
                  <div className="donor-table-col donor-col-name">Donor Name</div>
                  <div className="donor-table-col donor-col-email">Email</div>
                  <div className="donor-table-col donor-col-date">Date</div>
                  <div className="donor-table-col donor-col-amount">Amount</div>
                </div>
                
                {/* Table Body */}
                <div className="donor-table-body">
                  {selectedSource.transactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="donor-table-row"
                    >
                      <div className="donor-table-col donor-col-number">{index + 1}</div>
                      <div className="donor-table-col donor-col-name">{transaction.donorName || "Anonymous"}</div>
                      <div className="donor-table-col donor-col-email">{transaction.donorEmail || "No email"}</div>
                      <div className="donor-table-col donor-col-date">{formatDate(transaction.createdAt)}</div>
                      <div className="donor-table-col donor-col-amount">{formatCurrency(transaction.amount || 0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer - Summary */}
            <div className="modal-footer">
              <div className="modal-footer-content">
                <div className="modal-footer-item">
                  <p className="modal-footer-label">Total Transactions</p>
                  <p className="modal-footer-value">{selectedSource.count} donations</p>
                </div>
                <div className="modal-footer-item modal-footer-item-right">
                  <p className="modal-footer-label">Total Amount</p>
                  <p className="modal-footer-value modal-footer-amount">{formatCurrency(selectedSource.total)}</p>
                </div>
              </div>
              <button 
                className="modal-close-button-large"
                onClick={handleClosePaymentModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Donors Modal */}
      {isDonorsModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDonorsModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header modal-header-green">
              <div className="modal-header-content">
                <UsersIcon className="modal-header-icon" />
                <div>
                  <h2 className="modal-header-title">All Donors</h2>
                  <p className="modal-header-subtitle">
                    {donorAnalytics.totalDonors} unique donors • {donorAnalytics.recurringDonors} recurring • {donorAnalytics.newDonors} new
                  </p>
                </div>
              </div>
              <button className="modal-close-button" onClick={handleCloseDonorsModal}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="modal-filter-tabs">
              <button 
                className={`modal-filter-tab ${donorFilter === "all" ? "active" : ""}`}
                onClick={() => setDonorFilter("all")}
              >
                All Donors ({donorAnalytics.totalDonors})
              </button>
              <button 
                className={`modal-filter-tab modal-filter-tab-blue ${donorFilter === "recurring" ? "active" : ""}`}
                onClick={() => setDonorFilter("recurring")}
              >
                Recurring ({donorAnalytics.recurringDonors})
              </button>
              <button 
                className={`modal-filter-tab modal-filter-tab-purple ${donorFilter === "new" ? "active" : ""}`}
                onClick={() => setDonorFilter("new")}
              >
                New Donors ({donorAnalytics.newDonors})
              </button>
            </div>
            
            {/* Content - Donor Cards */}
            <div className="modal-content modal-content-scrollable">
              <div className="donor-cards-list">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map((donor, index) => (
                    <div 
                      key={donor.id} 
                      className="donor-card"
                    >
                      <div className="donor-card-content">
                        {/* Left: Donor Info */}
                        <div className="donor-card-left">
                          <div className="donor-rank donor-rank-large">#{index + 1}</div>
                          <div className="donor-card-info">
                            <div className="donor-card-name-row">
                              <h4 className="donor-card-name">{donor.name}</h4>
                              {donor.isRecurring && (
                                <span className="donor-badge donor-badge-blue">Recurring</span>
                              )}
                              {donor.isNew && (
                                <span className="donor-badge donor-badge-purple">New</span>
                              )}
                            </div>
                            <p className="donor-card-email">{donor.email}</p>
                            <div className="donor-card-meta">
                              <span>{donor.donationCount} donations</span>
                              <span>•</span>
                              <span>First: {donor.firstDonation}</span>
                              <span>•</span>
                              <span>Latest: {donor.lastDonation}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right: Total Amount */}
                        <div className="donor-card-right">
                          <p className="donor-card-total-label">Total Donated</p>
                          <p className="donor-card-total-amount">{formatCurrency(donor.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No donors found</p>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="modal-footer">
              <button 
                className="modal-close-button-large"
                onClick={handleCloseDonorsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
