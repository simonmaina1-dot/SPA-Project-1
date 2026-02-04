import { useState, useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

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

const ID_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'voters_card', label: 'Voter\'s Card' },
];

const IdentityVerificationForm = ({ isOpen, onClose, onSave }) => {
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    idType: '',
    phoneNumber: '',
    email: '',
    address: '',
  });
  const [uploadedId, setUploadedId] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [pendingClose, setPendingClose] = useState(false);

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 3) {
          error = 'Full name must be at least 3 characters';
        }
        break;
      case 'idNumber':
        if (!value || !value.trim()) {
          error = 'ID number is required';
        } else {
          const normalized = value.trim();
          const patterns = {
            national_id: /^[0-9]{7,8}$/,
            passport: /^[A-Za-z0-9]{6,9}$/,
            drivers_license: /^[0-9]{8}$/,
            voters_card: /^[A-Za-z0-9]{6,12}$/
          };
          const messages = {
            national_id: 'National ID must be 7–8 digits',
            passport: 'Passport must be 6–9 letters or numbers',
            drivers_license: "Driver's license must be 8 digits",
            voters_card: 'Voter VIN must be 6–12 letters or numbers'
          };
          const pattern = patterns[formData.idType];
          if (pattern && !pattern.test(normalized)) {
            error = messages[formData.idType] || 'Invalid ID number';
          }
        }
        break;
      case 'idType':
        if (!value) {
          error = 'ID type is required';
        }
        break;
      case 'phoneNumber':
        if (!value || !value.trim()) {
          error = 'Phone number is required';
        } else if (!/^(?:\+254|254|0)(?:7|1)\d{8}$/.test(value.trim())) {
          error = 'Use 07xxxxxxxx, 01xxxxxxxx, 2547xxxxxxxx, or +2547xxxxxxxx';
        }
        break;
      case 'email':
        if (!value || !value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'address':
        if (!value || !value.trim()) {
          error = 'Address is required';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Handle input change
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setPendingClose(false);
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'idType' && errors.idNumber) {
      setErrors((prev) => ({ ...prev, idNumber: '' }));
    }
  };

  // Handle blur
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle ID file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingClose(false);

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showToast('Please upload an image or PDF file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedId({
        file,
        preview: reader.result,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded ID
  const handleRemoveId = () => {
    setPendingClose(false);
    setUploadedId(null);
  };

  const isImageUpload = uploadedId?.file?.type?.startsWith('image/');
  const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Validate entire form
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
      fullName: true,
      idNumber: true,
      idType: true,
      phoneNumber: true,
      email: true,
      address: true,
    });

    return isValid;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const saveData = {
      ...formData,
      idDocument: uploadedId,
      verifiedAt: new Date().toISOString(),
    };

    onSave(saveData);
  };

  // Handle cancel
  const handleCancel = () => {
    const hasChanges = Object.values(formData).some((v) => v) || uploadedId;

    if (hasChanges && !pendingClose) {
      showToast('You have unsaved changes. Tap cancel again to discard.', 'warning');
      setPendingClose(true);
      return;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div
        className="identity-modal-container"
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
          <h2 className="modal-title">Identity Verification</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-content">
            <p className="form-intro">
              Please provide your identification details to verify your identity.
              This information will be kept confidential.
            </p>

            {/* Full Name */}
            <div className="form-field">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                onBlur={handleBlur('fullName')}
                placeholder="Enter your full name as it appears on ID"
                className={`form-input ${
                  touched.fullName && errors.fullName ? 'error' : ''
                }`}
              />
              {touched.fullName && errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>

            {/* ID Type & Number Row */}
            <div className="form-row">
              {/* ID Type */}
              <div className="form-field">
                <label className="form-label">
                  ID Type <span className="required">*</span>
                </label>
                <select
                  value={formData.idType}
                  onChange={handleInputChange('idType')}
                  onBlur={handleBlur('idType')}
                  className={`form-select ${
                    touched.idType && errors.idType ? 'error' : ''
                  }`}
                >
                  <option value="">Select ID type</option>
                  {ID_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {touched.idType && errors.idType && (
                  <span className="error-message">{errors.idType}</span>
                )}
              </div>

              {/* ID Number */}
              <div className="form-field">
                <label className="form-label">
                  ID Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={handleInputChange('idNumber')}
                  onBlur={handleBlur('idNumber')}
                  placeholder="Enter ID number"
                  className={`form-input ${
                    touched.idNumber && errors.idNumber ? 'error' : ''
                  }`}
                />
                {touched.idNumber && errors.idNumber && (
                  <span className="error-message">{errors.idNumber}</span>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-field">
              <label className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                placeholder="+254 700 000 000"
                className={`form-input ${
                  touched.phoneNumber && errors.phoneNumber ? 'error' : ''
                }`}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <span className="error-message">{errors.phoneNumber}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-field">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                onBlur={handleBlur('email')}
                placeholder="your@email.com"
                className={`form-input ${
                  touched.email && errors.email ? 'error' : ''
                }`}
              />
              {touched.email && errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-field">
              <label className="form-label">
                Physical Address <span className="required">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={handleInputChange('address')}
                onBlur={handleBlur('address')}
                placeholder="Enter your full physical address"
                rows={3}
                className={`form-textarea ${
                  touched.address && errors.address ? 'error' : ''
                }`}
              />
              {touched.address && errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>

            {/* ID Document Upload */}
            <div className="form-field">
              <label className="form-label">
                Upload ID Document <span className="optional">(Optional)</span>
              </label>
              <div className="upload-area">
                <input
                  id="id-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  aria-hidden="true"
                />
                <div className="upload-content">
                  <PhotoIcon className="upload-icon" />
                  <p className="upload-text">
                    <span className="upload-highlight">Click to upload</span> your ID
                  </p>
                  <p className="upload-hint">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>

              {uploadedId && isImageUpload ? (
                <div className="uploaded-file uploaded-file--image">
                  <img
                    src={uploadedId.preview}
                    alt={uploadedId.name}
                    className="uploaded-file-thumb"
                  />
                  <div className="file-details">
                    <span className="file-name">{uploadedId.name}</span>
                    <span className="file-size">{formatFileSize(uploadedId.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={handleRemoveId}
                    aria-label="Remove uploaded ID"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : uploadedId ? (
                <div className="uploaded-file">
                  <div className="file-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="file-name">{uploadedId.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={handleRemoveId}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              cancel
            </button>
            <button type="submit" className="btn-save">
              submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdentityVerificationForm;
