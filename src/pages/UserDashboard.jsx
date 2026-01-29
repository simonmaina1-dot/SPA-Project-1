import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useDonations from "../hooks/useDonations";
import useProjects from "../hooks/useProjects";

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
  const { projects, formatCurrency } = useProjects();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (currentUser.isAdmin) {
    return <Navigate to="/dashboard" replace />;
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
      projects.filter(
        (project) =>
          project.createdBy?.email?.toLowerCase() === normalizedEmail
      ),
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

    return [...donationItems, ...projectItems]
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 6);
  }, [myDonations, myProjects]);

  return (
    <div className="page user-dashboard-page">
      <section className="page-header">
        <h1>Your dashboard</h1>
        <p>Welcome back, {currentUser.name}.</p>
      </section>

      <div className="user-dashboard-grid">
        <section className="user-card">
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

        <section className="user-card">
          <div className="user-card-header">
            <div>
              <h2>Projects created</h2>
              <p className="user-card-subtitle">
                {myProjects.length} active projects
              </p>
            </div>
            <Link to="/add" className="btn btn-secondary btn-small">
              Start a project
            </Link>
          </div>

          {myProjects.length ? (
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
          ) : (
            <p className="user-empty">No projects created yet.</p>
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

          <div className="user-card-actions">
            <button type="button" className="btn btn-secondary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
