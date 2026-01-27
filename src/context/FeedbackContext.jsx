import { createContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const seedFeedback = [
  {
    id: "f-1001",
    name: "Jane Mwangi",
    email: "jane.mwangi@email.com",
    message: "Love the platform! Would be great to have email notifications for project updates.",
    createdAt: "2026-01-25T10:30:00Z",
    status: "new",
  },
  {
    id: "f-1002",
    name: "Peter Ochieng",
    email: "peter.o@email.com",
    message: "The donation process is smooth. Can we add M-Pesa integration?",
    createdAt: "2026-01-24T14:15:00Z",
    status: "reviewed",
  },
];

export const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedbackList, setFeedbackList] = useLocalStorage(
    "cdh-feedback",
    seedFeedback
  );

  const addFeedback = useCallback(
    (feedback) => {
      const id = `f-${Date.now()}`;
      const newFeedback = {
        id,
        name: feedback.name.trim(),
        email: feedback.email.trim(),
        message: feedback.message.trim(),
        createdAt: new Date().toISOString(),
        status: "new",
      };
      setFeedbackList((prev) => [newFeedback, ...prev]);
      return id;
    },
    [setFeedbackList]
  );

  const updateFeedbackStatus = useCallback(
    (id, status) => {
      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    },
    [setFeedbackList]
  );

  const removeFeedback = useCallback(
    (id) => {
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    },
    [setFeedbackList]
  );

  const value = useMemo(
    () => ({
      feedbackList,
      addFeedback,
      updateFeedbackStatus,
      removeFeedback,
    }),
    [feedbackList, addFeedback, updateFeedbackStatus, removeFeedback]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
