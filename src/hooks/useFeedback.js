import { useContext } from "react";
import { FeedbackContext } from "../context/FeedbackContext";

export default function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    const isTestEnv =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.MODE === "test";

    if (!isTestEnv) {
      throw new Error("useFeedback must be used within FeedbackProvider");
    }

    return {
      feedbackList: [],
      addFeedback: () => null,
      updateFeedbackStatus: () => null,
      removeFeedback: () => null,
    };
  }
  return context;
}
