import { useState, useEffect } from 'react';
import './ProjectDetailsModal.css';

const CATEGORIES = [
  { value: 'community', label: 'Community' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'environment', label: 'Environment' },
  { value: 'technology', label: 'Technology' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'other', label: 'Other' },
];

const ProjectDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'community',
    targetAmount: '',
    description: '',
    webUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with existing data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'community',
        targetAmount: initialData.targetAmount || initialData.goal || '',
        description: initialData.description || '',
        webUrl: initialData.webUrl || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Project title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        return '';
      case 'category':
        if (!value) return 'Please select a category';
        return '';
      case 'targetAmount':
        if (!value) return 'Target amount is required';
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) return 'Please enter a valid amount';
        if (amount < 100) return 'Minimum target amount is KSh 100';
        if (amount > 10000000) return 'Maximum target amount is KSh 10,000,000';
        return '';
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 20) return 'Description must be at least 20 characters';
        if (value.trim().length > 2000) return 'Description must be less than 2000 characters';
        return '';
      case 'webUrl':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return 'Please enter a valid URL (starting with http:// or https://)';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

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
      title: true,
      category: true,
      targetAmount: true,
      description: true,
      webUrl: true,
    });

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const savedData = {
        title: formData.title.trim(),
        category: formData.category,
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description.trim(),
        webUrl: formData.webUrl.trim() || undefined,
      };
      onSave(savedData);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  const getInputClassName = (fieldName) => {
    const baseClass = 'ios-input';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} error`;
    }
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClass} success`;
    }
    return baseClass;
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="project-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Teal Gradient Header */}
        <div className="modal-teal-header">
          <h2>PROJECT DETAILS</h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="project-details-form">
          {/* First Row - Project Title + Category */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="title">project title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter project title"
                className={getInputClassName('title')}
                autoComplete="off"
              />
              {touched.title && errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="category">category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`ios-select ${touched.category && errors.category ? 'error' : ''}`}
              >
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
                onBlur={handleBlur}
                placeholder="50000"
                min="100"
                max="10000000"
                className={getInputClassName('targetAmount')}
                autoComplete="off"
              />
              {touched.targetAmount && errors.targetAmount && (
                <span className="error-message">{errors.targetAmount}</span>
              )}
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
              onBlur={handleBlur}
              placeholder="Describe the project and its impact on the community..."
              rows="6"
              className={`ios-textarea ${touched.description && errors.description ? 'error' : ''}`}
            />
            {touched.description && errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
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
              onBlur={handleBlur}
              placeholder="https://project-website.com (optional)"
              className={getInputClassName('webUrl')}
              autoComplete="off"
            />
            {touched.webUrl && errors.webUrl && (
              <span className="error-message">{errors.webUrl}</span>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="form-footer">
            <button
              type="button"
              className="ios-btn-secondary"
              onClick={handleCancel}
            >
              cancel
            </button>
            <button type="submit" className="ios-btn-primary">
              {isEdit ? 'update details' : 'save & continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
