import { useContext } from "react";
import useForm from "../hooks/useForm";
import { ToastContext } from "../context/ToastContext";

const initialValues = {
  name: "",
  email: "",
  message: "",
};

export default function FeedbackForm({ title = "Share feedback", subtitle }) {
  const { showToast } = useContext(ToastContext);
  const { values, handleChange, reset } = useForm(initialValues);

  const handleSubmit = (event) => {
    event.preventDefault();
    showToast("Thanks for sharing your feedback!", "success");
    reset();
  };

  return (
    <section className="feedback-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span className="form-label">Full name</span>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Email</span>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="your-name@email.com"
              required
            />
          </label>
          <label className="form-field form-field-wide">
            <span className="form-label">Feedback</span>
            <textarea
              name="message"
              value={values.message}
              onChange={handleChange}
              rows="4"
              placeholder="What should we improve or add next?"
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Send feedback
          </button>
        </div>
      </form>
    </section>
  );
}
