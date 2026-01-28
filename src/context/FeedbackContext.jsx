import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { seedFeedback } from "../data/seedData";

export const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedbackList, setFeedbackList] = useState(seedFeedback);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadFeedback = async () => {
      try {
        const res = await fetch("http://localhost:3002/feedback");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setFeedbackList(data);
        setApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed feedback.", err);
        if (!isActive) return;
        setFeedbackList(seedFeedback);
        setApiAvailable(false);
      }
    };

    loadFeedback();
    return () => {
      isActive = false;
    };
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

    setFeedbackList((prev) => [newFeedback, ...prev]);

    if (apiAvailable) {
      try {
        const res = await fetch("http://localhost:3002/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newFeedback),
        });

        if (!res.ok) throw new Error("Failed to save feedback");
      } catch (err) {
        console.error(err);
        setApiAvailable(false);
      }
    }

    return newFeedback.id;
  }, [apiAvailable]);

  // Update feedback status (PATCH to JSON Server)
  const updateFeedbackStatus = useCallback(async (id, status) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    if (!apiAvailable) return;

    try {
      const res = await fetch(`http://localhost:3002/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update feedback");
    } catch (err) {
      console.error(err);
      setApiAvailable(false);
    }
  }, [apiAvailable]);

  // Remove feedback (DELETE from JSON Server)
  const removeFeedback = useCallback(async (id) => {
    setFeedbackList((prev) => prev.filter((item) => item.id !== id));

    if (!apiAvailable) return;

    try {
      const res = await fetch(`http://localhost:3002/feedback/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete feedback");
    } catch (err) {
      console.error(err);
      setApiAvailable(false);
    }
  }, [apiAvailable]);

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
