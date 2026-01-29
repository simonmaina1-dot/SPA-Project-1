import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import useProjects from "../hooks/useProjects";
import useDonations from "../hooks/useDonations";
import { ToastContext } from "../context/ToastContext";
import useForm from "../hooks/useForm";
import Modal from "../components/Modal";

const donationInitialValues = {
  name: "",
  email: "",
  amount: "",
  note: "",
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { projects, formatCurrency, addDonation } = useProjects();
  const { getDonationsByProject } = useDonations();
  const { showToast } = useContext(ToastContext);
  
  const project = projects.find((item) => item.id === projectId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDonorsOpen, setIsDonorsOpen] = useState(false);
  const { values, handleChange, reset } = useForm(donationInitialValues);

  const galleryImages = [];
  const galleryUrls = Array.isArray(project?.galleryUrls)
    ? project.galleryUrls.filter(Boolean)
    : [];
  const galleryFiles = Array.isArray(project?.galleryFiles)
    ? project.galleryFiles.filter(Boolean)
    : [];

  const addImage = (url) => {
    if (url && !galleryImages.includes(url)) {
      galleryImages.push(url);
    }
  };

  addImage(project?.imageUrl);
  galleryUrls.forEach(addImage);
  galleryFiles.forEach((file) =>
    addImage(`/project-images/${projectId}/${file}`)
  );

  if (galleryImages.length === 0) {
    const galleryCount = Number(project?.galleryCount) || 0;
    for (let i = 1; i <= galleryCount; i++) {
      addImage(`/project-images/${projectId}/${i}.jpg`);
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/projects/${projectId}`;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Project link copied.", "success");
        return;
      } catch {
        // Fall back to prompt.
      }
    }

    window.prompt("Copy this link:", shareUrl);
  };

  const handleDonateSubmit = (event) => {
    event.preventDefault();
    const amount = Number(values.amount);

    if (!amount || amount <= 0) {
      showToast("Enter a valid donation amount.", "warning");
      return;
    }

    addDonation(projectId, amount);
    showToast("Thanks for supporting this project!", "success");
    reset();
    setIsDonateOpen(false);
  };

  // Auto-slide gallery images
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const isTestEnv =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.MODE === "test") ||
      (typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "test") ||
      (typeof import.meta !== "undefined" && import.meta.vitest);
    const isJsdom =
      typeof navigator !== "undefined" &&
      navigator.userAgent &&
      navigator.userAgent.includes("jsdom");

    if (isTestEnv || isJsdom) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  // Check if project exists and is approved
  if (!project) {
    return (
      <div className="page project-details-page">
        <section className="empty-state">
          <h2>Project not found</h2>
          <p>The project you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Back to projects
          </Link>
        </section>
      </div>
    );
  }

  // Only show approved projects publicly
  if (project.verificationStatus !== "approved") {
    return (
      <div className="page project-details-page">
        <section className="empty-state">
          <h2>Project Pending Verification</h2>
          <p>This project is currently pending admin verification and is not yet visible to the public.</p>
          <Link to="/" className="btn btn-primary">
            Back to projects
          </Link>
        </section>
      </div>
    );
  }

  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;
  const projectDonations = getDonationsByProject(projectId);
  const sortedDonations = [...projectDonations].sort((a, b) => {
    if (!a?.createdAt && !b?.createdAt) return 0;
    if (!a?.createdAt) return 1;
    if (!b?.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="page project-details-page">
      {/* Hero Section with Image Gallery */}
      <section className="details-hero">
        <div className="details-hero-image">
          {galleryImages.length > 0 ? (
            <>
              {galleryImages.map((src, index) => (
                <div
                  key={index}
                  className={`hero-slide${index === currentImageIndex ? " active" : ""}${loadedImages.has(index) ? " loaded" : ""}`}
                  style={{ backgroundImage: `url(${src})` }}
                >
                  <img
                    src={src}
                    alt=""
                    onLoad={() => handleImageLoad(index)}
                    style={{ display: "none" }}
                  />
                </div>
              ))}
              
              {/* Gallery Indicators */}
              {galleryImages.length > 1 && (
                <div className="gallery-indicators">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator${index === currentImageIndex ? " active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="hero-placeholder" />
          )}
          
          <div className="hero-overlay" />
          
          {/* Back Button */}
          <Link to="/" className="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section className="details-content">
        <div className="details-container">
          {/* Main Content */}
          <div className="details-main">
            <div className="details-header">
              <span className="project-category-badge">{project.category}</span>
              <h1 className="details-title">{project.title}</h1>
              <p className="details-description">{project.description}</p>
            </div>

            <div className="details-meta-grid">
              <div className="meta-card">
                <div className="meta-icon">💰</div>
                <div className="meta-content">
                  <span className="meta-label">Goal Amount</span>
                  <span className="meta-value">{formatCurrency(project.goal)}</span>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-icon">📊</div>
                <div className="meta-content">
                  <span className="meta-label">Raised So Far</span>
                  <span className="meta-value">{formatCurrency(project.currentAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                className="meta-card meta-card-button"
                onClick={() => setIsDonorsOpen(true)}
              >
                <div className="meta-icon">👥</div>
                <div className="meta-content">
                  <span className="meta-label">Total Donors</span>
                  <span className="meta-value">{project.donorCount || 0}</span>
                  <span className="meta-hint">View donors</span>
                </div>
              </button>

              <div className="meta-card">
                <div className="meta-icon">
                  {project.status === "funded" ? "✅" : project.status === "active" ? "🔥" : "⏳"}
                </div>
                <div className="meta-content">
                  <span className="meta-label">Status</span>
                  <span className={`meta-value status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h2>About This Project</h2>
              <p>{project.description}</p>
              <ul className="features-list">
                {project.category === "education" && (
                  <>
                    <li>✓ Learning resources for all ages</li>
                    <li>✓ Qualified tutors and mentors</li>
                    <li>✓ Safe and accessible spaces</li>
                  </>
                )}
                {project.category === "health" && (
                  <>
                    <li>✓ Professional medical staff</li>
                    <li>✓ Free or low-cost services</li>
                    <li>✓ Regular community outreach</li>
                  </>
                )}
                {project.category === "environment" && (
                  <>
                    <li>✓ Sustainable solutions</li>
                    <li>✓ Reduced carbon footprint</li>
                    <li>✓ Long-term cost savings</li>
                  </>
                )}
                {project.category === "community" && (
                  <>
                    <li>✓ Open to all residents</li>
                    <li>✓ Volunteer-driven operations</li>
                    <li>✓ Addressing local needs</li>
                  </>
                )}
                {project.category === "arts" && (
                  <>
                    <li>✓ Creative expression space</li>
                    <li>✓ Professional mentorship</li>
                    <li>✓ Supplies and materials included</li>
                  </>
                )}
                {project.category === "sports" && (
                  <>
                    <li>✓ Equipment for all skill levels</li>
                    <li>✓ Coached training sessions</li>
                    <li>✓ Building teamwork and fitness</li>
                  </>
                )}
                <li>✓ 100% transparent donation tracking</li>
                <li>✓ Regular progress updates</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="details-sidebar">
            <div className="donation-card">
              <div className="funding-progress-section">
                <div className="funding-stats">
                  <span className="funding-percentage">{progress}%</span>
                  <span className="funding-text">funded</span>
                </div>
                
                <div className="funding-bar-container">
                  <div className="funding-bar-track">
                    <div 
                      className="funding-bar-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="funding-details">
                  <div>
                    <strong>{formatCurrency(project.currentAmount)}</strong>
                    <span> raised</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(project.goal)}</strong>
                    <span> goal</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="donate-button"
                onClick={() => setIsDonateOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" fill="currentColor"/>
                </svg>
                Donate Now
              </button>

              <div className="share-section">
                <p className="share-label">Share this project</p>
                <div className="share-buttons">
                  <a
                    className="share-btn"
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on Twitter"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                  <a
                    className="share-btn"
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on Facebook"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </a>
                  <button
                    className="share-btn"
                    type="button"
                    aria-label="Copy link"
                    onClick={handleCopyLink}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Modal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        title="Support this project"
        footer={
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDonateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="donate-form">
              Donate
            </button>
          </div>
        }
      >
        <form className="form-card" id="donate-form" onSubmit={handleDonateSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Full name</span>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="your-name@email.com"
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Amount (KSh)</span>
              <input
                type="number"
                name="amount"
                value={values.amount}
                onChange={handleChange}
                min="1"
                placeholder="500"
                required
              />
            </label>
            <label className="form-field form-field-wide">
              <span className="form-label">Message</span>
              <textarea
                name="note"
                value={values.note}
                onChange={handleChange}
                rows="3"
                placeholder="Leave encouragement for the project team"
              />
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDonorsOpen}
        onClose={() => setIsDonorsOpen(false)}
        title="Donor list"
        footer={
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDonorsOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="donor-list">
          {sortedDonations.length === 0 ? (
            <p className="donor-empty">No donations yet.</p>
          ) : (
            <ul className="donor-rows">
              {sortedDonations.map((donation) => (
                <li key={donation.id} className="donor-row">
                  <div>
                    <p className="donor-name">
                      {donation.donorName?.trim() || "Anonymous"}
                    </p>
                    <p className="donor-meta">
                      {donation.createdAt
                        ? new Date(donation.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>
                  <div className="donor-amount">
                    {formatCurrency(donation.amount || 0)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </div>
  );
}
