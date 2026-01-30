import { useContext } from "react";
import { VerificationContext } from "../context/VerificationContext";

export default function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVerification must be used within VerificationProvider");
  }
  return context;
}
