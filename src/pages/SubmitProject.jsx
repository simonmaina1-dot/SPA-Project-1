import { useContext, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";
import { defaultCriteriaMet, projectCriteria } from "../data/projectCriteria";
import styles from "./SubmitProject.module.css";

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

const stepLabels = [
  "Personal information",
  "Project details",
  "Identity verification",
  "Review and submit",
];

export default function SubmitProject() {
  const { currentUser } = useAuth();
  const { addProject } = useProjects();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState(() =>
    buildInitialState(currentUser)
  );

  const steps = useMemo(
    () => stepLabels.map((label, index) => ({ label, index: index + 1 })),
    []
  );

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

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formValues.ownerName.trim()) {
        showToast("Please enter your full name.", "warning");
        return false;
      }
      if (!formValues.ownerEmail.trim()) {
        showToast("Please enter a valid email address.", "warning");
        return false;
      }
      if (!formValues.ownerPhone.trim()) {
        showToast("Please enter a phone number.", "warning");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formValues.title.trim() || !formValues.description.trim()) {
        showToast("Please enter a project title and description.", "warning");
        return false;
      }
      if (!formValues.goal || Number(formValues.goal) <= 0) {
        showToast("Please enter a valid funding goal.", "warning");
        return false;
      }
      const allCriteriaMet = Object.values(formValues.criteriaMet).every(Boolean);
      if (!allCriteriaMet) {
        showToast("Please confirm each project criteria item.", "warning");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formValues.identityDocument.trim()) {
        showToast("Please add a government ID or passport URL.", "warning");
        return false;
      }
    }

    return true;
  };

  const validateAll = () => {
    if (!validateStep(1)) {
      setStep(1);
      return false;
    }
    if (!validateStep(2)) {
      setStep(2);
      return false;
    }
    if (!validateStep(3)) {
      setStep(3);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (step < steps.length) {
      handleNext();
      return;
    }

    if (!validateAll()) {
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
    setStep(1);
    navigate("/user-dashboard");
  };

  return (
    <div 
      className={`page submit-project-page ${styles.submitPage}`}
    >
      <section className="page-header">
        <h1>Submit a project</h1>
        <p>
          Complete the vetting form so the team can review and verify your
          request.
        </p>
      </section>

      <div className="submit-project-wrapper">
        <div className="submit-steps">
          {steps.map((stepItem) => (
            <div
              key={stepItem.index}
              className={`submit-step${step >= stepItem.index ? " active" : ""}${step > stepItem.index ? " completed" : ""}`}
            >
              <span className="submit-step-index">{stepItem.index}</span>
              <span className="submit-step-label">{stepItem.label}</span>
            </div>
          ))}
        </div>

        <form className="submit-card" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="submit-section">
              <h2>Personal information</h2>
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-label">Full name *</span>
                  <input
                    type="text"
                    name="ownerName"
                    value={formValues.ownerName}
                    onChange={(event) => updateValue("ownerName", event.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Email *</span>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formValues.ownerEmail}
                    onChange={(event) =>
                      updateValue("ownerEmail", event.target.value)
                    }
                    placeholder="jane@example.com"
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Phone number *</span>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formValues.ownerPhone}
                    onChange={(event) =>
                      updateValue("ownerPhone", event.target.value)
                    }
                    placeholder="+254 700 123 456"
                    required
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="submit-section">
              <h2>Project details</h2>
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-label">Project title *</span>
                  <input
                    type="text"
                    name="title"
                    value={formValues.title}
                    onChange={(event) => updateValue("title", event.target.value)}
                    placeholder="Neighborhood Learning Lab"
                    required
                  />
                </label>

                <label className="form-field form-field-wide">
                  <span className="form-label">Description *</span>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={(event) =>
                      updateValue("description", event.target.value)
                    }
                    rows="4"
                    placeholder="Explain the impact, audience, and budget details."
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Category</span>
                  <select
                    name="category"
                    value={formValues.category}
                    onChange={(event) =>
                      updateValue("category", event.target.value)
                    }
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
                    name="goal"
                    value={formValues.goal}
                    onChange={(event) => updateValue("goal", event.target.value)}
                    placeholder="12000"
                    min="0"
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Cover image URL</span>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formValues.imageUrl}
                    onChange={(event) => updateValue("imageUrl", event.target.value)}
                    placeholder="https://images.example.com/cover.jpg"
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Gallery URLs (comma-separated)</span>
                  <input
                    type="text"
                    name="galleryUrls"
                    value={formValues.galleryUrls}
                    onChange={(event) =>
                      updateValue("galleryUrls", event.target.value)
                    }
                    placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                  />
                </label>
              </div>

              <div className="criteria-section">
                <h3>Criteria checklist</h3>
                <div className="criteria-grid">
                  {projectCriteria.map((criteria) => (
                    <label key={criteria.key} className="criteria-item">
                      <input
                        type="checkbox"
                        checked={Boolean(formValues.criteriaMet[criteria.key])}
                        onChange={() => toggleCriteria(criteria.key)}
                      />
                      <span>{criteria.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="submit-section">
              <h2>Identity verification</h2>
              <p className="submit-hint">
                Uploads are coming soon. For now, paste a secure link to your
                government ID or passport scan.
              </p>
              <label className="form-field">
                <span className="form-label">Government ID / Passport URL *</span>
                <input
                  type="url"
                  name="identityDocument"
                  value={formValues.identityDocument}
                  onChange={(event) =>
                    updateValue("identityDocument", event.target.value)
                  }
                  placeholder="https://secure-file-link.com/document"
                  required
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="submit-section submit-review">
              <h2>Review your submission</h2>
              <p className="submit-hint">
                Confirm everything looks correct before submitting for review.
              </p>

              <div className="review-grid">
                <div>
                  <p className="review-label">Owner name</p>
                  <p className="review-value">{formValues.ownerName}</p>
                </div>
                <div>
                  <p className="review-label">Owner email</p>
                  <p className="review-value">{formValues.ownerEmail}</p>
                </div>
                <div>
                  <p className="review-label">Owner phone</p>
                  <p className="review-value">{formValues.ownerPhone}</p>
                </div>
                <div>
                  <p className="review-label">Project title</p>
                  <p className="review-value">{formValues.title}</p>
                </div>
                <div>
                  <p className="review-label">Funding goal</p>
                  <p className="review-value">KSh {formValues.goal}</p>
                </div>
                <div>
                  <p className="review-label">Identity document</p>
                  <p className="review-value">{formValues.identityDocument}</p>
                </div>
                <div className="review-block">
                  <p className="review-label">Description</p>
                  <p className="review-value">{formValues.description}</p>
                </div>
                <div className="review-block">
                  <p className="review-label">Criteria checklist</p>
                  <ul>
                    {projectCriteria.map((criteria) => (
                      <li key={criteria.key}>
                        {formValues.criteriaMet[criteria.key] ? "✓" : "•"} {criteria.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className={styles.submitActions}>
            <button
              type="button"
              onClick={() => navigate("/user-dashboard")}
              className={styles.btnSecondary}
            >
              Cancel
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={styles.btnSecondary}
              >
                Back
              </button>
            )}

            {step < steps.length ? (
              <button 
                type="button" 
                onClick={handleNext}
                className={styles.btnPrimary}
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit"
                className={styles.btnPrimary}
              >
                Submit for review
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
