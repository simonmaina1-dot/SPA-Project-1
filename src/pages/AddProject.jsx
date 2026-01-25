import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useProjects from "../hooks/useProjects";
import { ToastContext } from "../context/ToastContext";

const initialValues = {
  title: "",
  description: "",
  category: "community",
  goal: "",
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
      <section className="page-header">
        <h1>Launch a New Project</h1>
        <p>
          Share your mission and funding goal. The community can see it
          immediately.
        </p>
      </section>

      <form className="form-card" onSubmit={handleSubmit}>
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
            <span className="form-label">Funding goal (USD)</span>
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
            <select name="category" value={values.category} onChange={handleChange}>
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

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => reset()}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
