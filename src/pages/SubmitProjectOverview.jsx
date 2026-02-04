import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectDetailsModal from '../components/modals/ProjectDetailsModal';
import IdentityVerificationForm from '../components/forms/IdentityVerificationForm';
import ReviewModal from '../components/modals/ReviewModal';

const STEPS = [
  { id: 1, title: 'Project Details', icon: 'clipboard' },
  { id: 2, title: 'Identity Verification', icon: 'shield' },
  { id: 3, title: 'Review', icon: 'check' },
];

const SubmitProjectOverview = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState({
    projectDetails: null,
    identityVerification: null,
  });

  // Handlers for project details modal
  const handleOpenProjectDetails = () => {
    setShowProjectDetails(true);
  };

  const handleSaveProjectDetails = useCallback((data) => {
    setFormData((prev) => ({ ...prev, projectDetails: data }));
    setShowProjectDetails(false);
    setCurrentStep(2);
    setShowIdentityVerification(true);
  }, []);

  // Handlers for identity verification
  const handleOpenIdentityVerification = () => {
    setShowIdentityVerification(true);
  };

  const handleSaveIdentityVerification = useCallback((data) => {
    setFormData((prev) => ({ ...prev, identityVerification: data }));
    setShowIdentityVerification(false);
    setCurrentStep(3);
    setShowReview(true);
  }, []);

  // Handlers for review modal
  const handleOpenReview = () => {
    setShowReview(true);
  };

  const handleSubmitProject = useCallback(() => {
    console.log('Submitting project:', formData);
    // Navigate to home or show success message
    navigate('/');
  }, [formData, navigate]);

  // Handler to go back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (currentStep === 2) {
        setShowIdentityVerification(false);
      } else if (currentStep === 3) {
        setShowReview(false);
      }
    }
  };

  return (
    <div className="submit-overview-container">
      {/* Header */}
      <header className="submit-overview-header">
        <div className="header-content">
          <h1 className="header-title">Submit a Project</h1>
          <p className="header-subtitle">
            Share your community project with the world
          </p>
        </div>
      </header>

      {/* Steps Progress */}
      <div className="steps-container">
        <div className="steps-progress">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`step ${
                currentStep === step.id
                  ? 'active'
                  : currentStep > step.id
                  ? 'completed'
                  : ''
              }`}
            >
              <div className="step-number">
                {currentStep > step.id ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="step-check"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.73a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span className="step-title">{step.title}</span>
              {index < STEPS.length - 1 && (
                <div
                  className={`step-line ${
                    currentStep > step.id ? 'filled' : ''
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="submit-overview-content">
        {/* Step 1: Project Details Card */}
        <div
          className={`step-card ${
            currentStep === 1 ? 'active-card' : ''
          }`}
        >
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="card-title">Project Details</h2>
          <p className="card-description">
            Tell us about your project, its goals, and how it will impact the
            community.
          </p>
          {currentStep === 1 ? (
            <button
              className="btn-primary"
              onClick={handleOpenProjectDetails}
            >
              Start
            </button>
          ) : formData.projectDetails ? (
            <div className="completed-info">
              <span className="completed-text">✓ Completed</span>
              <button
                className="btn-edit"
                onClick={handleOpenProjectDetails}
              >
                Edit
              </button>
            </div>
          ) : null}
        </div>

        {/* Step 2: Identity Verification Card */}
        <div
          className={`step-card ${
            currentStep === 2 ? 'active-card' : ''
          }`}
        >
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          </div>
          <h2 className="card-title">Identity Verification</h2>
          <p className="card-description">
            Verify your identity to build trust with potential donors.
          </p>
          {currentStep === 2 ? (
            <button
              className="btn-primary"
              onClick={handleOpenIdentityVerification}
            >
              Continue
            </button>
          ) : formData.identityVerification ? (
            <div className="completed-info">
              <span className="completed-text">✓ Completed</span>
              <button
                className="btn-edit"
                onClick={handleOpenIdentityVerification}
              >
                Edit
              </button>
            </div>
          ) : formData.projectDetails ? (
            <button
              className="btn-primary"
              onClick={handleOpenIdentityVerification}
            >
              Continue
            </button>
          ) : null}
        </div>

        {/* Step 3: Review Card */}
        <div
          className={`step-card ${
            currentStep === 3 ? 'active-card' : ''
          }`}
        >
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="card-title">Review</h2>
          <p className="card-description">
            Review your submission before finalizing your project.
          </p>
          {currentStep === 3 ? (
            <button
              className="btn-primary"
              onClick={handleOpenReview}
            >
              Review
            </button>
          ) : formData.identityVerification ? (
            <button
              className="btn-primary"
              onClick={handleOpenReview}
            >
              Review
            </button>
          ) : null}
        </div>
      </div>

      {/* Back Button */}
      {currentStep > 1 && (
        <div className="back-container">
          <button className="btn-back" onClick={handleBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="btn-back-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </button>
        </div>
      )}

      {/* Modals */}
      <ProjectDetailsModal
        isOpen={showProjectDetails}
        onClose={() => setShowProjectDetails(false)}
        onSave={handleSaveProjectDetails}
      />

      <IdentityVerificationForm
        isOpen={showIdentityVerification}
        onClose={() => setShowIdentityVerification(false)}
        onSave={handleSaveIdentityVerification}
      />

      <ReviewModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onSubmit={handleSubmitProject}
        formData={formData}
      />
    </div>
  );
};

export default SubmitProjectOverview;
