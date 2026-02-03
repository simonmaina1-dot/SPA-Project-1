import { useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  children,
  showAddProjectForm = false,
  showFooter = true
}) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    webUrl: ''
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

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
    
    // Reset form
    setFormData({
      projectTitle: '',
      category: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      webUrl: ''
    });
    
    onClose();
  };

  if (!isOpen) return null;

  // Render children content (for vetting modal, etc.)
  if (children && !showAddProjectForm) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="project-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card-spotlight"></div>
          <div className="modal-children-content">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Render Add Project form with iOS styling
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card-spotlight"></div>
        
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

          {/* Second Row - Description */}
          <div className="input-group form-row-full">
            <label htmlFor="description">description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project and its impact on the community..."
              rows="6"
              required
              className="ios-input ios-textarea"
            />
          </div>

          {/* Third Row - Image URL + Add Image */}
          <div className="form-row">
            <div className="input-group form-group-narrow">
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
            </div>
            <div className="input-group form-group-wide">
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

          {/* Fourth Row - Web URL */}
          <div className="input-group form-row-full">
            <label htmlFor="webUrl">web url</label>
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

          {/* Fifth Row - iOS Style Footer Buttons */}
          {showFooter && (
            <div className="form-footer">
              <button type="button" className="ios-btn-secondary" onClick={onClose}>
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
