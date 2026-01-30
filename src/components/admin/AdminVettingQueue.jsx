import {
  useVettingQueue,
  useVettingActions,
  useVettingFormatters,
} from "../../hooks/useVettingQueue";

export default function AdminVettingQueue({
  projects,
  updateProject,
  formatCurrency,
  showToast,
}) {
  const { queue, getProjectDraft, toggleCriteria, updateDraft } =
    useVettingQueue(projects);
  const { handleAction, handleSaveNotes } = useVettingActions(
    updateProject,
    showToast
  );
  const { formatDate, statusLabels, projectCriteria } = useVettingFormatters();

  return (
    <article className="admin-card admin-card-wide admin-vetting">
      <div className="admin-section-header">
        <div>
          <h3>Vetting queue</h3>
          <p className="admin-card-subtitle">
            Review identity checks, confirm criteria, and approve submissions.
          </p>
        </div>
      </div>

      {queue.length === 0 ? (
        <p className="admin-empty">No submissions awaiting verification.</p>
      ) : (
        <div className="vetting-grid">
          {queue.map((project) => {
            const draft = getProjectDraft(project);
            const criteriaMet = draft.criteriaMet || {};

            return (
              <div key={project.id} className="vetting-card">
                <div className="vetting-header">
                  <div>
                    <h4>{project.title}</h4>
                    <p className="admin-row-meta">
                      Submitted {formatDate(project.createdAt)} · Goal{" "}
                      {formatCurrency(project.goal)}
                    </p>
                  </div>
                  <span className={`status-pill status-${project.status || "review"}`}>
                    {statusLabels[project.verificationStatus] || "Review"}
                  </span>
                </div>

                <div className="vetting-meta">
                  <div>
                    <p className="admin-row-title">Owner</p>
                    <p className="admin-row-meta">
                      {project.ownerName || "Unknown"}
                    </p>
                    <p className="admin-row-meta">{project.ownerEmail}</p>
                    <p className="admin-row-meta">{project.ownerPhone}</p>
                  </div>
                  <div>
                    <p className="admin-row-title">Identity document</p>
                    {project.identityDocument ? (
                      <a
                        href={project.identityDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-link"
                      >
                        View document
                      </a>
                    ) : (
                      <p className="admin-row-meta">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="vetting-criteria">
                  <p className="admin-row-title">Criteria checklist</p>
                  <div className="criteria-grid">
                    {projectCriteria.map((criteria) => (
                      <label key={criteria.key} className="criteria-item">
                        <input
                          type="checkbox"
                          checked={Boolean(criteriaMet[criteria.key])}
                          onChange={() =>
                            toggleCriteria(project.id, criteria.key)
                          }
                        />
                        <span>{criteria.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="form-field">
                  <span className="form-label">Verification notes</span>
                  <textarea
                    rows="3"
                    value={draft.verificationNotes}
                    onChange={(event) =>
                      updateDraft(project.id, {
                        verificationNotes: event.target.value,
                      })
                    }
                    placeholder="Add review notes for the applicant"
                  />
                </label>

                <div className="vetting-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSaveNotes(project, draft)}
                  >
                    Save notes
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleAction(project, "rejected", draft)}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleAction(project, "under_review", draft)}
                  >
                    Mark under review
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleAction(project, "approved", draft)}
                  >
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
