import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";
import DraggableModal from "../components/DraggableModal";

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
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!values.title.trim() || !values.description.trim() || !values.goal) {
      showToast("Please complete the required fields.", "warning");
      return;
    }

    const newId = addProject(values);
    showToast("Project created and ready for donors.", "success");
    reset();
    navigate(`/projects/${newId}`);
  };

  return (
    <div className="page add-project-page">
      <DraggableModal
        isOpen
        onClose={() => navigate("/")}
        title="Launch a New Project"
        footer={
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              form="add-project-form"
            >
              Create Project
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => reset()}
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
          Share your mission and funding goal. The community can see it
          immediately.
        </p>

        <form className="form-card" id="add-project-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Project title</span>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder="Neighborhood Learning Lab"
                required
              />
            </label>

            <label className="form-field">
              <span className="form-label">Funding goal (KSh)</span>
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

            <label className="form-field">
              <span className="form-label">Category</span>
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

            <div className="form-section">
              <h4>Project images</h4>
              <p className="form-helper">
                Add a cover image and optional gallery links to show your work.
              </p>
            </div>

            <label className="form-field">
              <span className="form-label">Cover image URL</span>
              <input
                type="url"
                name="imageUrl"
                value={values.imageUrl}
                onChange={handleChange}
                placeholder="https://images.example.com/cover.jpg"
              />
            </label>

            <label className="form-field form-field-wide">
              <span className="form-label">Gallery image URLs (comma-separated)</span>
              <input
                type="text"
                name="galleryUrls"
                value={values.galleryUrls}
                onChange={handleChange}
                placeholder="https://images.example.com/1.jpg, https://images.example.com/2.jpg"
              />
            </label>

            <label className="form-field form-field-wide">
              <span className="form-label">Project description</span>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows="4"
                placeholder="What will the donation fund?"
                required
              />
            </label>
          </div>
        </form>
      </DraggableModal>
    </div>
  );
}
