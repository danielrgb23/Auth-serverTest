type User = {
 email: string;
 permissions: string[];
 roles: string[];
}

type ValidateUserPermissionsParams = {
 user: User;
 permissions?: string[];
 roles?: string[];
}

export function ValidateUserPermissions({
 user,
 permissions,
 roles
}: ValidateUserPermissionsParams | any) {
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