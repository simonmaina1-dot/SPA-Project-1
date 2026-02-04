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
        } else if (!/^\+?[\d\s-]{10,}$/.test(value)) {
          error = 'Please enter a valid phone number';
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
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
    setUploadedId(null);
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

    if (hasChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
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
              <div className="upload-area" onClick={() => document.getElementById('id-upload')?.click()}>
                <input
                  id="id-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  aria-hidden="true"
                />
                <div className="upload-content">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="upload-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9v1.5c0 .621-.504 1.125-1.125 1.125H9v6m4.5 0H18.75"
                    />
                  </svg>
                  <p className="upload-text">
                    <span className="upload-highlight">Click to upload</span> your ID
                  </p>
                  <p className="upload-hint">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>

              {uploadedId && (
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
              )}
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
