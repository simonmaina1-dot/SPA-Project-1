import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { seedAdmins, seedUsers } from "../data/seedData";

export const AuthContext = createContext(null);

const normalizeEmail = (value) => value.trim().toLowerCase();
const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState(seedAdmins);
  const [users, setUsers] = useState(seedUsers);
  const [adminsApiAvailable, setAdminsApiAvailable] = useState(false);
  const [usersApiAvailable, setUsersApiAvailable] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadAdmins = async () => {
      try {
        const res = await fetch("http://localhost:3002/admins");
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
        const res = await fetch("http://localhost:3002/users");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!isActive) return;
        setUsers(data);
        setUsersApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed users.", err);
        if (!isActive) return;
        setUsers(seedUsers);
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

      const safeUser = toSafeUser(user);
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

      const safeUser = toSafeUser(user);
      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [users]
  );

  const registerAccount = useCallback(
    async ({ name, email, password, role }) => {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);
      const trimmedPassword = password.trim();

      if (!trimmedName || !normalizedEmail || !trimmedPassword) {
        return { ok: false, message: "All fields are required." };
      }

      if (!"user donor admin".split(" ").includes(role)) {
        return { ok: false, message: "Select a valid role." };
      }

      const emailTaken =
        adminUsers.some(
          (admin) => admin.email.toLowerCase() === normalizedEmail
        ) ||
        users.some((account) => account.email.toLowerCase() === normalizedEmail);

      if (emailTaken) {
        return { ok: false, message: "Email already registered." };
      }

      if (role === "admin") {
        const newAdmin = {
          id: `a-${Date.now()}`,
          name: trimmedName,
          email: normalizedEmail,
          password: trimmedPassword,
          role: "admin",
        };

        setAdminUsers((prev) => [newAdmin, ...prev]);

        if (adminsApiAvailable) {
          try {
            const res = await fetch("http://localhost:3002/admins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newAdmin),
            });
            if (!res.ok) throw new Error("Failed to save admin account");
          } catch (err) {
            console.error(err);
            setAdminsApiAvailable(false);
          }
        }

        const safeUser = toSafeUser(newAdmin);
        setCurrentUser(safeUser);
        return { ok: true, user: safeUser };
      }

      const newUser = {
        id: `u-${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        password: trimmedPassword,
        role,
      };

      setUsers((prev) => [newUser, ...prev]);

      if (usersApiAvailable) {
        try {
          const res = await fetch("http://localhost:3002/users", {
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

      const safeUser = toSafeUser(newUser);
      setCurrentUser(safeUser);
      return { ok: true, user: safeUser };
    },
    [adminUsers, adminsApiAvailable, users, usersApiAvailable]
  );

  const switchRole = useCallback(
    async (nextRole) => {
      if (!currentUser) {
        return { ok: false, message: "Sign in to update your role." };
      }

      if (!"user donor".split(" ").includes(currentUser.role)) {
        return { ok: false, message: "Only users or donors can change roles." };
      }

      if (!"user donor".split(" ").includes(nextRole)) {
        return { ok: false, message: "Select either user or donor." };
      }

      if (currentUser.role === nextRole) {
        return { ok: false, message: "Role is already set." };
      }

      const updatedUser = { ...currentUser, role: nextRole };
      setUsers((prev) =>
        prev.map((account) =>
          account.id === currentUser.id ||
          account.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...account, role: nextRole }
            : account
        )
      );
      setCurrentUser(updatedUser);

      if (usersApiAvailable) {
        try {
          const res = await fetch(
            `http://localhost:3002/users/${currentUser.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: nextRole }),
            }
          );
          if (!res.ok) throw new Error("Failed to update user role");
        } catch (err) {
          console.error(err);
          setUsersApiAvailable(false);
        }
      }

      return { ok: true, user: updatedUser };
    },
    [currentUser, usersApiAvailable]
  );

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      signInAdmin,
      signInUser,
      registerAccount,
      switchRole,
      signOut,
    }),
    [currentUser, signInAdmin, signInUser, registerAccount, switchRole, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
