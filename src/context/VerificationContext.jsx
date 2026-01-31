import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const VerificationContext = createContext(null);

export function VerificationProvider({ children }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Fetch verification submissions from JSON Server
  useEffect(() => {
    let isActive = true;
    const loadSubmissions = async () => {
      try {
        const res = await fetch("/verificationSubmissions");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setSubmissions(data);
        setApiAvailable(true);
      } catch (err) {
        console.warn("Using local verification data.", err);
        if (!isActive) return;
        // Will use empty array if API unavailable
        setApiAvailable(false);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadSubmissions();
    return () => {
      isActive = false;
    };
  }, []);

  // Create a new verification submission
  const createSubmission = useCallback(async (submissionData) => {
    const newSubmission = {
      id: `vs-${Date.now()}`,
      projectId: submissionData.projectId,
      ownerId: submissionData.ownerId,
      ownerName: submissionData.ownerName.trim(),
      ownerEmail: submissionData.ownerEmail.trim(),
      ownerPhone: submissionData.ownerPhone.trim(),
      identityDocumentType: submissionData.identityDocumentType,
      identityDocumentUrl: submissionData.identityDocumentUrl || null,
      documentNumber: submissionData.documentNumber?.trim() || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
      adminReviewer: null,
      reviewedAt: null,
      reviewNotes: "",
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    if (apiAvailable) {
      try {
        const res = await fetch("/verificationSubmissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSubmission),
        });

        if (!res.ok) throw new Error("Failed to save submission");
      } catch (err) {
        console.error("Failed to create verification submission:", err);
      }
    }

    return newSubmission.id;
  }, [apiAvailable]);

  // Update submission status (admin action)
  const updateSubmissionStatus = useCallback(async (submissionId, updates) => {
    const submissionToUpdate = submissions.find((s) => s.id === submissionId);
    if (!submissionToUpdate) return;

    const updatedSubmission = {
      ...submissionToUpdate,
      ...updates,
      reviewedAt: new Date().toISOString(),
    };

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? updatedSubmission : s))
    );

    if (apiAvailable) {
      try {
        const res = await fetch(
          `/verificationSubmissions/${submissionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSubmission),
          }
        );

        if (!res.ok) throw new Error("Failed to update submission");
      } catch (err) {
        console.error("Failed to update verification submission:", err);
      }
    }
  }, [submissions, apiAvailable]);

  // Get submissions by status
  const getSubmissionsByStatus = useCallback(
    (status) => submissions.filter((s) => s.status === status),
    [submissions]
  );

  // Get pending submissions count
  const getPendingCount = useCallback(
    () => submissions.filter((s) => s.status === "pending").length,
    [submissions]
  );

  // Get submission by project ID
  const getSubmissionByProjectId = useCallback(
    (projectId) => submissions.find((s) => s.projectId === projectId),
    [submissions]
  );

  const value = useMemo(
    () => ({
      submissions,
      isLoading,
      createSubmission,
      updateSubmissionStatus,
      getSubmissionsByStatus,
      getPendingCount,
      getSubmissionByProjectId,
    }),
    [
      submissions,
      isLoading,
      createSubmission,
      updateSubmissionStatus,
      getSubmissionsByStatus,
      getPendingCount,
      getSubmissionByProjectId,
    ]
  );

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}

