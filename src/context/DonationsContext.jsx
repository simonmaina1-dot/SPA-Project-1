import { createContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const seedDonations = [
  {
    id: "d-1001",
    projectId: "p-1001",
    projectTitle: "Neighborhood Learning Lab",
    donorName: "Anonymous",
    donorEmail: "",
    amount: 500,
    message: "Keep up the great work!",
    createdAt: "2026-01-26T09:00:00Z",
  },
  {
    id: "d-1002",
    projectId: "p-1002",
    projectTitle: "Community Solar Garden",
    donorName: "Mary Wanjiku",
    donorEmail: "mary.w@email.com",
    amount: 2000,
    message: "Happy to support clean energy!",
    createdAt: "2026-01-25T16:30:00Z",
  },
  {
    id: "d-1003",
    projectId: "p-1001",
    projectTitle: "Neighborhood Learning Lab",
    donorName: "James Kimani",
    donorEmail: "jkimani@email.com",
    amount: 1500,
    message: "",
    createdAt: "2026-01-25T11:45:00Z",
  },
  {
    id: "d-1004",
    projectId: "p-1006",
    projectTitle: "Neighborhood Food Pantry Fridge",
    donorName: "Grace Achieng",
    donorEmail: "grace.a@email.com",
    amount: 800,
    message: "For the community!",
    createdAt: "2026-01-24T14:20:00Z",
  },
];

export const DonationsContext = createContext(null);

export function DonationsProvider({ children }) {
  const [donations, setDonations] = useLocalStorage(
    "cdh-donations",
    seedDonations
  );

  const addDonation = useCallback(
    (donation) => {
      const id = `d-${Date.now()}`;
      const newDonation = {
        id,
        projectId: donation.projectId,
        projectTitle: donation.projectTitle,
        donorName: donation.donorName?.trim() || "Anonymous",
        donorEmail: donation.donorEmail?.trim() || "",
        amount: Number(donation.amount) || 0,
        message: donation.message?.trim() || "",
        createdAt: new Date().toISOString(),
      };
      setDonations((prev) => [newDonation, ...prev]);
      return id;
    },
    [setDonations]
  );

  const getDonationsByProject = useCallback(
    (projectId) => {
      return donations.filter((d) => d.projectId === projectId);
    },
    [donations]
  );

  const getRecentDonations = useCallback(
    (limit = 10) => {
      return donations.slice(0, limit);
    },
    [donations]
  );

  const getTotalDonated = useCallback(() => {
    return donations.reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

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
