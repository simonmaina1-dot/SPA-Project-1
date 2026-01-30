import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { seedAdmins, seedUsers } from "../data/seedData";

export const AuthContext = createContext(null);

const normalizeEmail = (value) => value.trim().toLowerCase();
const normalizeUserRole = (role) => (role === "donor" || !role ? "user" : role);
const normalizeUsers = (list = []) =>
  list.map((user) => ({
    ...user,
    role: normalizeUserRole(user.role),
  }));
const toSafeUser = (user, overrides = {}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  ...overrides,
});

function useAuthValue({
  currentUser,
  signInAdmin,
  signInUser,
  registerAccount,
  signOut,
}) {
  return useMemo(
    () => ({
      currentUser,
      signInAdmin,
      signInUser,
      registerAccount,
      signOut,
    }),
    [currentUser, signInAdmin, signInUser, registerAccount, signOut]
  );
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState(seedAdmins);
  const [users, setUsers] = useState(() => normalizeUsers(seedUsers));
  const [adminsApiAvailable, setAdminsApiAvailable] = useState(false);
  const [usersApiAvailable, setUsersApiAvailable] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadAdmins = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch('/data/collections/admins.json');
=======
        const res = await fetch("/admins");
>>>>>>> main
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setAdminUsers(data);
        setAdminsApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed admins.", err);
        if (!isActive) return;
        setAdminUsers(seedAdmins);
        setAdminsApiAvailable(false);
      }
    };

    loadAdmins();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadUsers = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch('/data/collections/users.json');
=======
        const res = await fetch("/users");
>>>>>>> main
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setUsers(normalizeUsers(data));
        setUsersApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed users.", err);
        if (!isActive) return;
        setUsers(normalizeUsers(seedUsers));
        setUsersApiAvailable(false);
      }
    };

    loadUsers();
    return () => {
      isActive = false;
    };
  }, []);

  const signInAdmin = useCallback(
    (email, password) => {
      const normalizedEmail = normalizeEmail(email);
      const user = adminUsers.find(
        (admin) =>
          admin.email.toLowerCase() === normalizedEmail &&
          admin.password === password
      );

      if (!user) {
        return { ok: false, message: "Invalid admin credentials." };
      }

      const safeUser = toSafeUser(user, { isAdmin: true });
      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [adminUsers]
  );

  const signInUser = useCallback(
    (email, password) => {
      const normalizedEmail = normalizeEmail(email);
      const user = users.find(
        (account) =>
          account.email.toLowerCase() === normalizedEmail &&
          account.password === password
      );

      if (!user) {
        return { ok: false, message: "Invalid email or password." };
      }

      const safeUser = toSafeUser(user, { isAdmin: false });
      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [users]
  );

  const registerAccount = useCallback(
    async ({ name, email, password }) => {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);
      const trimmedPassword = password.trim();

      if (!trimmedName || !normalizedEmail || !trimmedPassword) {
        return { ok: false, message: "All fields are required." };
      }

      const emailTaken =
        adminUsers.some(
          (admin) => admin.email.toLowerCase() === normalizedEmail
        ) ||
        users.some((account) => account.email.toLowerCase() === normalizedEmail);

      if (emailTaken) {
        return { ok: false, message: "Email already registered." };
      }

      const newUser = {
        id: `u-${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        password: trimmedPassword,
        role: "user",
      };

      setUsers((prev) => [newUser, ...prev]);

      if (usersApiAvailable) {
        try {
          const res = await fetch("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
          if (!res.ok) throw new Error("Failed to save user account");
        } catch (err) {
          console.error(err);
          setUsersApiAvailable(false);
        }
      }

      const safeUser = toSafeUser(newUser, { isAdmin: false });
      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [adminUsers, users, usersApiAvailable]
  );

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useAuthValue({
    currentUser,
    signInAdmin,
    signInUser,
    registerAccount,
    signOut,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
