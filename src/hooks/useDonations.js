import { useContext } from "react";
import { DonationsContext } from "../context/DonationsContext";

export default function useDonations() {
  const context = useContext(DonationsContext);
  if (!context) {
    throw new Error("useDonations must be used within DonationsProvider");
  }
  return context;
}
