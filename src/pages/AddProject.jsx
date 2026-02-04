import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";
import Modal from "../components/Modal/Modal";
import useAuth from "../hooks/useAuth";
import { defaultCriteriaMet } from "../data/projectCriteria";

const initialValues = {
  title: "",
  description: "",
  category: "community",
  goal: "",
  imageUrl: "",
  galleryUrls: "",
};

export default function AddProject() {
  const { values, handleChange, reset } = useForm(initialValues);
  const { addProject } = useProjects();
  const { showToast } = useContext(ToastContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!values.title.trim() || !values.description.trim() || !values.goal) {
      showToast("Please complete the required fields.", "warning");
      return;
    }

    const isAdmin = Boolean(currentUser?.isAdmin);
    const criteriaMet = Object.keys(defaultCriteriaMet).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const newId = addProject({
      ...values,
      createdAt: new Date().toISOString(),
      createdBy: currentUser
        ? {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          }
        : null,
      ownerId: currentUser?.id || "",
      ownerName: currentUser?.name || "",
      ownerEmail: currentUser?.email || "",
      ownerPhone: currentUser?.phone || "",
      verificationStatus: isAdmin ? "approved" : "submitted",
      status: "active",
      verificationNotes: "",
      criteriaMet,
      fundUsage: [],
    });
    showToast("Project created and ready for donors.", "success");
    reset();
    setStep(1);
    navigate(`/projects/${newId}`);
  };

  const handleNextStep = () => {
    if (!values.title.trim() || !values.description.trim() || !values.goal) {
      showToast("Please complete the required fields.", "warning");
      return;
    }

    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleReset = () => {
    reset();
    setStep(1);
  };

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (!currentUser.isAdmin) {
    return <Navigate to="/submit-project" replace />;
  }

  return (
    <div className="page add-project-page">
      <Modal
        isOpen
        onClose={() => navigate("/")}
        title={step === 1 ? "Launch a New Project" : "Add Project Images"}
        footer={
          <div className="form-actions">
            {step === 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Next
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBackStep}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  form="add-project-form"
                >
                  Create Project
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-text"
              onClick={() => navigate("/")}
            >
              Close
            </button>
          </div>
        }
      >
        <p>
          {step === 1
            ? "Share your mission and funding goal. The community can see it immediately."
            : "Add visuals to help donors connect with your cause."}
        </p>

        <form className="add-project-form" id="add-project-form" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="add-form-section">
              <label className="add-form-field">
                <span className="add-form-label">Project Title *</span>
                <input
                  type="text"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  placeholder="Enter your project name"
                  required
                />
              </label>

              <label className="add-form-field">
                <span className="add-form-label">Description *</span>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what this project will accomplish and how donations will be used..."
                  required
                />
              </label>

              <div className="add-form-row">
                <label className="add-form-field">
                  <span className="add-form-label">Category</span>
                  <select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
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

                <label className="add-form-field">
                  <span className="add-form-label">Funding Goal (KSh) *</span>
                  <input
                    type="number"
                    name="goal"
                    value={values.goal}
                    onChange={handleChange}
                    placeholder="12000"
                    min="0"
                    required
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="add-form-section">
              <div className="add-form-section-header">
                <h4>Project Images</h4>
                <p>Add visuals to help donors connect with your cause.</p>
              </div>

              <label className="add-form-field">
                <span className="add-form-label">Cover Image URL</span>
                <input
                  type="url"
                  name="imageUrl"
                  value={values.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-example.jpg"
                />
              </label>

              <label className="add-form-field">
                <span className="add-form-label">Gallery URLs (comma-separated)</span>
                <input
                  type="text"
                  name="galleryUrls"
                  value={values.galleryUrls}
                  onChange={handleChange}
                  placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                />
              </label>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
