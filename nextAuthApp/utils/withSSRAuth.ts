import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from "jwt-decode";

import { AuthTokenError } from "../services/errors/AuthTokenError";
import { ValidateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
 permissions: string[];
 roles: string[];
}

export function withSSRAuth<P extends { [key: string]: any; }>
 (fn: GetServerSideProps<P>, options?: WithSSRAuthOptions | any): GetServerSideProps {
 return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
  const cookies = parseCookies(ctx);
  const token = cookies['nextauth.token'];

  if (!token) {
   return {
    redirect: {
     destination: '/',
     permanent: false,
    }
   }
  }

  if (options) {
   const user = decode<{ permissions: string[], roles: string[] }>(token);
   const { permissions, roles } = options;

   const userHasValidPermissions = ValidateUserPermissions({
    user,
    permissions,
    roles
   })

   if (!userHasValidPermissions) {
    return {
     redirect: {
      destination: '/dashboard',
      permanent: false,
     }
    }
   }
  }

  try {
   return await fn(ctx);
  } catch (err) {
   if (err instanceof AuthTokenError) {
    destroyCookie(ctx, 'nextauth.token')
    destroyCookie(ctx, 'nextauth.refreshToken')

    return {
     redirect: {
      destination: '/',
      permanent: false
     }
    }
   }

   return {
    redirect: {
     destination: "/error", // Em caso de um erro não esperado, você pode redirecionar para uma página publica de erro genérico
     permanent: false,
    },
   };
  }
 }
}