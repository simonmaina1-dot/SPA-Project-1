import { useContext, useMemo, useState } from "react";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";

export default function AdminDashboard() {
  const { projects, formatCurrency, updateProject } = useProjects();
  const { showToast } = useContext(ToastContext);
  const { currentUser, signIn, signOut } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleFlag = (projectId) => {
    updateProject(projectId, { status: "review" });
    showToast("Project marked for review.", "info");
  };

  const handleApprove = (projectId) => {
    updateProject(projectId, { status: "active" });
    showToast("Project approved and back to active status.", "success");
  };

  const handleReminder = (projectTitle) => {
    showToast(`Reminder sent to ${projectTitle}.`, "info");
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

  if (!currentUser) {
    return (
      <div className="page admin-page">
        <section className="page-header">
          <h1>Admin Access</h1>
          <p>This dashboard is password protected for approved administrators.</p>
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
    );
  }

  const reviewList =
    metrics.reviewQueue.length > 0
      ? metrics.reviewQueue
      : projects.slice(0, 3);

  return (
    <div className="page admin-page">
      <section className="page-header">
        <h1>Admin Dashboard</h1>
        <p>
          Monitor campaigns, manage approvals, and keep community fundraising on
          track.
        </p>
        <div className="admin-user-bar">
          <span>
            Signed in as {currentUser.name} ({currentUser.role})
          </span>
          <button type="button" className="btn btn-secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className="admin-grid">
        <article className="admin-card admin-card-wide admin-card-snapshot">
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

        <article className="admin-card">
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
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleReminder(project.title)}
                >
                  Send reminder
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
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

        <article className="admin-card admin-card-wide">
          <h3>Recent activity</h3>
          <div className="admin-timeline">
            {projects.map((project, index) => (
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
      </section>
    </div>
  );
}
