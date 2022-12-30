import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ValidateUserPermissions } from "../utils/validateUserPermissions";

type useCanParams = {
 permissions?: string[];
 roles?: string[];
}

export function useCan({ permissions, roles }: useCanParams | any) {
 const { user, isAuthenticated } = useContext(AuthContext);

 if (!isAuthenticated) {
  return false;
 }

 const userHasValidPermissions = ValidateUserPermissions({
  user,
  permissions,
  roles
 })

 return userHasValidPermissions;
}