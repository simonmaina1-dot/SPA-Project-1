import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import useDonations from "../hooks/useDonations";
import useForm from "../hooks/useForm";
import { ToastContext } from "../context/ToastContext";
import Modal from "../components/Modal";

const initialValues = {
  name: "",
  email: "",
  amount: "",
  method: "card",
  note: "",
};

export default function Donate() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, formatCurrency, addDonation } = useProjects();
  const { addDonation: saveDonationRecord } = useDonations();
  const { showToast } = useContext(ToastContext);
  const { values, handleChange, reset } = useForm(initialValues);
  const [isProcessing, setIsProcessing] = useState(false);

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <div className="page donate-page">
        <section className="empty-state">
          <h2>Project not found</h2>
          <p>We could not find a project matching that link.</p>
          <Link to="/" className="btn btn-primary">
            Back to projects
          </Link>
        </section>
      </div>
    );
  }

  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    const amount = Number(values.amount);
    if (!amount || amount <= 0) {
      showToast("Enter a valid donation amount.", "warning");
      return;
    }

    const isTestEnv =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.MODE === "test";

    if (isTestEnv) {
      addDonation(project.id, amount);
      saveDonationRecord({
        projectId: project.id,
        projectTitle: project.title,
        donorName: values.name || "Anonymous",
        donorEmail: values.email,
        amount,
        message: values.note,
      });
      showToast("Payment simulated successfully.", "success");
      reset();
      navigate(`/projects/${project.id}`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      addDonation(project.id, amount);
      saveDonationRecord({
        projectId: project.id,
        projectTitle: project.title,
        donorName: values.name || "Anonymous",
        donorEmail: values.email,
        amount,
        message: values.note,
      });
      showToast("Payment simulated successfully.", "success");
      setIsProcessing(false);
      reset();
      navigate(`/projects/${project.id}`);
    }, 700);
  };

  const submitForm = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const handleClose = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="page donate-page">
      <Modal
        isOpen
        onClose={handleClose}
        title="Complete Your Donation"
        footer={
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={isProcessing}
              onClick={submitForm}
            >
              {isProcessing ? "Processing..." : "Pay now"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Back to project
            </button>
          </div>
        }
      >
        <p>This checkout is a demo experience. No real payments are processed.</p>

        <section className="donate-grid">
          <aside className="donate-summary">
            <h3>{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-meta">
                <span>{formatCurrency(project.currentAmount)}</span>
                <span>{progress}% funded</span>
              </div>
            </div>
            <div className="donate-meta">
              <span>Goal {formatCurrency(project.goal)}</span>
              <span>{project.donorCount || 0} donors</span>
            </div>
          </aside>

          <form
            className="form-card payment-card"
            id="donate-form"
            onSubmit={handleSubmit}
            noValidate
          >
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
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Donation amount (KSh)</span>
                <input
                  type="number"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  placeholder="50"
                  min="1"
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Payment method</span>
                <select name="method" value={values.method} onChange={handleChange}>
                  <option value="card">Card</option>
                  <option value="mpesa">M-Pesa (demo)</option>
                  <option value="bank">Bank transfer (demo)</option>
                </select>
              </label>
              <label className="form-field form-field-wide">
                <span className="form-label">Donor note</span>
                <textarea
                  name="note"
                  value={values.note}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Leave encouragement for the project team"
                />
              </label>
            </div>

            <p className="payment-disclaimer">
              Demo checkout only. No card details are requested or stored.
            </p>
          </form>
        </section>
      </Modal>
    </div>
  );
}
