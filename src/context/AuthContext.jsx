import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  // Fetch admin users from db.json
  useEffect(() => {
    fetch("http://localhost:3002/admins")
      .then((res) => res.json())
      .then((data) => setAdminUsers(data))
      .catch((err) => console.error("Failed to load admins:", err));
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
