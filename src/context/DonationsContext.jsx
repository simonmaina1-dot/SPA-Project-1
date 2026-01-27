import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const DonationsContext = createContext(null);

export function DonationsProvider({ children }) {
  const [donations, setDonations] = useState([]);

  // Fetch donations from db.json via JSON Server
  useEffect(() => {
    fetch("http://localhost:3002/donations")
      .then((res) => res.json())
      .then((data) => setDonations(data))
      .catch((err) => console.error("Failed to load donations:", err));
  }, []);

  // Add a new donation (POST to JSON Server)
  const addDonation = useCallback(async (donation) => {
    const newDonation = {
      id: `d-${Date.now()}`,
      projectId: donation.projectId,
      projectTitle: donation.projectTitle,
      donorName: donation.donorName?.trim() || "Anonymous",
      donorEmail: donation.donorEmail?.trim() || "",
      amount: Number(donation.amount) || 0,
      message: donation.message?.trim() || "",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3002/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDonation),
      });

      if (!res.ok) throw new Error("Failed to save donation");

      setDonations((prev) => [newDonation, ...prev]);
      return newDonation.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const getDonationsByProject = useCallback(
    (projectId) => donations.filter((d) => d.projectId === projectId),
    [donations]
  );

  const getRecentDonations = useCallback(
    (limit = 10) => donations.slice(0, limit),
    [donations]
  );

  const getTotalDonated = useCallback(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );

  const getUniqueDonors = useCallback(() => {
    const emails = donations
      .filter((d) => d.donorEmail)
      .map((d) => d.donorEmail.toLowerCase());
    return new Set(emails).size;
  }, [donations]);

  const value = useMemo(
    () => ({
      donations,
      addDonation,
      getDonationsByProject,
      getRecentDonations,
      getTotalDonated,
      getUniqueDonors,
    }),
    [
      donations,
      addDonation,
      getDonationsByProject,
      getRecentDonations,
      getTotalDonated,
      getUniqueDonors,
    ]
  );

  return (
    <DonationsContext.Provider value={value}>
      {children}
    </DonationsContext.Provider>
  );
}
