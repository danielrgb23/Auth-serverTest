import { createContext, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import Router from 'next/router';

import { api } from "../services/apiClient";

type User = {
 email: string;
 permissions: string[];
 roles: string[];
}

type SignInCredentials = {
 email: string;
 password: string;
}

type AuthContextData = {
 signIn: (credentials: SignInCredentials) => Promise<void>;
 signOut: () => void;
 user: User | any;
 isAuthenticated: boolean;
 broadcastAuth: MutableRefObject<BroadcastChannel>;
}

type AuthProviderProps = {
 children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);


export const signOut = () => {
 destroyCookie(undefined, 'nextauth.token');
 destroyCookie(undefined, 'nextauth.refreshtoken');

 Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
 const [user, setUser] = useState<User>();
 const isAuthenticated = !!user;
 const broadcastAuth = useRef<BroadcastChannel | any>(null);

 useEffect(() => {
  broadcastAuth.current = new BroadcastChannel("auth");

  broadcastAuth.current.onmessage = (message: any) => {
    switch (message.data) {
      case "signOut":
        signOut();
        break;

      default:
        break;
    }
  };
}, [broadcastAuth]);

 useEffect(() => {
  const { 'nextauth.token': token } = parseCookies()

  if (token) {
   api.get('/me').then(response => {
    const { email, permissions, roles } = response.data

    setUser({ email, permissions, roles })
   }).catch(() => {
    signOut()
   })
  }
 }, []);

 async function signIn({ email, password }: SignInCredentials) {
  try {
   const response = await api.post('sessions', {
    email,
    password
   })

   const { permissions, roles, token, refreshToken } = response.data;

   setCookie(undefined, 'nextauth.token', token,
    {
     maxAge: 60 * 60 * 24 * 30,
     path: '/'
    })

   setCookie(undefined, 'nextauth.refreshToken', refreshToken,
    {
     maxAge: 60 * 60 * 24 * 30,
     path: '/'
    })

   setUser({
    email,
    permissions,
    roles
   })

   api.defaults.headers['Authorization'] = `Bearer ${token}`

   Router.push('/dashboard')
  } catch (err) {
   console.log(err)
  }
 }

 return (
  <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user, broadcastAuth }} >
   {children}
  </AuthContext.Provider>
 )
}