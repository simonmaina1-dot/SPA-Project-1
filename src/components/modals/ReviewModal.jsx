import { useState, useMemo, useEffect } from 'react';

// Icons
function XMarkIcon({ className, onClick }) {
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

function PencilIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

const ReviewModal = ({
  isOpen,
  onClose,
  formValues,
  onEdit,
  onSubmit,
  isSubmitting = false
}) => {
  const [missingFields, setMissingFields] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize with empty object if formValues is undefined
  const formData = formValues || {};

  // Validate form and determine missing fields
  const validationResult = useMemo(() => {
    const missing = [];

    // Personal Information
    if (!formData?.ownerName?.trim()) {
      missing.push('Full Name (Personal Information)');
    }
    if (!formData?.ownerEmail?.trim()) {
      missing.push('Email (Personal Information)');
    }
    if (!formData?.ownerPhone?.trim()) {
      missing.push('Phone Number (Personal Information)');
    }

    // Project Details
    if (!formData?.title?.trim()) {
      missing.push('Project Title');
    }
    if (!formData?.category) {
      missing.push('Category');
    }
    if (!formData?.goal || Number(formData?.goal) <= 0) {
      missing.push('Target Amount');
    }
    if (!formData?.description?.trim()) {
      missing.push('Description');
    }

    // Identity Verification
    if (!formData?.documentType) {
      missing.push('Document Type (Identity Verification)');
    }
    if (!formData?.fullName?.trim()) {
      missing.push('Name on Document (Identity Verification)');
    }
    if (!formData?.documentNumber?.trim()) {
      missing.push('Document Number (Identity Verification)');
    }
    if (!formData?.identityFiles || formData?.identityFiles?.length === 0) {
      missing.push('Document Images (at least 1 file)');
    }

    return missing;
  }, [formData]);

  const isFormComplete = validationResult.length === 0;

  useEffect(() => {
    setMissingFields(validationResult);
  }, [validationResult]);

  const handleFinalSubmit = () => {
    if (!isFormComplete) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!isFormComplete || isSubmitting) return;
    onSubmit();
    setShowConfirmModal(false);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Ksh 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div
        className="review-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X Close Icon */}
        <button
          className="review-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="review-modal-header">
          <h2 className="review-modal-title">Review Details</h2>
          <p className="review-modal-subtitle">
            Please review all information before submitting your project
          </p>
        </div>

        {/* Review Content */}
        <div className="review-modal-content">
          {/* Section 1: Personal Information */}
          <div className="review-section">
            <div className="review-section-header">
              <div className="review-section-title-row">
                <div className="review-section-number">
                  <span>1</span>
                </div>
                <h3 className="review-section-title">Personal Information</h3>
              </div>
              <button
                className="review-edit-btn"
                onClick={() => onEdit(1)}
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="review-section-grid">
              <div className="review-field">
                <label className="review-field-label">Full Name</label>
                <p className="review-field-value">
                  {formData.ownerName || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
              <div className="review-field">
                <label className="review-field-label">Email</label>
                <p className="review-field-value">
                  {formData.ownerEmail || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
              <div className="review-field">
                <label className="review-field-label">Phone Number</label>
                <p className="review-field-value">
                  {formData.ownerPhone || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Project Details */}
          <div className="review-section">
            <div className="review-section-header">
              <div className="review-section-title-row">
                <div className="review-section-number">
                  <span>2</span>
                </div>
                <h3 className="review-section-title">Project Details</h3>
              </div>
              <button
                className="review-edit-btn"
                onClick={() => onEdit(2)}
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="review-section-content">
              <div className="review-field">
                <label className="review-field-label">Project Title</label>
                <p className="review-field-value review-field-title">
                  {formData.title || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>

              <div className="review-section-grid">
                <div className="review-field">
                  <label className="review-field-label">Category</label>
                  <p className="review-field-value">
                    {formData.category || <span className="review-field-missing">Not provided</span>}
                  </p>
                </div>
                <div className="review-field">
                  <label className="review-field-label">Target Amount</label>
                  <p className="review-field-value">
                    {formData.goal ? formatCurrency(formData.goal) : <span className="review-field-missing">Not provided</span>}
                  </p>
                </div>
              </div>

              <div className="review-field">
                <label className="review-field-label">Description</label>
                <p className="review-field-value review-field-description">
                  {formData.description || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>

              {/* Project Images */}
              {formData.images && formData.images.length > 0 && (
                <div className="review-images-section">
                  <label className="review-field-label">Project Images ({formData.images.length})</label>
                  <div className="review-images-grid">
                    {formData.images.map((image, index) => (
                      <div key={index} className="review-image-preview">
                        <img
                          src={image.preview}
                          alt={`Project ${index + 1}`}
                        />
                        <span className="review-image-size">{formatFileSize(image.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="review-field">
                <label className="review-field-label">Website URL</label>
                <p className="review-field-value">
                  {formData.webUrl || <span className="review-field-optional">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Identity Verification */}
          <div className="review-section">
            <div className="review-section-header">
              <div className="review-section-title-row">
                <div className="review-section-number">
                  <span>3</span>
                </div>
                <h3 className="review-section-title">Identity Verification</h3>
              </div>
              <button
                className="review-edit-btn"
                onClick={() => onEdit(3)}
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="review-section-grid">
              <div className="review-field">
                <label className="review-field-label">Document Type</label>
                <p className="review-field-value">
                  {formData.documentType || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
              <div className="review-field">
                <label className="review-field-label">Name on Document</label>
                <p className="review-field-value">
                  {formData.fullName || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
              <div className="review-field">
                <label className="review-field-label">Document Number</label>
                <p className="review-field-value">
                  {formData.documentNumber || <span className="review-field-missing">Not provided</span>}
                </p>
              </div>
              <div className="review-field">
                <label className="review-field-label">Document Images</label>
                <p className="review-field-value">
                  {formData.identityFiles && formData.identityFiles.length > 0
                    ? `${formData.identityFiles.length} file(s) uploaded`
                    : <span className="review-field-missing">Not uploaded</span>
                  }
                </p>
              </div>
            </div>

            {/* Document Images Preview */}
            {formData.identityFiles && formData.identityFiles.length > 0 && (
              <div className="review-images-section">
                <label className="review-field-label">Uploaded Documents</label>
                <div className="review-images-grid">
                  {formData.identityFiles.map((file, index) => (
                    <div key={index} className="review-image-preview">
                      <img
                        src={file.preview || URL.createObjectURL(file.file)}
                        alt={`Document ${index + 1}`}
                      />
                      <span className="review-image-size">{formatFileSize(file.size || file.file?.size || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="review-modal-footer">
          {/* Validation Warning */}
          {!isFormComplete && (
            <div className="review-validation-warning">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div>
                <h4 className="review-validation-title">Please complete all required fields</h4>
                <ul className="review-validation-list">
                  {missingFields.slice(0, 3).map((field, index) => (
                    <li key={index}>• {field}</li>
                  ))}
                  {missingFields.length > 3 && (
                    <li>• ...and {missingFields.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="review-footer-content">
            <p className="review-footer-note">
              By submitting, you agree to our terms and conditions
            </p>
            <button
              onClick={handleFinalSubmit}
              disabled={!isFormComplete || isSubmitting}
              className={`review-submit-btn ${isFormComplete ? 'active' : 'disabled'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="review-confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="review-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Submit project for review?</h3>
            <p>
              Are you sure you want to submit your project for review?
              You won&apos;t be able to edit it after submission.
            </p>
            <div className="review-confirm-actions">
              <button
                type="button"
                className="review-confirm-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="review-confirm-submit"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModal;
