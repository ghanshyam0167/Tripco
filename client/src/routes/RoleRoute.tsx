import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  allowedRoles: Role[];
}

const RoleRoute = ({ children, allowedRoles }: Props) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;