import Modal from "../modals/Modal";

export default function AdminProjectManagement({
  projects,
  viewMode,
  setViewMode,
  formatCurrency,
  editProjectId,
  setEditProjectId,
  editValues,
  onEditChange,
  onEditSubmit,
  newProject,
  onNewProjectChange,
  onAddProject,
  onDeleteClick,
  deleteConfirmId,
  onConfirmDelete,
  onCancelDelete,
  getProjectTitle,
}) {
  return (
    <>
      <article className="admin-card admin-card-wide admin-project-management">
        <div className="admin-section-header">
          <div>
            <h3>Project management</h3>
            <p className="admin-card-subtitle">
              View, add, edit, or delete projects from the platform.
            </p>
          </div>
          <div className="admin-section-actions">
            {/* Add Project button removed - using modal instead */}
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
              <p className="admin-empty">
                No projects yet. Add your first project.
              </p>
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
                          {project.category.charAt(0).toUpperCase() +
                            project.category.slice(1)}
                        </span>
                      </td>
                      <td>{formatCurrency(project.goal)}</td>
                      <td>{formatCurrency(project.currentAmount || 0)}</td>
                      <td>
                        <span
                          className={`status-pill status-${project.status}`}
                        >
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
                          onClick={() => onDeleteClick(project.id)}
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
          <form className="admin-edit-form" onSubmit={onAddProject}>
            <div className="admin-edit-layout">
              <div className="admin-edit-main">
                <label className="form-field">
                  <span className="form-label">Project Title *</span>
                  <input
                    type="text"
                    name="title"
                    value={newProject.title}
                    onChange={onNewProjectChange}
                    placeholder="Enter project title"
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Description *</span>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={onNewProjectChange}
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
                      onChange={onNewProjectChange}
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
                      onChange={onNewProjectChange}
                      min="0"
                      placeholder="12000"
                      required
                    />
                  </label>
                </div>

                <label className="form-field">
                  <span className="form-label">
                    Gallery URLs (comma-separated)
                  </span>
                  <input
                    type="text"
                    name="galleryUrls"
                    value={newProject.galleryUrls}
                    onChange={onNewProjectChange}
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
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
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
                    onChange={onNewProjectChange}
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
          <form className="admin-edit-form" onSubmit={onEditSubmit}>
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
                    onChange={onEditChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Description</span>
                  <textarea
                    name="description"
                    value={editValues.description}
                    onChange={onEditChange}
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
                      onChange={onEditChange}
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
                      onChange={onEditChange}
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
                      onChange={onEditChange}
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
                    onChange={onEditChange}
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
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>No cover image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editValues.imageUrl}
                    onChange={onEditChange}
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
        onClose={onCancelDelete}
        title="Delete Project"
        footer={
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelDelete}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirmDelete}
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
    </>
  );
}
