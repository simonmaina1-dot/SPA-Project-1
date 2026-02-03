import { useContext, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import useAuth from "../../hooks/useAuth";
import useDonations from "../../hooks/useDonations";
import useProjects from "../../hooks/useProjects";
import { ToastContext } from "../../context/ToastContext";
import "./UserDashboard.css";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function UserDashboard() {
  const { currentUser, signOut } = useAuth();
  const { donations } = useDonations();
  const { projects, formatCurrency, updateProject } = useProjects();
  const { showToast } = useContext(ToastContext);
  const [dashboardView, setDashboardView] = useState("user");
  const [usageDrafts, setUsageDrafts] = useState({});
  const buildUsageDraft = useMemo(
    () => () => ({
      amount: "",
      category: "operations",
      note: "",
      date: new Date().toISOString().slice(0, 10),
    }),
    []
  );

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (currentUser.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const normalizedEmail = currentUser.email.toLowerCase();

  const myDonations = useMemo(
    () =>
      donations.filter(
        (donation) =>
          donation.donorEmail?.toLowerCase() === normalizedEmail
      ),
    [donations, normalizedEmail]
  );

  const myProjects = useMemo(
    () =>
      projects.filter((project) => {
        const ownerEmail = project.ownerEmail || project.createdBy?.email || "";
        return ownerEmail.toLowerCase() === normalizedEmail;
      }),
    [projects, normalizedEmail]
  );

  const totalDonated = useMemo(
    () => myDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0),
    [myDonations]
  );

  const recentActivity = useMemo(() => {
    const donationItems = myDonations.map((donation) => ({
      id: donation.id,
      type: "donation",
      title: donation.projectTitle || "Project donation",
      amount: donation.amount || 0,
      createdAt: donation.createdAt,
    }));

    const projectItems = myProjects
      .filter((project) => project.createdAt)
      .map((project) => ({
        id: project.id,
        type: "project",
        title: project.title,
        createdAt: project.createdAt,
      }));

    const usageItems = myProjects.flatMap((project) =>
      (project.fundUsage || []).map((entry) => ({
        id: entry.id,
        type: "usage",
        title: project.title,
        amount: entry.amount || 0,
        createdAt: entry.date || entry.createdAt,
      }))
    );

    return [...donationItems, ...projectItems, ...usageItems]
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 6);
  }, [myDonations, myProjects]);

  const approvedProjects = useMemo(
    () => projects.filter((project) => project.verificationStatus === "approved"),
    [projects]
  );

  const approvedStats = useMemo(() => {
    const totalRaised = approvedProjects.reduce(
      (sum, project) => sum + (project.currentAmount || 0),
      0
    );
    const donorCount = approvedProjects.reduce(
      (sum, project) => sum + (project.donorCount || 0),
      0
    );

    return { totalRaised, donorCount };
  }, [approvedProjects]);

  const updateUsageDraft = (projectId, field, value) => {
    setUsageDrafts((prev) => ({
      ...prev,
      [projectId]: {
        ...buildUsageDraft(),
        ...(prev[projectId] || {}),
        [field]: value,
      },
    }));
  };

  const handleUsageSubmit = (project) => {
    const draft = usageDrafts[project.id] || buildUsageDraft();
    const amountValue = Number(draft.amount);
    if (!amountValue || amountValue <= 0) {
      showToast("Enter a valid usage amount.", "warning");
      return;
    }

    const entry = {
      id: `fu-${Date.now()}`,
      amount: amountValue,
      category: draft.category || "operations",
      note: draft.note?.trim() || "",
      date: draft.date || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    const updatedUsage = [entry, ...(project.fundUsage || [])];
    updateProject(project.id, { fundUsage: updatedUsage });
    showToast("Fund usage entry added.", "success");
    setUsageDrafts((prev) => ({ ...prev, [project.id]: buildUsageDraft() }));
  };

  return (
    <div className="page user-dashboard-page">
      <section className="page-header">
        <h1>{dashboardView === "donor" ? "Donor dashboard" : "Your dashboard"}</h1>
        <p>Welcome back, {currentUser.name}.</p>
        <div className="dashboard-toggle">
          <button
            type="button"
            className={`btn btn-secondary btn-small${dashboardView === "user" ? " active" : ""}`}
            onClick={() => setDashboardView("user")}
          >
            My account
          </button>
          <button
            type="button"
            className={`btn btn-secondary btn-small${dashboardView === "donor" ? " active" : ""}`}
            onClick={() => setDashboardView("donor")}
          >
            Donor dashboard
          </button>
        </div>
      </section>

      {dashboardView === "donor" ? (
        <div className="user-dashboard-grid">
      <section className="user-card user-card-wide">
        <div className="user-card-header">
          <div>
            <h2>Approved projects</h2>
            <p className="user-card-subtitle">
              {approvedProjects.length} reviewed projects ·{" "}
              {formatCurrency(approvedStats.totalRaised)} raised
            </p>
          </div>
        </div>

        {approvedProjects.length ? (
          <div className="donor-projects-grid">
            {approvedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="user-empty">
            No reviewed projects yet. Check back soon.
          </p>
        )}
      </section>
        </div>
      ) : (
      <div className="user-dashboard-grid">
        <section className="user-card user-card-wide">
          <div className="user-card-header">
            <div>
              <h2>My donations</h2>
              <p className="user-card-subtitle">
                {myDonations.length} donations · {formatCurrency(totalDonated)}
              </p>
            </div>
          </div>

          {myDonations.length ? (
            <div className="user-list">
              {myDonations.map((donation) => (
                <div className="user-list-row" key={donation.id}>
                  <div>
                    <p className="user-row-title">{donation.projectTitle}</p>
                    <p className="user-row-meta">{formatDate(donation.createdAt)}</p>
                  </div>
                  <span className="user-row-amount">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="user-empty">
              No donations yet. <Link to="/#all-projects">Explore projects</Link>.
            </p>
          )}
        </section>

        <section className="user-card projects-created-card">
          <div className="projects-created-header">
            <div>
              <h2>Projects created</h2>
              <p className="projects-created-subtitle">
                {myProjects.length} active projects
              </p>
            </div>
            <Link to="/submit-project" className="submit-project-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Submit a project
            </Link>
          </div>

          {myProjects.length ? (
            <div className="projects-created-content">
              <div className="user-list">
                {myProjects.map((project) => (
                  <div className="user-list-row" key={project.id}>
                    <div>
                      <p className="user-row-title">{project.title}</p>
                      <p className="user-row-meta">
                        {formatCurrency(project.currentAmount)} raised ·{" "}
                        {formatCurrency(project.goal)}
                      </p>
                    </div>
                    <span
                      className={`status-pill status-${project.status || "active"}`}
                    >
                      {project.status || "active"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="projects-created-content">
              <p className="user-empty">No projects created yet.</p>
            </div>
          )}
        </section>

        <section className="user-card">
          <div className="user-card-header">
            <div>
              <h2>Recent activity</h2>
              <p className="user-card-subtitle">Your latest updates</p>
            </div>
          </div>

          {recentActivity.length ? (
            <div className="user-list">
              {recentActivity.map((item) => (
                <div className="user-list-row" key={item.id}>
                  <div>
                    <p className="user-row-title">
                      {item.type === "donation"
                        ? `Donated to ${item.title}`
                        : `Created ${item.title}`}
                    </p>
                    <p className="user-row-meta">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.type === "donation" ? (
                    <span className="user-row-amount">
                      {formatCurrency(item.amount)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="user-empty">No recent activity yet.</p>
          )}

        </section>

        <section className="user-card user-card-wide">
          <div className="user-card-header">
            <div>
              <h2>Fund usage reports</h2>
              <p className="user-card-subtitle">
                Track how project funds are being used.
              </p>
            </div>
          </div>

          {myProjects.length ? (
            <div className="user-fund-grid">
              {myProjects.map((project) => {
                const usedTotal = (project.fundUsage || []).reduce(
                  (sum, entry) => sum + (entry.amount || 0),
                  0
                );
                const draft = usageDrafts[project.id] || buildUsageDraft();

                return (
                  <div key={project.id} className="user-project-card">
                    <div className="user-project-header">
                      <div>
                        <h3>{project.title}</h3>
                        <p className="user-row-meta">
                          {formatCurrency(project.currentAmount)} raised ·{" "}
                          {formatCurrency(usedTotal)} reported
                        </p>
                      </div>
                      <span
                        className={`status-pill status-${project.status || "review"}`}
                      >
                        {project.verificationStatus || project.status}
                      </span>
                    </div>

                    <div className="user-usage-list">
                      {(project.fundUsage || []).length ? (
                        project.fundUsage.map((entry) => (
                          <div className="user-usage-row" key={entry.id}>
                            <div>
                              <p className="user-row-title">
                                {entry.category || "Usage update"}
                              </p>
                              <p className="user-row-meta">
                                {formatDate(entry.date || entry.createdAt)} ·{" "}
                                {entry.note || "No notes"}
                              </p>
                            </div>
                            <span className="user-row-amount">
                              {formatCurrency(entry.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="user-empty">
                          No usage updates reported yet.
                        </p>
                      )}
                    </div>

                    <form
                      className="user-usage-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleUsageSubmit(project);
                      }}
                      noValidate
                    >
                      <label className="form-field">
                        <span className="form-label">Amount spent (KSh)</span>
                        <input
                          type="number"
                          min="0"
                          value={draft.amount}
                          onChange={(event) =>
                            updateUsageDraft(
                              project.id,
                              "amount",
                              event.target.value
                            )
                          }
                          placeholder="2500"
                          required
                        />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Category</span>
                        <select
                          value={draft.category}
                          onChange={(event) =>
                            updateUsageDraft(
                              project.id,
                              "category",
                              event.target.value
                            )
                          }
                        >
                          <option value="operations">Operations</option>
                          <option value="supplies">Supplies</option>
                          <option value="labor">Labor</option>
                          <option value="logistics">Logistics</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <label className="form-field">
                        <span className="form-label">Usage date</span>
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(event) =>
                            updateUsageDraft(
                              project.id,
                              "date",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      <label className="form-field form-field-wide">
                        <span className="form-label">Notes</span>
                        <textarea
                          rows="2"
                          value={draft.note}
                          onChange={(event) =>
                            updateUsageDraft(
                              project.id,
                              "note",
                              event.target.value
                            )
                          }
                          placeholder="Explain what the funds covered"
                        />
                      </label>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => handleUsageSubmit(project)}
                        >
                          Add usage update
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="user-empty">No projects to report yet.</p>
          )}
        </section>
      </div>
      )}
    </div>
  );
}
