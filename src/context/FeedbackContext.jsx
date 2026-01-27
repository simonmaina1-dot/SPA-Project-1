import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedbackList, setFeedbackList] = useState([]);

  // Fetch feedback from db.json via JSON Server
  useEffect(() => {
    fetch("http://localhost:3002/feedback")
      .then((res) => res.json())
      .then((data) => setFeedbackList(data))
      .catch((err) => console.error("Failed to load feedback:", err));
  }, []);

  // Add new feedback (POST to JSON Server)
  const addFeedback = useCallback(async (feedback) => {
    const newFeedback = {
      id: `f-${Date.now()}`,
      name: feedback.name.trim(),
      email: feedback.email.trim(),
      message: feedback.message.trim(),
      createdAt: new Date().toISOString(),
      status: "new",
    };

    try {
      const res = await fetch("http://localhost:3002/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeedback),
      });

      if (!res.ok) throw new Error("Failed to save feedback");

      setFeedbackList((prev) => [newFeedback, ...prev]);
      return newFeedback.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  // Update feedback status (PATCH to JSON Server)
  const updateFeedbackStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3002/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update feedback");

      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Remove feedback (DELETE from JSON Server)
  const removeFeedback = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:3002/feedback/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete feedback");

      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, []);

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
