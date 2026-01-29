import { useContext, useEffect, useMemo, useState } from "react";
import useProjects from "../hooks/useProjects";
import useFeedback from "../hooks/useFeedback";
import useDonations from "../hooks/useDonations";
import { ToastContext } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import AdminLoginView from "../components/admin/AdminLoginView";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSnapshotCard from "../components/admin/AdminSnapshotCard";
import AdminRecentActivity from "../components/admin/AdminRecentActivity";
import AdminProjectManagement from "../components/admin/AdminProjectManagement";
import AdminInsightsGrid from "../components/admin/AdminInsightsGrid";
import AdminTopDonorsTable from "../components/admin/AdminTopDonorsTable";
import AdminFeedbackList from "../components/admin/AdminFeedbackList";

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
  const { currentUser, signInAdmin, signOut } = useAuth();
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
  const [deleteFeedbackId, setDeleteFeedbackId] = useState(null);
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

  // Calculate top donors (repeat donors with highest total contributions)
  const donorMetrics = useMemo(() => {
    const donorMap = {};

    donations.forEach((donation) => {
      const email = donation.donorEmail?.toLowerCase() || "";
      const name = donation.donorName || "Anonymous";

      // Skip anonymous donations for tracking
      if (!email || name === "Anonymous") return;

      if (!donorMap[email]) {
        donorMap[email] = {
          name,
          email,
          totalAmount: 0,
          donationCount: 0,
          lastDonation: donation.createdAt,
        };
      }

      donorMap[email].totalAmount += donation.amount || 0;
      donorMap[email].donationCount += 1;
      if (donation.createdAt > donorMap[email].lastDonation) {
        donorMap[email].lastDonation = donation.createdAt;
      }
    });

    const allDonors = Object.values(donorMap);
    const topDonors = [...allDonors]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    const repeatDonors = allDonors.filter((d) => d.donationCount > 1);
    const uniqueDonorCount = allDonors.length;
    const repeatDonorCount = repeatDonors.length;

    return {
      topDonors,
      repeatDonors,
      uniqueDonorCount,
      repeatDonorCount,
    };
  }, [donations]);

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

    const result = signInAdmin(credentials.email, credentials.password);
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

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <AdminLoginView
        credentials={credentials}
        showPassword={showPassword}
        errorMessage={errorMessage}
        onChange={handleChange}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={handleLogin}
      />
    );
  }

  const reviewList =
    metrics.reviewQueue.length > 0
      ? metrics.reviewQueue
      : projects.slice(0, 3);

  return (
    <div className="page admin-page">
      <AdminNavbar currentUser={currentUser} onSignOut={signOut} />

      <div className="admin-content">
        <section className="page-header">
          <h1>Admin Dashboard</h1>
          <p>
            Monitor campaigns, manage approvals, and keep community fundraising on
            track.
          </p>
        </section>

        <section className="admin-grid">
          <AdminSnapshotCard
            projectCount={projects.length}
            metrics={metrics}
            formatCurrency={formatCurrency}
          />

          <AdminRecentActivity
            projects={projects}
            formatCurrency={formatCurrency}
          />

          <AdminProjectManagement
            projects={projects}
            viewMode={viewMode}
            setViewMode={setViewMode}
            formatCurrency={formatCurrency}
            editProjectId={editProjectId}
            setEditProjectId={setEditProjectId}
            editValues={editValues}
            onEditChange={handleEditChange}
            onEditSubmit={handleEditSubmit}
            newProject={newProject}
            onNewProjectChange={handleNewProjectChange}
            onAddProject={handleAddProject}
            onDeleteClick={handleDeleteClick}
            deleteConfirmId={deleteConfirmId}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
            getProjectTitle={getProjectTitle}
          />

          <AdminInsightsGrid
            metrics={metrics}
            reviewList={reviewList}
            formatCurrency={formatCurrency}
            onApprove={handleApprove}
            onFlag={handleFlag}
          />

          <AdminTopDonorsTable
            donorMetrics={donorMetrics}
            formatCurrency={formatCurrency}
          />

          <AdminFeedbackList
            feedbackList={feedbackList}
            updateFeedbackStatus={updateFeedbackStatus}
            removeFeedback={removeFeedback}
            showToast={showToast}
          />
        </section>
      </div>
    </div>
  );
}
