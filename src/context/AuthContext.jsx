import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { seedAdmins } from "../data/seedData";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState(seedAdmins);

  // Fetch admin users from db.json
  useEffect(() => {
    let isActive = true;
    const loadAdmins = async () => {
      try {
        const res = await fetch("http://localhost:3002/admins");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setAdminUsers(data);
      } catch (err) {
        console.warn("Using local seed admins.", err);
        if (!isActive) return;
        setAdminUsers(seedAdmins);
      }
    };

    loadAdmins();
    return () => {
      isActive = false;
    };
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = adminUsers.find(
        (admin) =>
          admin.email.toLowerCase() === normalizedEmail &&
          admin.password === password
      );

      if (!user) {
        return { ok: false, message: "Invalid email or password." };
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [adminUsers]
  );

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, signIn, signOut }),
    [currentUser, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
