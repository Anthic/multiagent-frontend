

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ApiError, ApiResponse } from "../types/api";


const API_BASED_URL=process.env.NEXT_PUBLIC_API_BASE_URL
const CSRF_COOKIE_NAME = 'csrf_token';

type RetryableRequest = InternalAxiosRequestConfig & {_retry ?: boolean}

// csrf token helper function

export const getCsrfToken =(): string| null =>{

  // make the server side rendering safe
   if (typeof document === "undefined") {
    return null
   }

   const cookie = document.cookie.split(';').map((c)=>c.trim().split('=')).find(([name]) => name === CSRF_COOKIE_NAME)

   return cookie ? decodeURIComponent(cookie[1]) : null
}

//handle error normalized
export const normalizeError=(error : AxiosError) : ApiError =>{
   const raw = error.response?.data as Partial<ApiError> | undefined;
    return{
        message: raw?.message ?? error.message ?? 'An unexpected error occurred',
        statusCode : error.response?.status ?? 0,
        errors : raw?.errors
    }
}


//axios instance factory
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
//store multiple 401 in queue
const processQueue=(error : Error | null)=>{
  failedQueue.forEach((pram)=>{
    if (error) {
      pram.reject(error)
    }else{
      pram.resolve(undefined)
    }

  })
  failedQueue=[]
}

const shouldSkipRefresh = (url?: string) => {
  if (!url) return false;

  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
  ].some((authPath) => url.includes(authPath));
}


// core client 
 const createAxiosInstance = (): AxiosInstance =>{
    const instance = axios.create({
        baseURL: API_BASED_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 15000
    })

    //request attach-csrf token and bearer Token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
     
      const unsafeMethods = ['post', 'put', 'patch', 'delete'];
      if (config.method && unsafeMethods.includes(config.method.toLowerCase())) {
        const csrf = getCsrfToken();
       
        if (csrf) config.headers['x-csrf-token'] = csrf;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );


instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryableRequest;


      if (
        error.response?.status === 401 &&
        !original?._retry &&
        !shouldSkipRefresh(original?.url)
      ) {
        if (isRefreshing) {
      
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => instance(original))
            .catch((err) => Promise.reject(err));
        }

        original._retry = true;
        isRefreshing = true;

        try {

          await instance.post('/auth/refresh-token');
          processQueue(null);
          return instance(original);
        } catch (refreshError) {
          processQueue(refreshError as Error);

     
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().clearAuth();

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(normalizeError(error as AxiosError));
    }
  );


  return instance;
}
export const axiosInstance = createAxiosInstance();


//api  unwarap helper --> make api warper
async function request<T>(
  fn: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> {
  const response = await fn();
  return response.data;
}

export const api = {
  get: <T>(url: string, params?: object) =>
    request<T>(() => axiosInstance.get(url, { params })),

  post: <T>(url: string, body?: unknown) =>
    request<T>(() => axiosInstance.post(url, body)),

  put: <T>(url: string, body?: unknown) =>
    request<T>(() => axiosInstance.put(url, body)),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(() => axiosInstance.patch(url, body)),

  delete: <T>(url: string) =>
    request<T>(() => axiosInstance.delete(url)),
};



