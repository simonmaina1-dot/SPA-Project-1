import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { ToastContext } from '../../context/ToastContext';
import './ProjectDetailsModal.css';

// X Icon Component
function XIcon({ className, onClick }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Photo Icon Component
function PhotoIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

// Delete Icon Component
function DeleteIcon({ className, onClick }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' },
  { value: 'arts', label: 'Arts' },
  { value: 'technology', label: 'Technology' },
  { value: 'community', label: 'Community' },
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ProjectDetailsModal = ({
  isOpen,
  onClose,
  onSubmit,
  onSave,
  initialData = {},
  isEdit = false,
}) => {
  const { showToast } = useContext(ToastContext);
  
  // ✅ STATE INITIALIZATION - Critical for controlled inputs
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    targetAmount: '',
    description: '',
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ RESET FORM DATA - Called when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectTitle: initialData.title || '',
        category: initialData.category || '',
        targetAmount: initialData.goal ? String(initialData.goal) : '',
        description: initialData.description || '',
      });
      setUploadedImages(initialData.images || []);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ✅ HANDLE INPUT CHANGE - This makes text appear
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    
    console.log(`✅ ${field} changed to:`, value); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // ✅ HANDLE BLUR - Mark field as touched and validate
  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [formData]);

  // ✅ VALIDATE A SINGLE FIELD
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'projectTitle':
        if (!value || !value.trim()) {
          error = 'Project title is required';
        }
        break;
      case 'category':
        if (!value) {
          error = 'Category is required';
        }
        break;
      case 'targetAmount':
        if (!value || Number(value) <= 0) {
          error = 'Target amount must be greater than 0';
        }
        break;
      case 'description':
        if (!value || !value.trim()) {
          error = 'Description is required';
        } else if (value.trim().length < 50) {
          error = 'Description must be at least 50 characters';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // ✅ VALIDATE FILE
  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  // ✅ HANDLE IMAGE UPLOAD
  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    
    if (uploadedImages.length + fileArray.length > MAX_IMAGES) {
      showToast(`Maximum ${MAX_IMAGES} images allowed`, 'warning');
      return;
    }
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        showToast(error, 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, {
          file: file,
          preview: reader.result,
          name: file.name,
          size: file.size,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  const handleDeleteImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ DRAG AND DROP HANDLERS
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ VALIDATE ENTIRE FORM
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      projectTitle: true,
      category: true,
      targetAmount: true,
      description: true,
    });

    return isValid;
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('✅ Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    const submitData = {
      title: formData.projectTitle.trim(),
      category: formData.category,
      goal: parseFloat(formData.targetAmount),
      description: formData.description.trim(),
      images: uploadedImages,
    };

    console.log('✅ Submitting:', submitData);
    
    // Support both onSubmit and onSave for compatibility
    if (onSubmit) {
      onSubmit(submitData);
    } else if (onSave) {
      onSave(submitData);
    }
  };

  // ✅ HANDLE CANCEL
  const handleCancel = () => {
    const hasChanges =
      formData.projectTitle ||
      formData.category ||
      formData.targetAmount ||
      formData.description ||
      uploadedImages.length > 0;

    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }

    onClose();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div
        className="project-details-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          className="modal-close-icon"
          onClick={handleCancel}
          aria-label="Close modal"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="modal-header-gradient">
          <h2 className="modal-title">Project Details</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-content">
            {/* Row 1: Project Title & Category */}
            <div className="form-row">
              {/* Project Title - ✅ CRITICAL FIX */}
              <div className="form-field">
                <label className="form-label">
                  Project Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={handleChange('projectTitle')}
                  onBlur={handleBlur('projectTitle')}
                  placeholder="Enter project name"
                  className={`form-input ${
                    touched.projectTitle && errors.projectTitle ? 'error' : ''
                  }`}
                  style={{
                    WebkitTextFillColor: '#111827',
                    opacity: 1
                  }}
                />
                {touched.projectTitle && errors.projectTitle && (
                  <span className="error-message">{errors.projectTitle}</span>
                )}
              </div>

              {/* Category - ✅ CRITICAL FIX */}
              <div className="form-field">
                <label className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={handleChange('category')}
                  onBlur={handleBlur('category')}
                  className={`form-select ${
                    touched.category && errors.category ? 'error' : ''
                  }`}
                  style={{
                    WebkitTextFillColor: '#111827',
                    opacity: 1
                  }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {touched.category && errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>
            </div>

            {/* Target Amount - ✅ CRITICAL FIX */}
            <div className="form-field">
              <label className="form-label">
                Target Amount (Ksh) <span className="required">*</span>
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={handleChange('targetAmount')}
                onBlur={handleBlur('targetAmount')}
                placeholder="50000"
                min="0"
                step="100"
                className={`form-input ${
                  touched.targetAmount && errors.targetAmount ? 'error' : ''
                }`}
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1
                }}
              />
              {touched.targetAmount && errors.targetAmount && (
                <span className="error-message">{errors.targetAmount}</span>
              )}
            </div>

            {/* Description - ✅ CRITICAL FIX */}
            <div className="form-field">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleChange('description')}
                onBlur={handleBlur('description')}
                placeholder="Describe the project and its impact on the community..."
                rows={6}
                className={`form-textarea ${
                  touched.description && errors.description ? 'error' : ''
                }`}
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1
                }}
              />
              <div className="flex justify-between items-center mt-1">
                {touched.description && errors.description ? (
                  <span className="error-message">{errors.description}</span>
                ) : (
                  <span className="char-count">
                    {formData.description.length} characters (minimum 50)
                  </span>
                )}
              </div>
            </div>

            {/* Add Images */}
            <div className="form-field">
              <label className="form-label">
                Add Images <span className="optional">(Optional)</span>
              </label>

              {/* Upload Area */}
              <div
                className={`upload-area ${isDragging ? 'drag-over' : ''} ${
                  uploadedImages.length > 0 ? 'has-files' : ''
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
                aria-label="Click or drag files to upload"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="file-input"
                  aria-hidden="true"
                />
                <div className="upload-content">
                  <PhotoIcon className="upload-icon" />
                  <p className="upload-text">
                    <span className="upload-highlight">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="upload-hint">
                    PNG, JPG, WEBP up to 5MB each (Max {MAX_IMAGES} images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="image-preview-grid">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="image-preview-img"
                      />
                      <button
                        type="button"
                        className="image-delete-btn"
                        onClick={() => handleDeleteImage(index)}
                        aria-label={`Remove ${image.name}`}
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                      <span className="image-size">
                        {formatFileSize(image.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
            >
              {isEdit ? 'Save Changes' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
