import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

type useCanParams = {
 permissions?: string[];
 roles?: string[];
}

export function useCan({ permissions, roles }: useCanParams | any) {
 const { user, isAuthenticated } = useContext(AuthContext);

 if (!isAuthenticated) {
  return false;
 }

 if (permissions?.length > 0) {
  const hasAllPermissions = permissions.every((permission: any) => {
   return user.permissions.includes(permission)
  });

  if (!hasAllPermissions) {
   return false;
  }
 }

 if (roles?.length > 0) {
  const hasAllRoles = permissions.some((role: any) => {
   return user.permissions.includes(role)
  });

  if (!hasAllRoles) {
   return false;
  }
 }

 return true;
}