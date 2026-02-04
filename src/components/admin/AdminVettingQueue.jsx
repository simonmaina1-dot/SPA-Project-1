import { useState, useMemo, useCallback } from "react";
import Modal from "../modals/Modal";
import {
  useVettingQueue,
  useVettingActions,
  useVettingFormatters,
} from "../../hooks/useVettingQueue";

// Utility function for Ksh currency formatting
const formatKsh = (amount) => {
  if (!amount) return "Ksh 0";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminVettingQueue({
  projects,
  updateProject,
  showToast,
  onAddProject,
}) {
  const { queue, getProjectDraft, toggleCriteria, updateDraft } =
    useVettingQueue(projects);
  const { handleAction, handleSaveNotes } = useVettingActions(
    updateProject,
    showToast
  );
  const { formatDate, statusLabels, projectCriteria } = useVettingFormatters();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter and sort queue
  const filteredQueue = useMemo(() => {
    let result = queue.filter((project) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.title?.toLowerCase().includes(searchLower) ||
        project.ownerName?.toLowerCase().includes(searchLower) ||
        project.ownerEmail?.toLowerCase().includes(searchLower)
      );
    });

    if (sortBy === "date") {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "goal") {
      result = [...result].sort((a, b) => (b.goal || 0) - (a.goal || 0));
    }

    return result;
  }, [queue, searchTerm, sortBy]);

  const handleCardClick = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleModalAction = useCallback(
    (action) => {
      if (!selectedProject) return;
      const draft = getProjectDraft(selectedProject);
      handleAction(selectedProject, action, draft);
      if (action === "approved" || action === "rejected") {
        handleCloseModal();
      }
    },
    [selectedProject, getProjectDraft, handleAction, handleCloseModal]
  );

  const handleSaveModalNotes = useCallback(() => {
    if (!selectedProject) return;
    const draft = getProjectDraft(selectedProject);
    handleSaveNotes(selectedProject, draft);
  }, [selectedProject, getProjectDraft, handleSaveNotes]);

  return (
    <article className="admin-card admin-card-wide vetting-queue-section">
      {/* Teal Navigation Header with Search and Controls */}
      <div className="vetting-header-bar">
        <div className="vetting-header-left">
          <h3 className="vetting-title">Vetting Queue</h3>
          <span className="vetting-count">{filteredQueue.length} pending</span>
        </div>

        <div className="vetting-header-controls">
          <div className="vetting-search">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search projects, owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vetting-search-input"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="vetting-sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="goal">Sort by Goal</option>
          </select>
        </div>
      </div>

      {/* Grid of Submission Cards */}
      {filteredQueue.length === 0 ? (
        <div className="vetting-empty">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p>No submissions awaiting verification.</p>
        </div>
      ) : (
        <div className="vetting-grid">
          {filteredQueue.map((project, index) => {
            const draft = getProjectDraft(project);
            const criteriaMet = draft.criteriaMet || {};
            const criteriaKeys = projectCriteria.map((c) => c.key);
            const completedCriteria = criteriaKeys.filter(
              (key) => criteriaMet[key]
            ).length;

            return (
              <div
                key={project.id}
                className="vetting-card"
                onClick={() => handleCardClick(project)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Header: Project Name + Status Badge */}
                <div className="vetting-card-header">
                  <h4 className="vetting-card-title">{project.title}</h4>
                  <span className="status-badge status-submitted">Submitted</span>
                </div>

                {/* Meta: Submission Date + Goal Amount */}
                <div className="vetting-card-meta">
                  <span className="meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(project.createdAt)}
                  </span>
                  <span className="meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    {formatKsh(project.goal)}
                  </span>
                </div>

                {/* Owner: Name and Email */}
                <div className="vetting-card-owner">
                  <div className="owner-avatar">
                    {project.ownerName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="owner-info">
                    <span className="owner-name">{project.ownerName || "Unknown"}</span>
                    <span className="owner-email">{project.ownerEmail}</span>
                  </div>
                </div>

                {/* Quick Indicators: 4 Checkmark Icons */}
                <div className="vetting-card-indicators">
                  {projectCriteria.map((criteria) => (
                    <div
                      key={criteria.key}
                      className={`indicator ${
                        criteriaMet[criteria.key] ? "completed" : ""
                      }`}
                      title={criteria.label}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={criteriaMet[criteria.key] ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline
                          points={criteriaMet[criteria.key]
                            ? "20 6 9 17 4 12"
                            : ""}
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill={criteriaMet[criteria.key] ? "#10B981" : "none"}
                        />
                        {criteriaMet[criteria.key] && (
                          <polyline
                            points="20 6 9 17 4 12"
                            stroke="#fff"
                            strokeWidth="2.5"
                          />
                        )}
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal / Expanded View */}
      <Modal
        isOpen={!!selectedProject}
        onClose={handleCloseModal}
        title={selectedProject?.title || "Project Details"}
        hideHeader={true}
        onAddProject={onAddProject}
      >
        {selectedProject && (
          <div className="vetting-modal-content">
            {/* Full Owner Details */}
            <div className="modal-section">
              <h4 className="modal-section-title">Owner Details</h4>
              <div className="owner-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedProject.ownerName || "Unknown"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedProject.ownerEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedProject.ownerPhone || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Identity Document */}
            <div className="modal-section">
              <h4 className="modal-section-title">Identity Document</h4>
              {selectedProject.identityDocument ? (
                <div className="document-row">
                  <a
                    href={selectedProject.identityDocument}
                    target="_blank"
                    rel="noreferrer"
                    className="document-link"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    View Document
                  </a>
                </div>
              ) : (
                <p className="no-document">No identity document provided</p>
              )}
            </div>

            {/* Criteria Checklist with Blue Checkboxes */}
            <div className="modal-section">
              <h4 className="modal-section-title">Criteria Checklist</h4>
              <div className="criteria-checklist">
                {projectCriteria.map((criteria) => {
                  const draft = getProjectDraft(selectedProject);
                  const isChecked = Boolean(draft.criteriaMet?.[criteria.key]);

                  return (
                    <label key={criteria.key} className="criteria-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          toggleCriteria(selectedProject.id, criteria.key)
                        }
                        className="criteria-checkbox"
                      />
                      <span className="criteria-text">{criteria.label}</span>
                      <span className="criteria-checkmark"></span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Verification Notes */}
            <div className="modal-section">
              <h4 className="modal-section-title">Verification Notes</h4>
              <textarea
                className="notes-textarea"
                rows="5"
                placeholder="Add review notes for the applicant..."
                value={
                  getProjectDraft(selectedProject).verificationNotes || ""
                }
                onChange={(event) =>
                  updateDraft(selectedProject.id, {
                    verificationNotes: event.target.value,
                  })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveModalNotes}
              >
                Save Notes
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleModalAction("rejected")}
              >
                Reject
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleModalAction("under_review")}
              >
                Mark Under Review
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleModalAction("approved")}
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </article>
  );
}
