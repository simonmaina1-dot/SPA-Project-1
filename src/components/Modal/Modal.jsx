import { useState } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  children,
  showAddProjectForm = false,
  showFooter = true,
  onAddProject
}) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    targetAmount: '',
    description: '',
    imageUrl: '',
    webUrl: '',
    imageFile: null
  });
  const [showAddForm, setShowAddForm] = useState(showAddProjectForm);

  const handleAddProjectClick = () => {
    setShowAddForm(true);
    if (onAddProject) {
      onAddProject();
    }
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      projectTitle: '',
      category: '',
      targetAmount: '',
      description: '',
      imageUrl: '',
      webUrl: '',
      imageFile: null
    });
    setShowAddForm(showAddProjectForm);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        imageFile: file,
        imageUrl: file.name || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    handleClose();
  };

  if (!isOpen) return null;

  // Render children content (for vetting modal) with Add Project button
  if (children && !showAddForm) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="project-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card-spotlight"></div>
          <div className="modal-children-content">
            {children}
          </div>
          {/* Add Project Button in vetting modal */}
          {onAddProject && (
            <div className="modal-add-project-btn-container">
              <button 
                type="button" 
                className="btn btn-primary modal-add-project-btn"
                onClick={handleAddProjectClick}
              >
                + Add Project
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Add Project form with iOS styling
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card-spotlight"></div>
        
        {/* Header - PROJECT DETAILS */}
        <div className="modal-header">
          <h2>PROJECT DETAILS</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="project-form">
          {/* First Row - Project Title + Category */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="projectTitle">project title</label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Enter project title"
                required
                autoComplete="off"
                className="ios-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="category">category</label>
              <select
                id="category"
                name="category"
                className="ios-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Environment">Environment</option>
                <option value="Community">Community</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          {/* Second Row - Target Amount (aligned with category) */}
          <div className="form-row">
            <div className="input-group input-group-empty">
              {/* Empty left side for alignment */}
            </div>
            <div className="input-group">
              <label htmlFor="targetAmount">target amount (ksh)</label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="50000"
                required
                min="1"
                autoComplete="off"
                className="ios-input"
              />
            </div>
          </div>

          {/* Third Row - Description */}
          <div className="input-group form-row-full">
            <label htmlFor="description">description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project and its impact on the community..."
              rows="8"
              required
              className="ios-input ios-textarea"
            />
          </div>

          {/* Fourth Row - Image URL + Web URL | Add Image Upload Box */}
          <div className="form-row form-row-images">
            <div className="input-group image-urls-group">
              <label htmlFor="imageUrl">image url</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                autoComplete="off"
                className="ios-input"
              />
              <label htmlFor="webUrl" style={{ marginTop: '0.75rem' }}>web url</label>
              <input
                type="url"
                id="webUrl"
                name="webUrl"
                value={formData.webUrl}
                onChange={handleChange}
                placeholder="https://project-website.com"
                autoComplete="off"
                className="ios-input"
              />
            </div>
            <div className="input-group">
              <label>add image</label>
              <div className="image-upload-box">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
                <label htmlFor="imageUpload" className="image-upload-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="plus-icon">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          {showFooter && (
            <div className="form-footer">
              <button type="button" className="ios-btn-secondary" onClick={handleClose}>
                cancel
              </button>
              <button type="submit" className="ios-btn-primary">
                create project
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Modal;
