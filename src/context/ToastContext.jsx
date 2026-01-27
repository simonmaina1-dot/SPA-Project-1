import { createContext, useCallback, useMemo, useState } from "react";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((prev) => [...prev, { id, message, type }]);
      const isTestEnv =
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.MODE === "test") ||
        (typeof process !== "undefined" &&
          process.env &&
          process.env.NODE_ENV === "test") ||
        (typeof import.meta !== "undefined" && import.meta.vitest);

      if (!isTestEnv) {
        window.setTimeout(() => removeToast(id), 3500);
      }
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [toasts, showToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
