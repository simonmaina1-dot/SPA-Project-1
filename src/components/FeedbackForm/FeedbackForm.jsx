import { useContext } from "react";
import useForm from "../../hooks/useForm";
import useFeedback from "../../hooks/useFeedback";
import { ToastContext } from "../../context/ToastContext";

const initialValues = {
  name: "",
  email: "",
  message: "",
};

export default function FeedbackForm({ title = "Share feedback", subtitle }) {
  const { showToast } = useContext(ToastContext);
  const { addFeedback } = useFeedback();
  const { values, handleChange, reset } = useForm(initialValues);

  const handleSubmit = (event) => {
    event.preventDefault();
    addFeedback(values);
    showToast("Thanks for sharing your feedback!", "success");
    reset();
  };

  return (
    <div className="feedback-form">
      <div className="feedback-form-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <form className="feedback-form-body" onSubmit={handleSubmit}>
        <div className="feedback-form-row">
          <label className="feedback-form-field">
            <span className="feedback-form-label">Full Name</span>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </label>
          <label className="feedback-form-field">
            <span className="feedback-form-label">Email Address</span>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </label>
        </div>
        <label className="feedback-form-field">
          <span className="feedback-form-label">Your Feedback</span>
          <textarea
            name="message"
            value={values.message}
            onChange={handleChange}
            rows="5"
            placeholder="Share your thoughts, suggestions, or ideas for improvement..."
            required
          />
        </label>
        <button type="submit" className="btn btn-primary feedback-submit-btn">
          Send Feedback
        </button>
      </form>
    </div>
  );
}
