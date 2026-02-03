import { useContext, useEffect, useState, useCallback } from "react";
import { ToastContext } from "../../context/ToastContext";
import "./Toast.css";

// Toast Icon Components
const SuccessIcon = () => (
  <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Get icon based on type
const getIcon = (type) => {
  switch (type) {
    case "success":
      return <SuccessIcon />;
    case "error":
      return <ErrorIcon />;
    case "warning":
      return <WarningIcon />;
    case "info":
    default:
      return <InfoIcon />;
  }
};

// Individual Toast Component
function ToastItem({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  }, [toast.id, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure toast is removed when component unmounts
      onClose(toast.id);
    };
  }, [toast.id, onClose]);

  return (
    <div
      className={`toast toast-${toast.type} ${isVisible && !isExiting ? "toast-visible" : ""} ${isExiting ? "toast-exiting" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon-wrapper">
        {getIcon(toast.type)}
      </div>
      <p className="toast-message">{toast.message}</p>
      <button
        type="button"
        className="toast-close"
        onClick={handleClose}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="toast-wrapper"
          style={{ marginTop: `${index * 80}px` }}
        >
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
