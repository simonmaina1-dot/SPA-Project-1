import { createContext, useCallback, useMemo, useRef, useState } from "react";

// Default toast duration
const DEFAULT_DURATION = 4000;

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef(new Map());

  const removeToast = useCallback((id) => {
    // Clear any existing timeout for this toast
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    
    setToasts((prev) => {
      // Check if toast still exists before removing
      if (!prev.find(toast => toast.id === id)) {
        return prev;
      }
      return prev.filter((toast) => toast.id !== id);
    });
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = DEFAULT_DURATION) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((prev) => {
        // Prevent duplicate messages
        if (prev.some(toast => toast.message === message && toast.type === type)) {
          return prev;
        }
        return [...prev, { id, message, type, duration }];
      });
      
      // Clear any existing timeout for this toast id
      const existingTimeout = timeoutRefs.current.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Auto-remove after duration + animation time
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration + 500);
      
      timeoutRefs.current.set(id, timeoutId);
      
      // Cleanup on unmount for this specific toast
      return () => {
        const cleanupTimeout = timeoutRefs.current.get(id);
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout);
          timeoutRefs.current.delete(id);
        }
      };
    },
    [removeToast]
  );

  // Cleanup all timeouts on unmount
  useMemo(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current.clear();
    };
  }, []);

  // Convenience methods
  const success = useCallback(
    (message, duration) => showToast(message, "success", duration),
    [showToast]
  );

  const error = useCallback(
    (message, duration) => showToast(message, "error", duration),
    [showToast]
  );

  const warning = useCallback(
    (message, duration) => showToast(message, "warning", duration),
    [showToast]
  );

  const info = useCallback(
    (message, duration) => showToast(message, "info", duration),
    [showToast]
  );

  const value = useMemo(
    () => ({ toasts, showToast, removeToast, success, error, warning, info }),
    [toasts, showToast, removeToast, success, error, warning, info]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
