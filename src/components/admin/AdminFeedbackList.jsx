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
      <div className="admin-feedback-list">
        {feedbackList.length === 0 ? (
          <p className="admin-empty">No feedback received yet.</p>
        ) : (
          feedbackList.map((feedback) => (
            <div key={feedback.id} className="admin-feedback-card">
              <div className="admin-feedback-header">
                <div>
                  <p className="admin-row-title">{feedback.name}</p>
                  <span className="admin-row-meta">{feedback.email}</span>
                </div>
                <span className="admin-row-meta">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="admin-feedback-message">{feedback.message}</p>
              <div className="admin-feedback-actions">
                {feedback.status === "new" && (
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
