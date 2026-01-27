import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import useFeedback from "../hooks/useFeedback";
import useDonations from "../hooks/useDonations";
import { ToastContext } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import Modal from "../components/Modal";

export default function AdminDashboard() {
  const {
    projects,
    formatCurrency,
    updateProject,
    addProject,
    removeProject,
  } = useProjects();
  const { feedbackList, updateFeedbackStatus, removeFeedback } = useFeedback();
  const { donations, getRecentDonations } = useDonations();
  const { showToast } = useContext(ToastContext);
  const { currentUser, signIn, signOut } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [editProjectId, setEditProjectId] = useState("");
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    category: "community",
    goal: "",
    status: "active",
    imageUrl: "",
    galleryUrls: "",
  });
  const [viewMode, setViewMode] = useState("add");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "community",
    goal: "",
    imageUrl: "",
    galleryUrls: "",
  });

  const metrics = useMemo(() => {
    const totalRaised = projects.reduce(
      (sum, project) => sum + (project.currentAmount || 0),
      0
    );
    const totalGoal = projects.reduce(
      (sum, project) => sum + (project.goal || 0),
      0
    );
    const totalDonors = projects.reduce(
      (sum, project) => sum + (project.donorCount || 0),
      0
    );
    const fundedCount = projects.filter(
      (project) => (project.currentAmount || 0) >= (project.goal || 0)
    ).length;
    const activeCount = Math.max(0, projects.length - fundedCount);
    const completion = totalGoal ? totalRaised / totalGoal : 0;
    const averageDonation = totalDonors ? totalRaised / totalDonors : 0;

    const categoryMap = projects.reduce((acc, project) => {
      const category = project.category || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    const maxCategoryCount = categoryBreakdown[0]?.count || 1;

    const progressProjects = projects.map((project) => {
      const progress = project.goal
        ? Math.round(((project.currentAmount || 0) / project.goal) * 100)
        : 0;
      return { ...project, progress };
    });

    const topProjects = [...progressProjects]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    const needsAttention = progressProjects
      .filter((project) => project.progress < 40 && project.status !== "funded")
      .slice(0, 3);

    const reviewQueue = projects.filter((project) => project.status === "review");

    return {
      totalRaised,
      totalGoal,
      totalDonors,
      fundedCount,
      activeCount,
      completion,
      averageDonation,
      categoryBreakdown,
      maxCategoryCount,
      topProjects,
      needsAttention,
      reviewQueue,
    };
  }, [projects]);

  useEffect(() => {
    if (!projects.length) {
      setEditProjectId("");
      setEditValues({
        title: "",
        description: "",
        category: "community",
        goal: "",
        status: "active",
        imageUrl: "",
        galleryUrls: "",
      });
      return;
    }

    const selected =
      projects.find((project) => project.id === editProjectId) || projects[0];

    if (selected.id !== editProjectId) {
      setEditProjectId(selected.id);
    }

    setEditValues({
      title: selected.title || "",
      description: selected.description || "",
      category: selected.category || "community",
      goal: selected.goal ?? "",
      status: selected.status || "active",
      imageUrl: selected.imageUrl || "",
      galleryUrls: Array.isArray(selected.galleryUrls)
        ? selected.galleryUrls.join(", ")
        : "",
    });
  }, [projects, editProjectId]);

  const handleFlag = (projectId) => {
    updateProject(projectId, { status: "review" });
    showToast("Project marked for review.", "info");
  };

  const handleApprove = (projectId) => {
    updateProject(projectId, { status: "active" });
    showToast("Project approved and back to active status.", "success");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setErrorMessage("");

    const result = signIn(credentials.email, credentials.password);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    showToast(`Welcome back, ${result.user.name}.`, "success");
    setCredentials({ email: "", password: "" });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editProjectId) {
      showToast("Select a project to edit first.", "warning");
      return;
    }

    const galleryUrls = editValues.galleryUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
    const goal = Number(editValues.goal) || 0;

    updateProject(editProjectId, {
      title: editValues.title.trim(),
      description: editValues.description.trim(),
      category: editValues.category || "community",
      goal,
      status: editValues.status || "active",
      imageUrl: editValues.imageUrl.trim(),
      galleryUrls,
    });

    showToast("Project details updated.", "success");
  };

  const handleNewProjectChange = (event) => {
    const { name, value } = event.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProject = (event) => {
    event.preventDefault();

    if (!newProject.title.trim() || !newProject.description.trim()) {
      showToast("Please fill in required fields.", "warning");
      return;
    }

    const galleryUrls = newProject.galleryUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    addProject({
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      category: newProject.category || "community",
      goal: Number(newProject.goal) || 0,
      imageUrl: newProject.imageUrl.trim(),
      galleryUrls,
    });

    showToast("Project created successfully.", "success");
    setNewProject({
      title: "",
      description: "",
      category: "community",
      goal: "",
      imageUrl: "",
      galleryUrls: "",
    });
    setViewMode("table");
  };

  const handleDeleteClick = (projectId) => {
    setDeleteConfirmId(projectId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      removeProject(deleteConfirmId);
      showToast("Project deleted.", "success");
      setDeleteConfirmId(null);
      if (editProjectId === deleteConfirmId) {
        setEditProjectId("");
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const getProjectTitle = (id) => {
    const project = projects.find((p) => p.id === id);
    return project?.title || "this project";
  };

  if (!currentUser) {
    return (
      <div className="page admin-page">
        <nav className="admin-navbar">
          <Link to="/" className="admin-brand">
            Community Donation Hub
          </Link>
          <div className="admin-navbar-right">
            <Link to="/" className="admin-back-link">
              Back to main site
            </Link>
            <span className="admin-user-info">Admin access</span>
          </div>
        </nav>

        <div className="admin-content">
          <section className="page-header">
            <h1>Admin Access</h1>
            <p>
              This dashboard is password protected for approved administrators.
            </p>
          </section>

          <form className="form-card admin-login" onSubmit={handleLogin}>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-label">Admin email</span>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </label>

              <label className="form-field">
                <span className="form-label">Password</span>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            </div>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const reviewList =
    metrics.reviewQueue.length > 0
      ? metrics.reviewQueue
      : projects.slice(0, 3);

  return (
    <div className="page admin-page">
      <nav className="admin-navbar">
        <Link to="/" className="admin-brand">
          Community Donation Hub
        </Link>
        <div className="admin-navbar-right">
          <Link to="/" className="admin-back-link">
            Back to main site
          </Link>
          <span className="admin-user-info">
            Signed in as {currentUser.name} ({currentUser.role})
          </span>
          <button type="button" className="btn btn-secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <section className="page-header">
          <h1>Admin Dashboard</h1>
          <p>
            Monitor campaigns, manage approvals, and keep community fundraising on
            track.
          </p>
        </section>

        <section className="admin-grid">
        <article className="admin-card admin-card-snapshot">
          <h3>Platform snapshot</h3>
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="admin-stat-value">{projects.length}</span>
              <span className="admin-stat-label">Active projects</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{metrics.totalDonors}</span>
              <span className="admin-stat-label">Total donors</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">
                {formatCurrency(metrics.totalRaised)}
              </span>
              <span className="admin-stat-label">Total raised</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">
                {formatCurrency(metrics.averageDonation)}
              </span>
              <span className="admin-stat-label">Average donation</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{metrics.fundedCount}</span>
              <span className="admin-stat-label">Fully funded</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">
                {formatCurrency(Math.max(0, metrics.totalGoal - metrics.totalRaised))}
              </span>
              <span className="admin-stat-label">Remaining need</span>
            </div>
          </div>
        </article>

        <article className="admin-card admin-card-activity">
          <h3>Recent activity</h3>
          <div className="admin-timeline">
            {projects.slice(0, 5).map((project, index) => (
              <div key={project.id} className="admin-activity">
                <span className="admin-activity-dot" />
                <div>
                  <p className="admin-row-title">
                    {project.title} received a donation
                  </p>
                  <span className="admin-row-meta">
                    {formatCurrency(Math.round((project.currentAmount || 0) / 4))} -{" "}
                    {project.category}
                  </span>
                  <span className="admin-activity-time">
                    {index === 0
                      ? "Just now"
                      : index === 1
                        ? "Today"
                        : "This week"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card admin-card-wide admin-project-management">
          <div className="admin-section-header">
            <div>
              <h3>Project management</h3>
              <p className="admin-card-subtitle">
                View, add, edit, or delete projects from the platform.
              </p>
            </div>
            <div className="admin-section-actions">
              {viewMode === "table" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setViewMode("add")}
                >
                  + Add Project
                </button>
              )}
              {viewMode !== "table" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewMode("table")}
                >
                  Back to List
                </button>
              )}
            </div>
          </div>

          {viewMode === "table" && (
            <div className="admin-table-container">
              {projects.length === 0 ? (
                <p className="admin-empty">No projects yet. Add your first project.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Goal</th>
                      <th>Raised</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="admin-table-title">{project.title}</td>
                        <td>
                          <span className="admin-category-badge">
                            {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                          </span>
                        </td>
                        <td>{formatCurrency(project.goal)}</td>
                        <td>{formatCurrency(project.currentAmount || 0)}</td>
                        <td>
                          <span className={`status-pill status-${project.status}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="admin-table-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => {
                              setEditProjectId(project.id);
                              setViewMode("edit");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteClick(project.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {viewMode === "add" && (
            <form className="admin-edit-form" onSubmit={handleAddProject}>
              <div className="admin-edit-layout">
                <div className="admin-edit-main">
                  <label className="form-field">
                    <span className="form-label">Project Title *</span>
                    <input
                      type="text"
                      name="title"
                      value={newProject.title}
                      onChange={handleNewProjectChange}
                      placeholder="Enter project title"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span className="form-label">Description *</span>
                    <textarea
                      name="description"
                      value={newProject.description}
                      onChange={handleNewProjectChange}
                      rows="5"
                      placeholder="Describe what this project will accomplish..."
                      required
                    />
                  </label>

                  <div className="admin-edit-row">
                    <label className="form-field">
                      <span className="form-label">Category</span>
                      <select
                        name="category"
                        value={newProject.category}
                        onChange={handleNewProjectChange}
                      >
                        <option value="education">Education</option>
                        <option value="health">Health & Medical</option>
                        <option value="environment">Environment</option>
                        <option value="community">Community</option>
                        <option value="technology">Technology</option>
                        <option value="arts">Arts & Culture</option>
                        <option value="sports">Sports & Recreation</option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Funding Goal (KSh) *</span>
                      <input
                        type="number"
                        name="goal"
                        value={newProject.goal}
                        onChange={handleNewProjectChange}
                        min="0"
                        placeholder="12000"
                        required
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span className="form-label">Gallery URLs (comma-separated)</span>
                    <input
                      type="text"
                      name="galleryUrls"
                      value={newProject.galleryUrls}
                      onChange={handleNewProjectChange}
                      placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                    />
                  </label>
                </div>

                <div className="admin-edit-sidebar">
                  <div className="admin-edit-preview-card">
                    <label className="form-label" htmlFor="new-project-cover">
                      Cover image URL
                    </label>
                    <div className="admin-edit-preview">
                      {newProject.imageUrl ? (
                        <img
                          src={newProject.imageUrl}
                          alt="Project cover preview"
                          loading="lazy"
                        />
                      ) : (
                        <div className="admin-edit-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>No cover image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      id="new-project-cover"
                      name="imageUrl"
                      value={newProject.imageUrl}
                      onChange={handleNewProjectChange}
                      placeholder="https://images.example.com/cover.jpg"
                      className="admin-edit-url-input"
                      aria-label="Cover image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewMode("table")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          )}

          {viewMode === "edit" && (
            <form className="admin-edit-form" onSubmit={handleEditSubmit}>
              <div className="admin-edit-layout">
                <div className="admin-edit-main">
                  <label className="form-field">
                    <span className="form-label">Select Project</span>
                    <select
                      name="projectId"
                      value={editProjectId}
                      onChange={(event) => setEditProjectId(event.target.value)}
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span className="form-label">Project Title</span>
                    <input
                      type="text"
                      name="title"
                      value={editValues.title}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span className="form-label">Description</span>
                    <textarea
                      name="description"
                      value={editValues.description}
                      onChange={handleEditChange}
                      rows="5"
                      placeholder="Describe what this project will accomplish..."
                    />
                  </label>

                  <div className="admin-edit-row">
                    <label className="form-field">
                      <span className="form-label">Category</span>
                      <select
                        name="category"
                        value={editValues.category}
                        onChange={handleEditChange}
                      >
                        <option value="education">Education</option>
                        <option value="health">Health & Medical</option>
                        <option value="environment">Environment</option>
                        <option value="community">Community</option>
                        <option value="technology">Technology</option>
                        <option value="arts">Arts & Culture</option>
                        <option value="sports">Sports & Recreation</option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Status</span>
                      <select
                        name="status"
                        value={editValues.status}
                        onChange={handleEditChange}
                      >
                        <option value="active">Active</option>
                        <option value="review">Review</option>
                        <option value="funded">Funded</option>
                        <option value="draft">Draft</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Funding Goal (KSh)</span>
                      <input
                        type="number"
                        name="goal"
                        value={editValues.goal}
                        onChange={handleEditChange}
                        min="0"
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span className="form-label">Gallery URLs (comma-separated)</span>
                    <input
                      type="text"
                      name="galleryUrls"
                      value={editValues.galleryUrls}
                      onChange={handleEditChange}
                      placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                    />
                  </label>
                </div>

                <div className="admin-edit-sidebar">
                  <div className="admin-edit-preview-card">
                    <span className="form-label">Cover Image</span>
                    <div className="admin-edit-preview">
                      {editValues.imageUrl ? (
                        <img
                          src={editValues.imageUrl}
                          alt="Project cover preview"
                          loading="lazy"
                        />
                      ) : (
                        <div className="admin-edit-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>No cover image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      name="imageUrl"
                      value={editValues.imageUrl}
                      onChange={handleEditChange}
                      placeholder="https://images.example.com/cover.jpg"
                      className="admin-edit-url-input"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewMode("table")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </article>

        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={handleCancelDelete}
          title="Delete Project"
          footer={
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          }
        >
          <p>Are you sure you want to delete "{getProjectTitle(deleteConfirmId)}"?</p>
          <p className="admin-warning-text">
            This action cannot be undone. All project data will be permanently removed.
          </p>
        </Modal>

        <div className="admin-insights-grid admin-card-wide">
          <article className="admin-card">
            <h3>Funding health</h3>
            <p className="admin-card-subtitle">
              Track platform-wide progress toward the full fundraising goal.
            </p>
            <div className="admin-health">
              <div className="admin-health-header">
                <span className="admin-health-value">
                  {Math.min(100, Math.round(metrics.completion * 100))}%
                </span>
                <span className="admin-health-label">of total goal funded</span>
              </div>
              <div className="progress-bar large">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round(metrics.completion * 100))}%`,
                  }}
                />
              </div>
              <div className="admin-health-meta">
                <span>{formatCurrency(metrics.totalRaised)} raised</span>
                <span>{formatCurrency(metrics.totalGoal)} goal</span>
              </div>
            </div>
            <div className="admin-health-grid">
              <div className="admin-health-card">
                <span className="admin-health-title">Average donation</span>
                <span className="admin-health-stat">
                  {formatCurrency(metrics.averageDonation)}
                </span>
              </div>
              <div className="admin-health-card">
                <span className="admin-health-title">Active campaigns</span>
                <span className="admin-health-stat">{metrics.activeCount}</span>
              </div>
            </div>
          </article>

          <article className="admin-card">
            <h3>Category focus</h3>
            <p className="admin-card-subtitle">
              Where new projects are concentrated this cycle.
            </p>
            <div className="admin-breakdown">
              {metrics.categoryBreakdown.length === 0 && (
                <p className="admin-empty">No project categories yet.</p>
              )}
              {metrics.categoryBreakdown.map((item) => (
                <div key={item.category} className="admin-breakdown-row">
                  <div className="admin-breakdown-label">
                    <span className="admin-row-title">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    <span className="admin-row-meta">{item.count} projects</span>
                  </div>
                  <div className="admin-breakdown-bar">
                    <div
                      className="admin-breakdown-fill"
                      style={{
                        width: `${(item.count / metrics.maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h3>Review queue</h3>
            <p className="admin-card-subtitle">
              {metrics.reviewQueue.length > 0
                ? `${metrics.reviewQueue.length} project(s) flagged for review.`
                : "No projects flagged. Quick check-in list below."}
            </p>
            <div className="admin-list">
              {reviewList.map((project) => (
                <div key={project.id} className="admin-row">
                  <div>
                    <p className="admin-row-title">{project.title}</p>
                    <span className="admin-row-meta">
                      {project.category} - {project.donorCount || 0} donors
                    </span>
                  </div>
                  <div className="admin-row-actions">
                    {project.status === "review" ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleApprove(project.id)}
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleFlag(project.id)}
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card admin-card-stretch">
            <h3>Needs attention</h3>
            <p className="admin-card-subtitle">
              Projects below 40% funded that may need outreach.
            </p>
            <div className="admin-list">
              {metrics.needsAttention.length === 0 && (
                <p className="admin-empty">All projects are tracking well.</p>
              )}
              {metrics.needsAttention.map((project) => (
                <div key={project.id} className="admin-row">
                  <div>
                    <p className="admin-row-title">{project.title}</p>
                    <span className="admin-row-meta">
                      {project.progress}% funded - {formatCurrency(project.currentAmount)} of{" "}
                      {formatCurrency(project.goal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card admin-card-stretch">
            <h3>Top performers</h3>
            <p className="admin-card-subtitle">
              Highest funded campaigns right now.
            </p>
            <div className="admin-list">
              {metrics.topProjects.map((project) => (
                <div key={project.id} className="admin-row">
                  <div>
                    <p className="admin-row-title">{project.title}</p>
                    <span className="admin-row-meta">
                      {formatCurrency(project.currentAmount)} raised
                    </span>
                  </div>
                  <span className="admin-pill">{project.progress}% funded</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="admin-card admin-card-wide">
          <div className="admin-section-header">
            <div>
              <h3>Donor Records</h3>
              <p className="admin-card-subtitle">
                Recent donations and donor information.
              </p>
            </div>
            <span className="admin-badge">{donations.length} total</span>
          </div>
          <div className="admin-table-container">
            {donations.length === 0 ? (
              <p className="admin-empty">No donations recorded yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Email</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {getRecentDonations(10).map((donation) => (
                    <tr key={donation.id}>
                      <td className="admin-table-title">{donation.donorName}</td>
                      <td>{donation.donorEmail || "—"}</td>
                      <td>{donation.projectTitle}</td>
                      <td>{formatCurrency(donation.amount)}</td>
                      <td className="admin-row-meta">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        <article className="admin-card admin-card-wide">
          <div className="admin-section-header">
            <div>
              <h3>User Feedback</h3>
              <p className="admin-card-subtitle">
                Community suggestions and feedback submissions.
              </p>
            </div>
          </div>
          <div className="admin-feedback-list">
            {feedbackList.length === 0 ? (
              <p className="admin-empty">No feedback received yet.</p>
            ) : (
              feedbackList.map((feedback) => (
                <div key={feedback.id} className="admin-feedback-card">
                  <div className="admin-feedback-header">
                    <div>
                      <p className="admin-row-title">{feedback.name}</p>
                      <span className="admin-row-meta">{feedback.email}</span>
                    </div>
                    <div className="admin-feedback-meta">
                      <span className={`status-pill status-${feedback.status === "new" ? "active" : "funded"}`}>
                        {feedback.status}
                      </span>
                      <span className="admin-row-meta">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="admin-feedback-message">{feedback.message}</p>
                  <div className="admin-feedback-actions">
                    {feedback.status === "new" && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          updateFeedbackStatus(feedback.id, "reviewed");
                          showToast("Feedback marked as reviewed.", "success");
                        }}
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => {
                        removeFeedback(feedback.id);
                        showToast("Feedback removed.", "success");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
        </section>
      </div>
    </div>
  );
}
