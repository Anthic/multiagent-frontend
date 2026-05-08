

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ApiError, ApiResponse } from "../types/api";
import { authStore } from "../store/authStore";


const API_BASED_URL=process.env.NEXT_PUBLIC_API_BASE_URL
const CSRF_COOKIE_NAME = 'csrf_token';

type RetryableRequest = InternalAxiosRequestConfig & {_retry ?: boolean}

// helper function

export const getCsrfToken =(): string| null =>{
   if (typeof document === "undefined") {
    return null
   }

   const match = document.cookie.split(';').map((c)=>c.trim().split('=')).find(([name]) => name === CSRF_COOKIE_NAME)

   return match ? decodeURIComponent(match[1]) : null
}


export const normalizeError=(error : AxiosError) : ApiError =>{
    const raw = error.response?.data as Partial<ApiError> | undefined
    return{
        message: raw?.message ?? error.message ?? 'An unexpected error occurred',
        statusCode : error.response?.status ?? 0,
        errors : raw?.errors
    }
}


// core client 
 const createAxiosInstance = (): AxiosInstance =>{
    const instance = axios.create({
        baseURL: API_BASED_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    //request attach-csrf token and bearer Token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const csrf = getCsrfToken();
      if (csrf) config.headers['x-csrf-token'] = csrf;

      const { accessToken } = authStore.getState();
      if (accessToken) config.headers['Authorization'] = `Bearer ${accessToken}`;

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryableRequest;

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;

        try {
          const { data } = await instance.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            '/auth/refresh-token'
          );
          authStore.getState().setAccessToken(data.data.accessToken)
          return instance(original);
        } catch {
          authStore.getState().logout();
          window.location.href = '/login';
        }
      }

      return Promise.reject(normalizeError(error as AxiosError));
    }
  );

  return instance;
}
export const axiosInstance = createAxiosInstance();

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



