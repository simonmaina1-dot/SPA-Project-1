import { useState, useEffect, useMemo, useCallback } from "react";
import { projectCriteria } from "../data/projectCriteria";

// Utility functions
const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusLabels = {
  pending: "Pending",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Reviewed",
  rejected: "Rejected",
};

/**
 * Hook for managing vetting queue state and drafts
 */
export function useVettingQueue(projects) {
  const queue = useMemo(
    () =>
      projects.filter(
        (project) => project.verificationStatus !== "approved"
      ),
    [projects]
  );

  const [drafts, setDrafts] = useState({});

  // Initialize drafts when queue changes
  useEffect(() => {
    const nextDrafts = {};
    queue.forEach((project) => {
      nextDrafts[project.id] = {
        criteriaMet: { ...project.criteriaMet },
        verificationNotes: project.verificationNotes || "",
      };
    });
    setDrafts(nextDrafts);
  }, [queue]);

  const updateDraft = useCallback((projectId, updates) => {
    setDrafts((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        ...updates,
      },
    }));
  }, []);

  const toggleCriteria = useCallback((projectId, key) => {
    setDrafts((prev) => {
      const current = prev[projectId]?.criteriaMet || {};
      return {
        ...prev,
        [projectId]: {
          ...prev[projectId],
          criteriaMet: {
            ...current,
            [key]: !current[key],
          },
        },
      };
    });
  }, []);

  const getDraft = useCallback(
    (projectId) => drafts[projectId] || null,
    [drafts]
  );

  const getProjectDraft = useCallback(
    (project) =>
      drafts[project.id] || {
        criteriaMet: project.criteriaMet,
        verificationNotes: project.verificationNotes || "",
      },
    [drafts]
  );

  return {
    queue,
    drafts,
    updateDraft,
    toggleCriteria,
    getDraft,
    getProjectDraft,
  };
}

/**
 * Hook for handling vetting actions (approve, reject, save notes, etc.)
 */
export function useVettingActions(updateProject, showToast) {
  const handleAction = useCallback(
    (project, nextStatus, draft) => {
      const criteriaMet = draft?.criteriaMet || project.criteriaMet;

      // Validation
      if (nextStatus === "approved") {
        const allCriteriaMet = Object.values(criteriaMet || {}).every(Boolean);
        if (!allCriteriaMet) {
          showToast("Confirm each criteria item before approving.", "warning");
          return;
        }
      }

      if (nextStatus === "rejected" && !draft?.verificationNotes.trim()) {
        showToast("Add a rejection note for the applicant.", "warning");
        return;
      }

      const status = nextStatus === "approved" ? "active" : "review";

      updateProject(project.id, {
        verificationStatus: nextStatus,
        verificationNotes: draft?.verificationNotes.trim() || "",
        criteriaMet,
        status,
      });

      const message =
        nextStatus === "approved"
          ? "Project reviewed and published."
          : nextStatus === "rejected"
            ? "Submission rejected with notes sent."
            : "Vetting status updated.";

      showToast(message, "success");
    },
    [updateProject, showToast]
  );

  const handleSaveNotes = useCallback(
    (project, draft) => {
      if (!draft) return;

      updateProject(project.id, {
        verificationNotes: draft.verificationNotes.trim(),
        criteriaMet: draft.criteriaMet,
      });
      showToast("Vetting notes updated.", "success");
    },
    [updateProject, showToast]
  );

  return {
    handleAction,
    handleSaveNotes,
  };
}

/**
 * Hook for formatting helpers
 */
export function useVettingFormatters() {
  return {
    formatDate: useCallback(formatDate, []),
    statusLabels: useMemo(() => statusLabels, []),
    projectCriteria: useMemo(() => projectCriteria, []),
  };
}

export default useVettingQueue;
