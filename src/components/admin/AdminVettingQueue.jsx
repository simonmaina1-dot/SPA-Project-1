import { useEffect, useMemo, useState } from "react";
import { projectCriteria } from "../../data/projectCriteria";

const statusLabels = {
  pending: "Pending",
  submitted: "Submitted",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
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

export default function AdminVettingQueue({
  projects,
  updateProject,
  formatCurrency,
  showToast,
}) {
  const queue = useMemo(
    () =>
      projects.filter(
        (project) => project.verificationStatus !== "verified"
      ),
    [projects]
  );

  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    const nextDrafts = {};
    queue.forEach((project) => {
      nextDrafts[project.id] = {
        criteriaMet: { ...project.criteriaMet },
        verificationNotes: project.verificationNotes || "",
      };
    });
    setDrafts(nextDrafts);
  }, [queue]);

  const updateDraft = (projectId, updates) => {
    setDrafts((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        ...updates,
      },
    }));
  };

  const handleCriteriaToggle = (projectId, key) => {
    const current = drafts[projectId]?.criteriaMet || {};
    updateDraft(projectId, {
      criteriaMet: {
        ...current,
        [key]: !current[key],
      },
    });
  };

  const handleAction = (project, nextStatus) => {
    const draft = drafts[project.id] || {
      criteriaMet: project.criteriaMet,
      verificationNotes: project.verificationNotes || "",
    };
    const criteriaMet = draft.criteriaMet || project.criteriaMet;

    if (nextStatus === "verified") {
      const allCriteriaMet = Object.values(criteriaMet || {}).every(Boolean);
      if (!allCriteriaMet) {
        showToast("Confirm each criteria item before verifying.", "warning");
        return;
      }
    }

    if (nextStatus === "rejected" && !draft.verificationNotes.trim()) {
      showToast("Add a rejection note for the applicant.", "warning");
      return;
    }

    const status = nextStatus === "verified" ? "active" : "review";

    updateProject(project.id, {
      verificationStatus: nextStatus,
      verificationNotes: draft.verificationNotes.trim(),
      criteriaMet,
      status,
    });

    const message =
      nextStatus === "verified"
        ? "Project verified and published."
        : nextStatus === "rejected"
          ? "Submission rejected with notes sent."
          : "Vetting status updated.";

    showToast(message, "success");
  };

  const handleSaveNotes = (project) => {
    const draft = drafts[project.id];
    if (!draft) return;

    updateProject(project.id, {
      verificationNotes: draft.verificationNotes.trim(),
      criteriaMet: draft.criteriaMet,
    });
    showToast("Vetting notes updated.", "success");
  };

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
            const draft = drafts[project.id] || {
              criteriaMet: project.criteriaMet,
              verificationNotes: project.verificationNotes || "",
            };
            const criteriaMet = draft.criteriaMet || project.criteriaMet || {};

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
                            handleCriteriaToggle(project.id, criteria.key)
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
                    onClick={() => handleSaveNotes(project)}
                  >
                    Save notes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleAction(project, "under_review")}
                  >
                    Mark under review
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAction(project, "verified")}
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleAction(project, "rejected")}
                  >
                    Reject
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
