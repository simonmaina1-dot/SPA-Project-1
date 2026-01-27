import { createContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const adminUsers = [
  {
    id: "owner-simon",
    name: "Simon Maina",
    email: "mainawaititu2021@gmail.com",
    password: "simon-2026",
    role: "CEO",
  },
  {
    id: "admin-ashanti",
    name: "Ashanti Kweyu",
    email: "kashiku789@gmail.com",
    password: "ashanti-2026",
    role: "Admin",
  },
  {
    id: "admin-ian",
    name: "Ian Kipchirchir",
    email: "iankipchirchir51@gmail.com",
    password: "ian-2026",
    role: "Admin",
  },
  {
    id: "admin-denis",
    name: "Denis Kipruto",
    email: "kypvega@gmail.com",
    password: "denis-2026",
    role: "Admin",
  },
];

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage("cdh-admin-user", null);

  const signIn = useCallback(
    (email, password) => {
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
    [setCurrentUser]
  );

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const value = useMemo(
    () => ({ currentUser, signIn, signOut }),
    [currentUser, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
