import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { seedDonations } from "../data/seedData";

export const DonationsContext = createContext(null);

const normalizeDonation = (donation) => ({
  ...donation,
  source: donation.source || donation.method || "card",
});

const useDonationsValue = ({
  donations,
  addDonation,
  getDonationsByProject,
  getRecentDonations,
  getTotalDonated,
  getUniqueDonors,
}) =>
  useMemo(
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

export function DonationsProvider({ children }) {
  const [donations, setDonations] = useState(
    seedDonations.map(normalizeDonation)
  );
  const [apiAvailable, setApiAvailable] = useState(false);

  // API URL from environment or default to local development
  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    let isActive = true;
    const loadDonations = async () => {
      try {
        const res = await fetch("/donations");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setDonations(data.map(normalizeDonation));
        setApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed donations.", err);
        if (!isActive) return;
        setDonations(seedDonations.map(normalizeDonation));
        setApiAvailable(false);
      }
    };

    loadDonations();
    return () => {
      isActive = false;
    };
  }, [apiUrl]);

  // Add a new donation (POST to JSON Server)
  const addDonation = useCallback(async (donation) => {
    const newDonation = normalizeDonation({
      id: `d-${Date.now()}`,
      projectId: donation.projectId,
      projectTitle: donation.projectTitle,
      donorName: donation.donorName?.trim() || "Anonymous",
      donorEmail: donation.donorEmail?.trim() || "",
      amount: Number(donation.amount) || 0,
      message: donation.message?.trim() || "",
      source: donation.source || donation.method || "card",
      createdAt: new Date().toISOString(),
    });

    setDonations((prev) => [newDonation, ...prev]);

    if (apiAvailable && apiUrl) {
      try {
        const res = await fetch("/donations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDonation),
        });

        if (!res.ok) throw new Error("Failed to save donation");
      } catch (err) {
        console.error(err);
        setApiAvailable(false);
      }
    }

    return newDonation.id;
  }, [apiAvailable, apiUrl]);

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

  const value = useDonationsValue({
    donations,
    addDonation,
    getDonationsByProject,
    getRecentDonations,
    getTotalDonated,
    getUniqueDonors,
  });

  return (
    <DonationsContext.Provider value={value}>
      {children}
    </DonationsContext.Provider>
  );
}

