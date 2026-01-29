import { Navigate } from "react-router-dom";
import AdminLoginView from "./AdminLoginView";

export default function AdminAccessGuard({
  currentUser,
  credentials,
  showPassword,
  errorMessage,
  onChange,
  onTogglePassword,
  onSubmit,
  children,
}) {
  if (currentUser && !currentUser.isAdmin) {
    return <Navigate to="/account" replace />;
  }

  if (!currentUser) {
    return (
      <AdminLoginView
        credentials={credentials}
        showPassword={showPassword}
        errorMessage={errorMessage}
        onChange={onChange}
        onTogglePassword={onTogglePassword}
        onSubmit={onSubmit}
      />
    );
  }

  return children;
}
