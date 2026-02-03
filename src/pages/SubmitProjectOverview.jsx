import { useContext, useState, useMemo, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";
import { defaultCriteriaMet, projectCriteria } from "../data/projectCriteria";
import Modal from "../components/Modal/Modal";
import "./SubmitProject.css";

// Step configuration
const steps = [
  { id: 1, label: "personal information" },
  { id: 2, label: "project details" },
  { id: 3, label: "verify identity" },
  { id: 4, label: "review details" },
];

// Build initial state
const buildInitialState = (currentUser) => ({
  identityDocument: "",
  ownerName: currentUser?.name || "",
  ownerEmail: currentUser?.email || "",
  ownerPhone: "",
  title: "",
  description: "",
  category: "community",
  goal: "",
  imageUrl: "",
  galleryUrls: "",
  criteriaMet: { ...defaultCriteriaMet },
});

// Check if step is complete
const isStepComplete = (step, formValues) => {
  switch (step) {
    case 1:
      return (
        formValues.ownerName.trim() &&
        formValues.ownerEmail.trim() &&
        formValues.ownerPhone.trim()
      );
    case 2:
      return (
        formValues.title.trim() &&
        formValues.description.trim() &&
        Number(formValues.goal) > 0 &&
        Object.values(formValues.criteriaMet).every(Boolean)
      );
    case 3:
      return formValues.identityDocument.trim();
    case 4:
      return true; // Review is always accessible after step 3
    default:
      return false;
  }
};

// Step Card Component
function StepCard({ step, isComplete, isActive, onClick }) {
  const stepNumber = step.id;
  const label = step.label;

  return (
    <div
      className={`step-card ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`${label} - ${isComplete ? "Completed" : "Pending"}`}
    >
      <div className="step-card-header">
        <span className="step-number">{stepNumber}</span>
        {isComplete && (
          <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="step-label">{label}</span>
      {isActive && <span className="step-badge">Editing</span>}
    </div>
  );
}

// Personal Information Form
function PersonalInfoForm({ formValues, updateValue, onComplete }) {
  const handleChange = (field, value) => {
    updateValue(field, value);
    // Check if step is complete
    if (
      field === "ownerName" ||
      field === "ownerEmail" ||
      field === "ownerPhone"
    ) {
      const newValues = { ...formValues, [field]: value };
      onComplete(isStepComplete(1, newValues));
    }
  };

  return (
    <div className="form-section">
      <h3>Personal information</h3>
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Full name *</span>
          <input
            type="text"
            value={formValues.ownerName}
            onChange={(e) => handleChange("ownerName", e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label className="form-field">
          <span className="form-label">Email *</span>
          <input
            type="email"
            value={formValues.ownerEmail}
            onChange={(e) => handleChange("ownerEmail", e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </label>
        <label className="form-field">
          <span className="form-label">Phone number *</span>
          <input
            type="tel"
            value={formValues.ownerPhone}
            onChange={(e) => handleChange("ownerPhone", e.target.value)}
            placeholder="+254 700 123 456"
            required
          />
        </label>
      </div>
    </div>
  );
}

// Project Details Form
function ProjectDetailsForm({ formValues, updateValue, toggleCriteria, onComplete }) {
  const handleChange = (field, value) => {
    updateValue(field, value);
    // Check if step is complete
    if (field === "title" || field === "description" || field === "goal") {
      const newValues = { ...formValues, [field]: value };
      onComplete(isStepComplete(2, newValues));
    }
  };

  return (
    <div className="form-section">
      <h3>Project details</h3>
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Project title *</span>
          <input
            type="text"
            value={formValues.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Neighborhood Learning Lab"
            required
          />
        </label>
        <label className="form-field">
          <span className="form-label">Category</span>
          <select
            value={formValues.category}
            onChange={(e) => updateValue("category", e.target.value)}
          >
            <option value="community">Community</option>
            <option value="education">Education</option>
            <option value="health">Health & Medical</option>
            <option value="environment">Environment</option>
            <option value="technology">Technology</option>
            <option value="arts">Arts & Culture</option>
            <option value="sports">Sports & Recreation</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="form-field">
          <span className="form-label">Funding goal (KSh) *</span>
          <input
            type="number"
            value={formValues.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
            placeholder="12000"
            min="0"
            required
          />
        </label>
        <label className="form-field form-field-wide">
          <span className="form-label">Description *</span>
          <textarea
            value={formValues.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows="4"
            placeholder="Explain the impact, audience, and budget details."
            required
          />
        </label>
        <label className="form-field">
          <span className="form-label">Cover image URL</span>
          <input
            type="url"
            value={formValues.imageUrl}
            onChange={(e) => updateValue("imageUrl", e.target.value)}
            placeholder="https://images.example.com/cover.jpg"
          />
        </label>
      </div>

      <div className="criteria-section">
        <h4>Criteria checklist</h4>
        <div className="criteria-grid">
          {projectCriteria.map((criteria) => (
            <label key={criteria.key} className="criteria-item">
              <input
                type="checkbox"
                checked={Boolean(formValues.criteriaMet[criteria.key])}
                onChange={() => {
                  toggleCriteria(criteria.key);
                }}
              />
              <span>{criteria.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Identity Verification Form
function IdentityVerificationForm({ formValues, updateValue, onComplete, onBack }) {
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "documentType":
        if (!value) error = "Document type is required";
        break;
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = "Name can only contain letters and spaces";
        break;
      case "documentNumber":
        if (!value.trim()) error = "Document number is required";
        else if (value.trim().length < 6) error = "Document number must be at least 6 characters";
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = "Document number can only contain letters and numbers";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (field, value) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    updateValue(field, value);

    // Check if step is complete
    const newValues = { ...formValues, [field]: value };
    const allComplete = validateStep(newValues, uploadedFiles);
    onComplete(allComplete);
  };

  const validateStep = (values, files) => {
    return (
      values.documentType &&
      values.fullName?.trim() &&
      values.documentNumber?.trim() &&
      files.length > 0
    );
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      if (!allowedTypes.includes(file.type)) {
        showToast("Invalid file type. Only JPEG, PNG, and PDF are allowed.", "error");
        return false;
      }
      if (file.size > maxSize) {
        showToast("File size exceeds 5MB limit.", "error");
        return false;
      }
      return true;
    });

    const newFiles = [...uploadedFiles, ...validFiles];
    setUploadedFiles(newFiles);

    // Store files in form values
    updateValue("identityFiles", newFiles);

    // Check if step is complete
    const allComplete = validateStep(formValues, newFiles);
    onComplete(allComplete);
  };

  const handleRemoveFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateValue("identityFiles", newFiles);

    // Check if step is complete
    const allComplete = validateStep(formValues, newFiles);
    onComplete(allComplete);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect({ target: { files } });
  };

  const handleSubmit = async () => {
    const newErrors = {
      documentType: validateField("documentType", formValues.documentType),
      fullName: validateField("fullName", formValues.fullName),
      documentNumber: validateField("documentNumber", formValues.documentNumber),
    };
    setErrors(newErrors);

    if (uploadedFiles.length === 0) {
      showToast("Please upload at least one document image.", "error");
      return;
    }

    if (newErrors.documentType || newErrors.fullName || newErrors.documentNumber) {
      return;
    }

    setIsSubmitting(true);

    // Simulate file upload
    try {
      // In production, upload files to server here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateValue("identityDocument", formValues.documentNumber);
      showToast("Identity document uploaded successfully.", "success");
      onComplete(true);
    } catch (error) {
      showToast("Failed to upload documents. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="form-section identity-verification-form">
      <h3>identity verification</h3>

      <div className="step-indicator">3</div>

      <div className="form-grid">
        {/* Document Type */}
        <label className="form-field">
          <span className="form-label">document file *</span>
          <select
            value={formValues.documentType || ""}
            onChange={(e) => handleChange("documentType", e.target.value)}
            className={errors.documentType ? "error" : ""}
            aria-label="Select document type"
          >
            <option value="">Select document type</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="drivers_licence">Driver's Licence</option>
          </select>
          {errors.documentType && <span className="error-message">{errors.documentType}</span>}
        </label>

        {/* Full Name */}
        <label className="form-field">
          <span className="form-label">name *</span>
          <input
            type="text"
            value={formValues.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Full name on document"
            className={errors.fullName ? "error" : ""}
            aria-label="Full name on document"
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </label>

        {/* Document Number */}
        <label className="form-field">
          <span className="form-label">document no *</span>
          <input
            type="text"
            value={formValues.documentNumber || ""}
            onChange={(e) => handleChange("documentNumber", e.target.value)}
            placeholder="Enter document number"
            className={errors.documentNumber ? "error" : ""}
            aria-label="Document number"
          />
          {errors.documentNumber && <span className="error-message">{errors.documentNumber}</span>}
        </label>

        {/* File Upload */}
        <div className="form-field file-upload-field">
          <span className="form-label">scan/upload document images *</span>
          <div
            className={`file-upload-area ${uploadedFiles.length > 0 ? "has-files" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            aria-label="Click or drag files to upload"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={handleFileSelect}
              className="file-input"
              aria-hidden="true"
            />
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="upload-text">Drag files here or click to browse</span>
          </div>
          {uploadedFiles.length === 0 && <span className="error-message">Please upload at least one document image</span>}
        </div>
      </div>

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="file-previews">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="file-preview">
              {getFilePreview(file) ? (
                <img src={getFilePreview(file)} alt={file.name} className="file-thumbnail" />
              ) : (
                <div className="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              )}
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                className="file-delete"
                onClick={() => handleRemoveFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button className="btn-back" onClick={onBack} disabled={isSubmitting}>
          BACK
        </button>
        <button
          className={`btn-submit ${isSubmitting ? "submitting" : ""}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "UPLOADING..." : "SUBMIT"}
        </button>
      </div>
    </div>
  );
}

// Review Form
function ReviewForm({ formValues }) {
  const formatCurrency = (amount) => {
    if (!amount) return "Ksh 0";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="form-section">
      <h3>Review your submission</h3>
      <p className="form-hint">Confirm everything looks correct before submitting for review.</p>

      <div className="review-grid">
        <div className="review-item">
          <span className="review-label">Owner name</span>
          <span className="review-value">{formValues.ownerName}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Owner email</span>
          <span className="review-value">{formValues.ownerEmail}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Owner phone</span>
          <span className="review-value">{formValues.ownerPhone}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Project title</span>
          <span className="review-value">{formValues.title}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Funding goal</span>
          <span className="review-value">{formatCurrency(formValues.goal)}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Identity document</span>
          <span className="review-value">{formValues.identityDocument || "Not provided"}</span>
        </div>
        <div className="review-block">
          <span className="review-label">Description</span>
          <span className="review-value">{formValues.description}</span>
        </div>
        <div className="review-block">
          <span className="review-label">Criteria checklist</span>
          <ul className="criteria-list">
            {projectCriteria.map((criteria) => (
              <li key={criteria.key}>
                {formValues.criteriaMet[criteria.key] ? "✓" : "○"} {criteria.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function SubmitProjectOverview() {
  const { currentUser } = useAuth();
  const { addProject } = useProjects();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState(() =>
    buildInitialState(currentUser)
  );

  // Check if all steps are complete
  const allStepsComplete = useMemo(() => {
    return [1, 2, 3].every((step) => completedSteps[step]);
  }, [completedSteps]);

  if (!currentUser) {
    return <Navigate to="/signup" replace />;
  }

  if (currentUser.isAdmin) {
    return <Navigate to="/add" replace />;
  }

  const updateValue = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCriteria = (key) => {
    setFormValues((prev) => ({
      ...prev,
      criteriaMet: {
        ...prev.criteriaMet,
        [key]: !prev.criteriaMet[key],
      },
    }));
  };

  const handleStepComplete = (step, isComplete) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [step]: isComplete,
    }));
  };

  const handleCardClick = (step) => {
    // Can only open step 4 if step 3 is complete
    if (step === 4 && !completedSteps[3]) {
      showToast("Please complete step 3 first.", "warning");
      return;
    }
    setActiveStep(step);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmit = () => {
    if (!allStepsComplete) {
      showToast("Please complete all steps before submitting.", "warning");
      return;
    }

    const createdBy = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    };

    addProject({
      title: formValues.title,
      description: formValues.description,
      category: formValues.category,
      goal: formValues.goal,
      imageUrl: formValues.imageUrl,
      galleryUrls: formValues.galleryUrls,
      createdAt: new Date().toISOString(),
      createdBy,
      ownerId: currentUser.id,
      ownerName: formValues.ownerName,
      ownerEmail: formValues.ownerEmail,
      ownerPhone: formValues.ownerPhone,
      identityDocument: formValues.identityDocument,
      verificationStatus: "submitted",
      verificationNotes: "",
      criteriaMet: formValues.criteriaMet,
      fundUsage: [],
      status: "review",
    });

    showToast("Project submitted for verification.", "success");
    setFormValues(buildInitialState(currentUser));
    setCompletedSteps({});
    setActiveStep(1);
    navigate("/user-dashboard");
  };

  const renderStepForm = () => {
    switch (activeStep) {
      case 1:
        return (
          <PersonalInfoForm
            formValues={formValues}
            updateValue={updateValue}
            onComplete={(complete) => handleStepComplete(1, complete)}
          />
        );
      case 2:
        return (
          <ProjectDetailsForm
            formValues={formValues}
            updateValue={updateValue}
            toggleCriteria={toggleCriteria}
            onComplete={(complete) => handleStepComplete(2, complete)}
          />
        );
      case 3:
        return (
          <IdentityVerificationForm
            formValues={formValues}
            updateValue={updateValue}
            onComplete={(complete) => handleStepComplete(3, complete)}
            onBack={() => {
              setActiveStep(2);
            }}
          />
        );
      case 4:
        return <ReviewForm formValues={formValues} />;
      default:
        return null;
    }
  };

  return (
    <div className="page submit-project-page">
      <section className="page-header">
        <h1>vetting form</h1>
        <p>complete vetting form for team to review your project request</p>
      </section>

      {/* 2x2 Grid of Step Cards */}
      <div className="steps-grid">
        <StepCard
          step={steps[0]}
          isComplete={completedSteps[1]}
          isActive={activeStep === 1}
          onClick={() => handleCardClick(1)}
        />
        <StepCard
          step={steps[1]}
          isComplete={completedSteps[2]}
          isActive={activeStep === 2}
          onClick={() => handleCardClick(2)}
        />
        <StepCard
          step={steps[2]}
          isComplete={completedSteps[3]}
          isActive={activeStep === 3}
          onClick={() => handleCardClick(3)}
        />
        <StepCard
          step={steps[3]}
          isComplete={allStepsComplete}
          isActive={activeStep === 4}
          onClick={() => handleCardClick(4)}
        />
      </div>

      {/* Submit Button */}
      <div className="submit-container">
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!allStepsComplete}
        >
          submit
        </button>
      </div>

      {/* Step Form Modal */}
      <Modal isOpen={showModal} onClose={handleModalClose}>
        <div className="step-modal-content">
          {renderStepForm()}
          {activeStep !== 3 && (
            <div className="step-modal-actions">
              <button className="btn-cancel" onClick={handleModalClose}>
                cancel
              </button>
              <button
                className="btn-continue"
                onClick={() => {
                  if (activeStep < 4) {
                    setActiveStep((prev) => prev + 1);
                  } else {
                    handleModalClose();
                  }
                }}
              >
                {activeStep < 4 ? "continue" : "done"}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
