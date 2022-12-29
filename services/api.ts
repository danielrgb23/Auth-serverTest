import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue: any[] = [];

export const api = axios.create({
 baseURL: 'http://localhost:3333',
 headers: {
  Authorization: `Bearer ${cookies['nextauth.token']}`
 }
})

api.interceptors.response.use((response) => {
 return response;
}, (error: AxiosError | any) => {
 if (error.response.status === 401) {
  if (error.response.data?.code === 'token.expired') {
   cookies = parseCookies();

   const { 'nextauth.refreshToken': refreshToken } = cookies;
   const originalConfig: any = error.config;

   if (!isRefreshing) {
    isRefreshing = true;
    api.post('/refresh', {
     refreshToken,
    }).then(response => {
     const { token, refreshToken } = response.data;

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

     api.defaults.headers['Authorization'] = `Bearer ${token}`;

     failedRequestQueue.forEach(request => request.onSuccess(token))
     failedRequestQueue = []
    }).catch(err => {
     failedRequestQueue.forEach(request => request.onFailure(err))
     failedRequestQueue = []
    }).finally(() => {
     isRefreshing = false
    })
   }

   return new Promise<any>((resolve, reject) => {
    failedRequestQueue.push({
     onSuccess: (token: string) => {
      originalConfig.headers['Authorization'] = `Bearer ${token}`

      resolve(api(originalConfig))
     }, 
     onFailure: (err: AxiosError) => {
      reject(err)
     },
    })
   })
  } else {
   //deslogar o usuario
  }
 }
})