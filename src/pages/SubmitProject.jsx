import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../context/ToastContext";
import useProjects from "../hooks/useProjects";
import Modal from "../components/Modal";

const steps = [
  { id: 1, title: "Identity Verification", description: "Verify your identity with a government-issued ID" },
  { id: 2, title: "Personal Information", description: "Tell us about yourself" },
  { id: 3, title: "Project Details", description: "Describe your project and its goals" },
  { id: 4, title: "Criteria Checklist", description: "Confirm your project meets our standards" },
  { id: 5, title: "Review & Submit", description: "Review your application before submitting" },
];

const criteriaItems = [
  {
    id: "feasibility",
    title: "Project Feasibility",
    description: "The project has a clear, achievable plan with realistic timeline and resources.",
  },
  {
    id: "communityImpact",
    title: "Community Impact",
    description: "The project will directly benefit the local community in a meaningful way.",
  },
  {
    id: "budgetClarity",
    title: "Budget Clarity",
    description: "The project budget is detailed, transparent, and justifies all expenses.",
  },
  {
    id: "sustainability",
    title: "Sustainability Plan",
    description: "The project has a plan for continued operation after initial funding.",
  },
  {
    id: "legalCompliance",
    title: "Legal Compliance",
    description: "The project complies with all local laws, regulations, and permits required.",
  },
];

const initialFormData = {
  // Identity Verification
  identityDocumentType: "national_id",
  identityDocumentUrl: "",
  documentNumber: "",
  
  // Personal Information
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  
  // Project Details
  title: "",
  description: "",
  category: "community",
  goal: "",
  imageUrl: "",
  galleryUrls: "",
  
  // Criteria Agreement
  criteriaAgreement: {
    feasibility: false,
    communityImpact: false,
    budgetClarity: false,
    sustainability: false,
    legalCompliance: false,
  },
};

export default function SubmitProject() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { addProject } = useProjects();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 1: // Identity Verification
        if (!formData.documentNumber.trim()) {
          newErrors.documentNumber = "Document number is required";
          isValid = false;
        }
        if (formData.identityDocumentType !== "other" && !formData.identityDocumentUrl) {
          newErrors.identityDocumentUrl = "Document image is required";
          isValid = false;
        }
        break;

      case 2: // Personal Information
        if (!formData.ownerName.trim()) {
          newErrors.ownerName = "Full name is required";
          isValid = false;
        }
        if (!formData.ownerEmail.trim()) {
          newErrors.ownerEmail = "Email is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          newErrors.ownerEmail = "Please enter a valid email address";
          isValid = false;
        }
        if (!formData.ownerPhone.trim()) {
          newErrors.ownerPhone = "Phone number is required";
          isValid = false;
        }
        break;

      case 3: // Project Details
        if (!formData.title.trim()) {
          newErrors.title = "Project title is required";
          isValid = false;
        } else if (formData.title.trim().length < 5) {
          newErrors.title = "Title must be at least 5 characters";
          isValid = false;
        }
        if (!formData.description.trim()) {
          newErrors.description = "Project description is required";
          isValid = false;
        } else if (formData.description.trim().length < 50) {
          newErrors.description = "Description must be at least 50 characters";
          isValid = false;
        }
        if (!formData.goal || Number(formData.goal) < 100) {
          newErrors.goal = "Goal must be at least KSh 100";
          isValid = false;
        }
        break;

      case 4: // Criteria Checklist
        const allCriteriaMet = Object.values(formData.criteriaAgreement).every(
          (val) => val
        );
        if (!allCriteriaMet) {
          newErrors.criteria = "You must agree to all criteria to proceed";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      showToast("Please fill in all required fields correctly.", "warning");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCriteriaChange = (criteriaId, value) => {
    setFormData((prev) => ({
      ...prev,
      criteriaAgreement: {
        ...prev.criteriaAgreement,
        [criteriaId]: value,
      },
    }));
    if (errors.criteria) {
      setErrors((prev) => ({ ...prev, criteria: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      showToast("Please ensure all fields are filled correctly.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the project
      const projectId = addProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        goal: Number(formData.goal),
        imageUrl: formData.imageUrl.trim(),
        galleryUrls: formData.galleryUrls,
        // Owner information
        ownerId: `user-${Date.now()}`,
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        // Verification fields
        verificationStatus: "pending",
        identityDocument: formData.identityDocumentUrl,
        verificationNotes: "",
        criteriaMet: {
          feasibility: formData.criteriaAgreement.feasibility,
          communityImpact: formData.criteriaAgreement.communityImpact,
          budgetClarity: formData.criteriaAgreement.budgetClarity,
          sustainability: formData.criteriaAgreement.sustainability,
          legalCompliance: formData.criteriaAgreement.legalCompliance,
        },
        fundUsage: {
          totalReceived: 0,
          totalSpent: 0,
          expenses: [],
        },
      });

      showToast(
        "Project submitted successfully! Your verification is now pending review.",
        "success"
      );

      // Reset form and navigate
      setFormData(initialFormData);
      setCurrentStep(1);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to submit project:", error);
      showToast("Failed to submit project. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return formData.documentNumber.trim() && formData.identityDocumentUrl;
      case 2:
        return (
          formData.ownerName.trim() &&
          formData.ownerEmail.trim() &&
          formData.ownerPhone.trim()
        );
      case 3:
        return (
          formData.title.trim() &&
          formData.description.trim() &&
          formData.goal
        );
      case 4:
        return Object.values(formData.criteriaAgreement).every((val) => val);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <div className="page submit-project-page">
      <div className="submit-project-container">
        {/* Header */}
        <div className="submit-header">
          <h1>Submit a Project for Verification</h1>
          <p>
            To ensure platform integrity, all projects require identity verification
            and must meet our community standards before going live.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="submit-progress-container">
          <div className="submit-progress-bar">
            <div
              className="submit-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="submit-progress-text">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="submit-step-indicator">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`submit-step ${
                currentStep === step.id
                  ? "active"
                  : currentStep > step.id
                  ? "completed"
                  : ""
              }`}
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
            >
              <div className="submit-step-number">
                {currentStep > step.id ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="submit-step-title">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="submit-form-content">
          {/* Step 1: Identity Verification */}
          {currentStep === 1 && (
            <div className="submit-form-section">
              <h2>Identity Verification</h2>
              <p className="submit-section-description">
                Please provide a valid government-issued identification document.
                This helps us maintain trust and safety on our platform.
              </p>

              <div className="submit-form-grid">
                <label className="submit-form-field">
                  <span className="submit-form-label">ID Document Type *</span>
                  <select
                    value={formData.identityDocumentType}
                    onChange={(e) =>
                      handleChange("identityDocumentType", e.target.value)
                    }
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="other">Other Official Document</option>
                  </select>
                </label>

                <label className="submit-form-field">
                  <span className="submit-form-label">Document Number *</span>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) =>
                      handleChange("documentNumber", e.target.value)
                    }
                    placeholder={
                      formData.identityDocumentType === "passport"
                        ? "Enter passport number"
                        : "Enter ID number"
                    }
                  />
                  {errors.documentNumber && (
                    <span className="submit-form-error">
                      {errors.documentNumber}
                    </span>
                  )}
                </label>

                <label className="submit-form-field submit-form-field-wide">
                  <span className="submit-form-label">
                    Upload Document Image *
                    <span className="submit-form-hint">
                      (Clear photo of front side, max 5MB)
                    </span>
                  </span>
                  <div className="submit-file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // In a real app, this would upload to a server
                          // For demo, we create a local URL
                          const url = URL.createObjectURL(file);
                          handleChange("identityDocumentUrl", url);
                        }
                      }}
                      id="id-document-upload"
                    />
                    <label
                      htmlFor="id-document-upload"
                      className="submit-file-upload-label"
                    >
                      {formData.identityDocumentUrl ? (
                        <div className="submit-file-preview">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M9 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          <span>Document uploaded successfully</span>
                        </div>
                      ) : (
                        <>
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Click to upload or drag and drop</span>
                          <small>PNG, JPG up to 5MB</small>
                        </>
                      )}
                    </label>
                  </div>
                  {errors.identityDocumentUrl && (
                    <span className="submit-form-error">
                      {errors.identityDocumentUrl}
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="submit-form-section">
              <h2>Personal Information</h2>
              <p className="submit-section-description">
                This information will be used for verification purposes and to
                contact you about your project.
              </p>

              <div className="submit-form-grid">
                <label className="submit-form-field">
                  <span className="submit-form-label">Full Name *</span>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    placeholder="Enter your full legal name"
                  />
                  {errors.ownerName && (
                    <span className="submit-form-error">{errors.ownerName}</span>
                  )}
                </label>

                <label className="submit-form-field">
                  <span className="submit-form-label">Email Address *</span>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleChange("ownerEmail", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  {errors.ownerEmail && (
                    <span className="submit-form-error">{errors.ownerEmail}</span>
                  )}
                </label>

                <label className="submit-form-field">
                  <span className="submit-form-label">Phone Number *</span>
                  <input
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => handleChange("ownerPhone", e.target.value)}
                    placeholder="+254 700 000 000"
                  />
                  {errors.ownerPhone && (
                    <span className="submit-form-error">{errors.ownerPhone}</span>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Project Details */}
          {currentStep === 3 && (
            <div className="submit-form-section">
              <h2>Project Details</h2>
              <p className="submit-section-description">
                Tell us about the project you want to create. Be thorough - this
                information will be shown to potential donors.
              </p>

              <div className="submit-form-grid">
                <label className="submit-form-field submit-form-field-wide">
                  <span className="submit-form-label">Project Title *</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Give your project a clear, descriptive title"
                  />
                  {errors.title && (
                    <span className="submit-form-error">{errors.title}</span>
                  )}
                </label>

                <label className="submit-form-field submit-form-field-wide">
                  <span className="submit-form-label">Description *</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows="5"
                    placeholder="Describe your project in detail. What problem are you solving? How will you use the funds? What impact will this have on the community?"
                  />
                  <span className="submit-form-hint">
                    Minimum 50 characters. Be specific and compelling.
                  </span>
                  {errors.description && (
                    <span className="submit-form-error">
                      {errors.description}
                    </span>
                  )}
                </label>

                <label className="submit-form-field">
                  <span className="submit-form-label">Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
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

                <label className="submit-form-field">
                  <span className="submit-form-label">Funding Goal (KSh) *</span>
                  <input
                    type="number"
                    value={formData.goal}
                    onChange={(e) => handleChange("goal", e.target.value)}
                    min="100"
                    placeholder="10000"
                  />
                  {errors.goal && (
                    <span className="submit-form-error">{errors.goal}</span>
                  )}
                </label>

                <label className="submit-form-field submit-form-field-wide">
                  <span className="submit-form-label">Cover Image URL</span>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                    placeholder="https://images.example.com/your-project.jpg"
                  />
                </label>

                <label className="submit-form-field submit-form-field-wide">
                  <span className="submit-form-label">Gallery Images (comma-separated URLs)</span>
                  <input
                    type="text"
                    value={formData.galleryUrls}
                    onChange={(e) => handleChange("galleryUrls", e.target.value)}
                    placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Criteria Checklist */}
          {currentStep === 4 && (
            <div className="submit-form-section">
              <h2>Criteria Checklist</h2>
              <p className="submit-section-description">
                To be approved, your project must meet all of the following
                standards. Please review each criterion carefully.
              </p>

              <div className="submit-criteria-list">
                {criteriaItems.map((item) => (
                  <div key={item.id} className="submit-criteria-item">
                    <div className="submit-criteria-header">
                      <h3>{item.title}</h3>
                      <label className="submit-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.criteriaAgreement[item.id]}
                          onChange={(e) =>
                            handleCriteriaChange(item.id, e.target.checked)
                          }
                        />
                        <span className="submit-checkbox-custom"></span>
                        <span className="submit-checkbox-text">I agree</span>
                      </label>
                    </div>
                    <p className="submit-criteria-description">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {errors.criteria && (
                <div className="submit-form-error-message">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.criteria}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="submit-form-section">
              <h2>Review & Submit</h2>
              <p className="submit-section-description">
                Please review all your information before submitting. You won't be
                able to edit this after submission.
              </p>

              <div className="submit-review">
                <div className="submit-review-section">
                  <h3>Identity Information</h3>
                  <div className="submit-review-grid">
                    <div className="submit-review-item">
                      <span className="submit-review-label">Document Type</span>
                      <span className="submit-review-value">
                        {formData.identityDocumentType === "national_id"
                          ? "National ID"
                          : formData.identityDocumentType === "passport"
                          ? "Passport"
                          : formData.identityDocumentType === "drivers_license"
                          ? "Driver's License"
                          : "Other"}
                      </span>
                    </div>
                    <div className="submit-review-item">
                      <span className="submit-review-label">Document Number</span>
                      <span className="submit-review-value">
                        {formData.documentNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="submit-review-section">
                  <h3>Personal Information</h3>
                  <div className="submit-review-grid">
                    <div className="submit-review-item">
                      <span className="submit-review-label">Full Name</span>
                      <span className="submit-review-value">
                        {formData.ownerName}
                      </span>
                    </div>
                    <div className="submit-review-item">
                      <span className="submit-review-label">Email</span>
                      <span className="submit-review-value">
                        {formData.ownerEmail}
                      </span>
                    </div>
                    <div className="submit-review-item">
                      <span className="submit-review-label">Phone</span>
                      <span className="submit-review-value">
                        {formData.ownerPhone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="submit-review-section">
                  <h3>Project Details</h3>
                  <div className="submit-review-grid">
                    <div className="submit-review-item submit-review-item-wide">
                      <span className="submit-review-label">Title</span>
                      <span className="submit-review-value">
                        {formData.title}
                      </span>
                    </div>
                    <div className="submit-review-item submit-review-item-wide">
                      <span className="submit-review-label">Description</span>
                      <span className="submit-review-value">
                        {formData.description}
                      </span>
                    </div>
                    <div className="submit-review-item">
                      <span className="submit-review-label">Category</span>
                      <span className="submit-review-value">
                        {formData.category.charAt(0).toUpperCase() +
                          formData.category.slice(1)}
                      </span>
                    </div>
                    <div className="submit-review-item">
                      <span className="submit-review-label">Funding Goal</span>
                      <span className="submit-review-value">
                        KSh {Number(formData.goal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="submit-review-section">
                  <h3>Criteria Agreement</h3>
                  <div className="submit-review-criteria">
                    {criteriaItems.map((item) => (
                      <div
                        key={item.id}
                        className={`submit-review-criteria-item ${
                          formData.criteriaAgreement[item.id] ? "agreed" : ""
                        }`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {formData.criteriaAgreement[item.id] ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </>
                          )}
                        </svg>
                        <span>{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="submit-terms">
                <label className="submit-checkbox-label">
                  <input type="checkbox" required />
                  <span className="submit-checkbox-custom"></span>
                  <span className="submit-checkbox-text">
                    I confirm that all information provided is accurate and I
                    agree to the platform's terms of service.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="submit-form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Continue
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="submit-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Submit for Verification
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

