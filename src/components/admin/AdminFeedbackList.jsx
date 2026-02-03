export default function AdminFeedbackList({
  feedbackList,
  updateFeedbackStatus,
  removeFeedback,
  showToast,
}) {
  return (
    <article className="admin-card admin-card-wide">
      <div className="admin-section-header">
        <div>
          <h3>User Feedback</h3>
          <p className="admin-card-subtitle">
            Community suggestions and feedback submissions.
          </p>
        </div>
      </div>
      <div className="admin-feedback-grid">
        {feedbackList.length === 0 ? (
          <p className="admin-empty col-span-2">No feedback received yet.</p>
        ) : (
          feedbackList.map((feedback, index) => (
            <div 
              key={feedback.id} 
              className={`admin-feedback-item animation-scroll-up ${
                feedback.status === 'reviewed' ? 'admin-feedback-reviewed' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="admin-feedback-header">
                <div className="admin-feedback-user">
                  <span className="admin-feedback-name">{feedback.name}</span>
                  <span className="admin-feedback-email">{feedback.email}</span>
                </div>
                <span className="admin-feedback-date">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="admin-feedback-content">
                <p>{feedback.message}</p>
              </div>
              <div className="admin-feedback-actions">
                {feedback.status !== "reviewed" && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      updateFeedbackStatus(feedback.id, "reviewed");
                      showToast("Feedback marked as reviewed.", "success");
                    }}
                  >
                    Mark Reviewed
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    removeFeedback(feedback.id);
                    showToast("Feedback removed.", "success");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
